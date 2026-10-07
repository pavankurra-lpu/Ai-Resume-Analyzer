import { NextRequest, NextResponse } from "next/server";
import { parseResumeWithAI } from "@/lib/resumeParser";
import { checkRateLimit } from "@/lib/rateLimit";
import { dataStore } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`parse_${ip}`, 15, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json({ error: "reportId is required" }, { status: 400 });
    }

    const report = await dataStore.getReport(reportId);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if a Resume already exists for this report
    const existingResume = await dataStore.findResumeByReport(reportId);
    if (existingResume) {
      const parsedContent = JSON.parse(existingResume.contentJson);
      return NextResponse.json({
        resumeId: existingResume.id,
        resume: parsedContent,
        templateId: existingResume.templateId,
        explanationLanguage: existingResume.explanationLanguage,
        status: existingResume.status,
      });
    }

    // Parse the text into structured JSON
    const textToParse = report.rawText || report.rawTextPreview || "Software Engineer Resume";
    const { resume } = await parseResumeWithAI(textToParse);

    // Overwrite contact with known verified lead details if missing or empty
    if (!resume.contact.fullName && report.lead?.name) resume.contact.fullName = report.lead.name;
    if (!resume.contact.email && report.lead?.email) resume.contact.email = report.lead.email;
    if (!resume.contact.phone && report.lead?.phone) resume.contact.phone = report.lead.phone;
    if (!resume.headline && report.lead?.targetRole) resume.headline = report.lead.targetRole;

    const newResume = await dataStore.createResume({
      leadId: report.leadId,
      baseReportId: report.id,
      content: resume,
      templateId: "modern",
      explanationLanguage: "en",
      status: "Draft",
    });

    return NextResponse.json({
      resumeId: newResume.id,
      resume,
      templateId: newResume.templateId,
      explanationLanguage: newResume.explanationLanguage,
      status: newResume.status,
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume into structured editor." },
      { status: 500 }
    );
  }
}
