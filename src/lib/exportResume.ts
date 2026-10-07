import PDFDocument from "pdfkit";
import { StructuredResume } from "./resumeTypes";

export async function generatePdf(
  resume: StructuredResume,
  templateId: string = "modern"
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const isModern = templateId === "modern";
      const primaryColor = isModern ? "#2B3A92" : "#1F2937";
      const textColor = "#222222";
      const mutedColor = "#555555";

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 36, bottom: 36, left: 36, right: 36 },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Header: Name
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text((resume.contact.fullName || "Candidate Name").toUpperCase(), { align: "center" });

      doc.moveDown(0.2);

      // Contact Line
      const contactParts = [
        resume.contact.email,
        resume.contact.phone ? `+91 ${resume.contact.phone}` : "",
        resume.contact.city,
        resume.contact.linkedin ? "LinkedIn" : "",
        resume.contact.github ? "GitHub" : "",
        resume.contact.portfolio ? "Portfolio" : "",
      ].filter(Boolean);

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(mutedColor)
        .text(contactParts.join("   |   "), { align: "center" });

      doc.moveDown(0.6);

      function sectionHeader(title: string) {
        doc.moveDown(0.5);
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text(title.toUpperCase());
        // Underline bar
        const y = doc.y;
        doc
          .strokeColor(isModern ? "#E2E8F0" : "#CCCCCC")
          .lineWidth(0.8)
          .moveTo(36, y)
          .lineTo(doc.page.width - 36, y)
          .stroke();
        doc.moveDown(0.3);
      }

      // Summary
      if (resume.summary && resume.summary.trim()) {
        sectionHeader("Professional Summary");
        doc
          .fontSize(9.5)
          .font("Helvetica")
          .fillColor(textColor)
          .text(resume.summary.trim(), { align: "left", lineGap: 2 });
      }

      // Education
      if (resume.education.length > 0) {
        sectionHeader("Education");
        resume.education.forEach((edu) => {
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor(textColor)
            .text(edu.degree || "Degree", { continued: true })
            .font("Helvetica")
            .fillColor(mutedColor)
            .text(`   ${edu.endYear ? `(${edu.endYear})` : ""}`, { align: "right" });

          const sub = [edu.institution, edu.grade ? `Grade: ${edu.grade}` : ""].filter(Boolean).join("  |  ");
          if (sub) {
            doc.fontSize(9).font("Helvetica-Oblique").fillColor(mutedColor).text(sub);
          }
          doc.moveDown(0.2);
        });
      }

      // Skills
      if (resume.skills.length > 0) {
        sectionHeader("Technical Skills");
        resume.skills.forEach((sk) => {
          if (sk.items.length > 0) {
            doc
              .fontSize(9.5)
              .font("Helvetica-Bold")
              .fillColor(textColor)
              .text(`${sk.group}: `, { continued: true })
              .font("Helvetica")
              .fillColor(textColor)
              .text(sk.items.join(", "));
            doc.moveDown(0.15);
          }
        });
      }

      // Projects
      if (resume.projects.length > 0) {
        sectionHeader("Projects");
        resume.projects.forEach((proj) => {
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor(textColor)
            .text(proj.name || "Project Name", { continued: Boolean(proj.techStack) });

          if (proj.techStack) {
            doc
              .font("Helvetica")
              .fontSize(8.5)
              .fillColor(mutedColor)
              .text(`   [${proj.techStack}]`);
          }

          proj.bullets.forEach((b) => {
            doc
              .fontSize(9)
              .font("Helvetica")
              .fillColor(textColor)
              .text(`•  ${b}`, { indent: 8, lineGap: 1.5 });
          });
          doc.moveDown(0.2);
        });
      }

      // Experience
      if (resume.experience.length > 0) {
        sectionHeader("Work Experience");
        resume.experience.forEach((exp) => {
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor(textColor)
            .text(exp.role || "Role", { continued: true })
            .font("Helvetica")
            .fillColor(mutedColor)
            .text(`   ${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}`, { align: "right" });

          if (exp.company) {
            doc
              .fontSize(9)
              .font("Helvetica-Oblique")
              .fillColor(mutedColor)
              .text(`${exp.company}${exp.location ? `, ${exp.location}` : ""}`);
          }

          exp.bullets.forEach((b) => {
            doc
              .fontSize(9)
              .font("Helvetica")
              .fillColor(textColor)
              .text(`•  ${b}`, { indent: 8, lineGap: 1.5 });
          });
          doc.moveDown(0.2);
        });
      }

      // Certifications
      if (resume.certifications.length > 0) {
        sectionHeader("Certifications");
        resume.certifications.forEach((c) => {
          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor(textColor)
            .text(`•  ${c.name} - ${c.issuer} (${c.year})`, { indent: 8 });
        });
      }

      // Achievements
      if (resume.achievements.length > 0) {
        sectionHeader("Achievements");
        resume.achievements.forEach((a) => {
          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor(textColor)
            .text(`•  ${a}`, { indent: 8 });
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
