import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generatePdf } from "@/lib/exportResume";
import { StructuredResume } from "@/lib/resumeTypes";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId") || "modern";

    const resumeRecord = await prisma.resume.findUnique({
      where: { id },
      include: { lead: true },
    });

    if (!resumeRecord) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const content: StructuredResume = JSON.parse(resumeRecord.contentJson);

    const nameParts = (content.contact.fullName || resumeRecord.lead?.name || "Candidate")
      .trim()
      .split(/\s+/);
    const firstName = nameParts[0] || "Candidate";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const targetRole = (content.headline || resumeRecord.lead?.targetRole || "Resume")
      .replace(/[^a-zA-Z0-9]/g, "_");

    const filename = lastName
      ? `${firstName}_${lastName}_${targetRole}.pdf`
      : `${firstName}_${targetRole}.pdf`;

    const pdfBuffer = await generatePdf(content, templateId);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export resume error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume export file." },
      { status: 500 }
    );
  }
}
