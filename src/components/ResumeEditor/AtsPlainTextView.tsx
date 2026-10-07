"use client";

import React, { useState } from "react";
import { StructuredResume } from "@/lib/resumeTypes";
import { Copy, Check, Terminal, ShieldCheck } from "lucide-react";

interface AtsPlainTextViewProps {
  resume: StructuredResume;
}

export default function AtsPlainTextView({ resume }: AtsPlainTextViewProps) {
  const [copied, setCopied] = useState(false);

  // Generate strict text representation
  const lines: string[] = [];
  lines.push((resume.contact.fullName || "FULL NAME").toUpperCase());
  lines.push(
    [
      resume.contact.email,
      resume.contact.phone ? `+91 ${resume.contact.phone}` : "",
      resume.contact.city,
      resume.contact.linkedin,
      resume.contact.github,
      resume.contact.portfolio,
    ].filter(Boolean).join(" | ")
  );

  if (resume.headline) lines.push(`TARGET ROLE: ${resume.headline}`);

  if (resume.summary) {
    lines.push("\nSUMMARY");
    lines.push(resume.summary.trim());
  }

  if (resume.education.length > 0) {
    lines.push("\nEDUCATION");
    resume.education.forEach((e) => {
      lines.push(`${e.degree} - ${e.institution} (${e.endYear}) ${e.grade ? `| ${e.grade}` : ""}`);
    });
  }

  if (resume.skills.length > 0) {
    lines.push("\nSKILLS");
    resume.skills.forEach((s) => {
      lines.push(`${s.group}: ${s.items.join(", ")}`);
    });
  }

  if (resume.projects.length > 0) {
    lines.push("\nPROJECTS");
    resume.projects.forEach((p) => {
      lines.push(`${p.name} ${p.techStack ? `[${p.techStack}]` : ""}`);
      p.bullets.forEach((b) => lines.push(`* ${b}`));
    });
  }

  if (resume.experience.length > 0) {
    lines.push("\nWORK EXPERIENCE");
    resume.experience.forEach((exp) => {
      lines.push(`${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate || "Present"})`);
      exp.bullets.forEach((b) => lines.push(`* ${b}`));
    });
  }

  if (resume.certifications.length > 0) {
    lines.push("\nCERTIFICATIONS");
    resume.certifications.forEach((c) => lines.push(`* ${c.name} - ${c.issuer} (${c.year})`));
  }

  if (resume.achievements.length > 0) {
    lines.push("\nACHIEVEMENTS");
    resume.achievements.forEach((a) => lines.push(`* ${a}`));
  }

  const plainText = lines.join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
        <Terminal className="w-5 h-5 text-lt-blue flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <strong className="text-lt-blue block">What ATS Software Reads:</strong>
          <p className="leading-relaxed">
            This is the exact plain text that automated parsers (Workday, Taleo, Greenhouse) see after extracting your file. Notice the clear headings and standard bullets with zero broken tables.
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold transition-all shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Plain Text"}</span>
        </button>

        <pre className="p-5 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto max-h-[600px] border border-slate-800">
          {plainText}
        </pre>
      </div>
    </div>
  );
}
