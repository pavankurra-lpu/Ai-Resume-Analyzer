import { NextRequest, NextResponse } from "next/server";
import { StructuredResume } from "@/lib/resumeTypes";
import { checkRateLimit } from "@/lib/rateLimit";
import { scoreResume, convertScoringToReport } from "@/lib/scoring";
import { dataStore } from "@/lib/data";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`rescore_${ip}`, 20, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many rescore requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const resumeRecord = await dataStore.getResume(id);
    if (!resumeRecord) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const content: StructuredResume = JSON.parse(resumeRecord.contentJson);
    const targetRole = resumeRecord.lead?.targetRole || content.headline || undefined;
    const experienceLevel = resumeRecord.lead?.experienceLevel || "Fresher";

    // Run deterministic scoring engine (Single Source of Truth)
    const scoring = scoreResume(content, {
      experienceLevel,
      targetRole,
    });

    const reportData = convertScoringToReport(scoring, content, {
      targetRole,
      jobDescription: resumeRecord.lead?.jobDescription || undefined,
    });

    // Create a new updated Report linked to lead
    const newReport = await dataStore.createReport({
      leadId: resumeRecord.leadId,
      overallScore: scoring.totalScore,
      grade: scoring.grade,
      summary: scoring.summary,
      categoriesJson: JSON.stringify(reportData.categories),
      topQuickWinsJson: JSON.stringify(reportData.top_quick_wins),
      jdMatchJson: reportData.jd_match ? JSON.stringify(reportData.jd_match) : null,
      atsChecksJson: JSON.stringify(reportData.ats_checks),
      suggestedCoursesJson: JSON.stringify(reportData.suggested_courses),
      rawTextPreview: content.summary || "Structured Resume Rescore",
      rawText: JSON.stringify(content),
      isDemo: true,
    });

    // Get previous score for comparison
    const previousScore = resumeRecord.baseReport?.overallScore || scoring.totalScore;
    const scoreDiff = scoring.totalScore - previousScore;

    return NextResponse.json({
      success: true,
      reportId: newReport.id,
      overallScore: scoring.totalScore,
      previousScore,
      scoreDiff,
      grade: scoring.grade,
      summary: scoring.summary,
      checkpoints: scoring.checkpoints,
      categories: scoring.categories,
      redIssuesCount: scoring.redIssuesCount,
      amberIssuesCount: scoring.amberIssuesCount,
    });
  } catch (error) {
    console.error("Rescore error:", error);
    return NextResponse.json(
      { error: "Failed to recalculate resume score." },
      { status: 500 }
    );
  }
}
