import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data";
import { generatePdf } from "@/lib/exportResume";
import { runAtsParseTest } from "@/lib/atsParseTest";
import { StructuredResume } from "@/lib/resumeTypes";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId") || "modern";
    const isTestRequest = searchParams.get("test") === "true";

    const resumeRecord = await dataStore.getResume(id);
    if (!resumeRecord) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const content: StructuredResume = JSON.parse(resumeRecord.contentJson);

    // If testOnly=true, run real ATS Parse Test and return JSON verification
    if (isTestRequest) {
      const testResult = await runAtsParseTest(content, templateId);
      return NextResponse.json(testResult);
    }

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
