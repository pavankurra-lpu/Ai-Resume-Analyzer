import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/parseFile";
import { LeadSchema } from "@/lib/schema";
import { analyzeResumeWithAI } from "@/lib/anthropic";
import { checkRateLimit } from "@/lib/rateLimit";
import { dataStore } from "@/lib/data";

export const maxDuration = 60; // Allow sufficient time for analysis

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting (10 requests per IP per hour)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit reached (maximum 10 analyses per hour). Please try again shortly.",
        },
        { status: 429 }
      );
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const rawFile = formData.get("file") as File | null;
    const rawText = (formData.get("resumeText") as string) || "";
    const name = (formData.get("name") as string) || "";
    const phone = (formData.get("phone") as string) || "";
    const email = (formData.get("email") as string) || "";
    const collegeOrCompany = (formData.get("collegeOrCompany") as string) || "";
    const experienceLevel = (formData.get("experienceLevel") as string) || "Fresher";
    const targetRole = (formData.get("targetRole") as string) || "";
    const jobDescription = (formData.get("jobDescription") as string) || "";
    const consent = formData.get("consent") !== "false";

    // 3. Validate Lead details with Zod (name, phone, email are optional)
    const leadValidation = LeadSchema.safeParse({
      name,
      phone,
      email,
      collegeOrCompany,
      experienceLevel,
      targetRole,
      jobDescription,
      consent,
    });

    if (!leadValidation.success) {
      const firstIssue = leadValidation.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const leadData = leadValidation.data;

    // 4. Extract Text
    let extractedText = "";

    if (rawFile && rawFile.size > 0) {
      // Check file size (5MB max)
      const MAX_BYTES = 5 * 1024 * 1024;
      if (rawFile.size > MAX_BYTES) {
        return NextResponse.json(
          { error: "File size exceeds 5 MB limit. Please upload a smaller file." },
          { status: 400 }
        );
      }

      const fileName = rawFile.name.toLowerCase();
      const isPdf = fileName.endsWith(".pdf") || rawFile.type.includes("pdf");
      const isDocx =
        fileName.endsWith(".docx") ||
        rawFile.type.includes("word") ||
        rawFile.type.includes("document");

      if (!isPdf && !isDocx) {
        return NextResponse.json(
          {
            error:
              "Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).",
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await rawFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        extractedText = await extractTextFromFile(buffer, fileName);
      } catch (err: unknown) {
        console.error("Text extraction failed:", err);
        return NextResponse.json(
          {
            error:
              "Could not read content from this file. It may be corrupt or encrypted. Please try another file or paste text.",
          },
          { status: 400 }
        );
      }
    } else if (rawText.trim().length > 0) {
      extractedText = rawText.trim();
    } else {
      return NextResponse.json(
        { error: "Please upload a resume file (PDF/DOCX) or paste your resume text." },
        { status: 400 }
      );
    }

    // 5. Check if extracted text meets the minimum character threshold
    if (extractedText.length < 150) {
      return NextResponse.json(
        {
          error:
            "We could not read text from this file. It may be a scanned image. Please upload a text-based PDF or DOCX, or paste your text.",
          scannedImageDetected: true,
        },
        { status: 400 }
      );
    }

    // 6. Call deterministic analysis engine
    const { result, isDemo } = await analyzeResumeWithAI({
      resumeText: extractedText,
      targetRole: leadData.targetRole,
      jobDescription: leadData.jobDescription,
      experienceLevel: leadData.experienceLevel,
    });

    // 7. Store Lead and persist Report via dataStore abstraction
    const lead = await dataStore.createLead({
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email,
      collegeOrCompany: leadData.collegeOrCompany,
      experienceLevel: leadData.experienceLevel,
      targetRole: leadData.targetRole,
      jobDescription: leadData.jobDescription,
    });

    const rawPreview = extractedText.slice(0, 400).replace(/[\r\n]+/g, " ");

    const report = await dataStore.createReport({
      leadId: lead.id,
      overallScore: result.overall_score,
      grade: result.grade,
      summary: result.summary,
      categoriesJson: JSON.stringify(result.categories),
      topQuickWinsJson: JSON.stringify(result.top_quick_wins),
      jdMatchJson: result.jd_match ? JSON.stringify(result.jd_match) : null,
      atsChecksJson: JSON.stringify(result.ats_checks),
      suggestedCoursesJson: JSON.stringify(result.suggested_courses),
      rawTextPreview: rawPreview,
      rawText: extractedText,
      isDemo,
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      isDemo,
    });
  } catch (error: unknown) {
    console.error("API Analyze error:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze resume";
    return NextResponse.json(
      { error: message || "An unexpected error occurred during analysis." },
      { status: 500 }
    );
  }
}
