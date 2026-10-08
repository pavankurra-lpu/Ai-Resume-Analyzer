import pdfParse from "pdf-parse";
import { generatePdf } from "./exportResume";
import { StructuredResume } from "./resumeTypes";

export interface AtsParseCheckItem {
  name: string;
  passed: boolean;
  message: string;
  fixField?: string;
}

export interface AtsParseTestResult {
  passed: boolean;
  checks: AtsParseCheckItem[];
  extractedTextPreview: string;
}

export async function runAtsParseTest(
  resume: StructuredResume,
  templateId: string = "modern"
): Promise<AtsParseTestResult> {
  // 1. Generate text-based PDF
  const pdfBuffer = await generatePdf(resume, templateId);

  // 2. Extract plain text using pdf-parse
  const parsed = await pdfParse(pdfBuffer);
  const text = parsed.text || "";
  const lowerText = text.toLowerCase();

  const checks: AtsParseCheckItem[] = [];

  // Check 1: Candidate Name
  const fullName = (resume.contact?.fullName || "").trim();
  const namePassed = Boolean(fullName && lowerText.includes(fullName.toLowerCase()));
  checks.push({
    name: "Candidate Name Extracted",
    passed: namePassed,
    message: namePassed
      ? `Successfully extracted "${fullName}" from document header.`
      : "Candidate name could not be parsed as top-level plain text.",
    fixField: "contact.fullName",
  });

  // Check 2: Direct Plain-Text Email
  const email = (resume.contact?.email || "").trim().toLowerCase();
  const emailPassed = Boolean(email && lowerText.includes(email));
  checks.push({
    name: "Direct Email Address",
    passed: emailPassed,
    message: emailPassed
      ? `Direct email "${email}" readable by automated parsers.`
      : "Email address is missing or not readable as plain text in document body.",
    fixField: "contact.email",
  });

  // Check 3: Phone Number
  const rawPhone = (resume.contact?.phone || "").replace(/[^0-9]/g, "");
  const phonePassed = Boolean(rawPhone.length >= 10 && text.replace(/[^0-9]/g, "").includes(rawPhone));
  checks.push({
    name: "10-Digit Mobile Number",
    passed: phonePassed,
    message: phonePassed
      ? "Phone number successfully indexed in body."
      : "Valid 10-digit telephone number not detected in body text.",
    fixField: "contact.phone",
  });

  // Check 4: Section Headings in Linear Order
  const headingsExpected: { name: string; label: string; field: string }[] = [];
  if (resume.summary?.trim()) {
    headingsExpected.push({ name: "summary", label: "professional summary", field: "summary" });
  }
  if (resume.education && resume.education.length > 0) {
    headingsExpected.push({ name: "education", label: "education", field: "education.0.degree" });
  }
  if (resume.skills && resume.skills.length > 0) {
    headingsExpected.push({ name: "skills", label: "technical skills", field: "skills.0.items" });
  }
  if (resume.projects && resume.projects.length > 0) {
    headingsExpected.push({ name: "projects", label: "projects", field: "projects.0.name" });
  }
  if (resume.experience && resume.experience.length > 0) {
    headingsExpected.push({ name: "experience", label: "work experience", field: "experience.0.role" });
  }

  let orderPassed = true;
  let lastIndex = -1;
  const missingHeadings: string[] = [];

  for (const h of headingsExpected) {
    const idx = lowerText.indexOf(h.label);
    if (idx === -1) {
      // try alternate word
      const altIdx = lowerText.indexOf(h.name);
      if (altIdx === -1) {
        missingHeadings.push(h.name);
        orderPassed = false;
        continue;
      }
      if (altIdx < lastIndex) {
        orderPassed = false;
      }
      lastIndex = altIdx;
    } else {
      if (idx < lastIndex) {
        orderPassed = false;
      }
      lastIndex = idx;
    }
  }

  checks.push({
    name: "Standard Section Headings in Order",
    passed: orderPassed && headingsExpected.length >= 2,
    message: orderPassed
      ? `All ${headingsExpected.length} section headings parsed in logical reading order.`
      : missingHeadings.length > 0
      ? `Could not detect headings: ${missingHeadings.join(", ")}.`
      : "Section headings appeared out of standard order in parsed text stream.",
    fixField: "sectionOrder",
  });

  // Check 5: Selectable Vector Text Quality (minimum 150 characters, no corrupt binary markers)
  const isSelectable = text.length > 150 && !text.includes("\u0000");
  checks.push({
    name: "Selectable Text Stream (No Raster Layers)",
    passed: isSelectable,
    message: isSelectable
      ? `Clean vector text layer with ${text.length} characters parsed.`
      : "PDF stream is empty or contains non-selectable binary layers.",
    fixField: "layout",
  });

  const overallPassed = checks.every((c) => c.passed);

  return {
    passed: overallPassed,
    checks,
    extractedTextPreview: text.slice(0, 500).trim(),
  };
}
