import { NextRequest, NextResponse } from "next/server";
import { StructuredResumeSchema } from "@/lib/resumeTypes";
import { dataStore } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const resume = await dataStore.getResume(id);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const content = JSON.parse(resume.contentJson);

    return NextResponse.json({
      id: resume.id,
      resume: content,
      lead: resume.lead
        ? {
            id: resume.lead.id,
            name: resume.lead.name,
            email: resume.lead.email,
            phone: resume.lead.phone,
            targetRole: resume.lead.targetRole,
            experienceLevel: resume.lead.experienceLevel,
            collegeOrCompany: resume.lead.collegeOrCompany,
          }
        : null,
      baseReport: resume.baseReport
        ? {
            id: resume.baseReport.id,
            overallScore: resume.baseReport.overallScore,
            grade: resume.baseReport.grade,
            topQuickWins: JSON.parse(resume.baseReport.topQuickWinsJson || "[]"),
            jdMatch: resume.baseReport.jdMatchJson
              ? JSON.parse(resume.baseReport.jdMatchJson)
              : null,
          }
        : null,
      templateId: resume.templateId,
      explanationLanguage: resume.explanationLanguage,
      status: resume.status,
      versions: resume.versions.map((v) => ({
        id: v.id,
        createdAt: v.createdAt,
      })),
      updatedAt: resume.updatedAt,
    });
  } catch (error) {
    console.error("Fetch resume error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { content, templateId, explanationLanguage, status } = body;

    const validatedContent = content ? StructuredResumeSchema.parse(content) : undefined;

    const updated = await dataStore.updateResume(id, {
      content: validatedContent!,
      templateId,
      explanationLanguage,
      status,
    });

    return NextResponse.json({
      success: true,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("Update resume error:", error);
    return NextResponse.json(
      { error: "Failed to update resume." },
      { status: 500 }
    );
  }
}
