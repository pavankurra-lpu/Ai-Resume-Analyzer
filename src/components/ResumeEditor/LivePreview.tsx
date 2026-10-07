"use client";

import React, { useRef, useEffect, useState } from "react";
import { StructuredResume } from "@/lib/resumeTypes";
import { CheckCircle2, AlertTriangle, Sparkles, Layers } from "lucide-react";

interface LivePreviewProps {
  resume: StructuredResume;
  templateId?: string;
  autoFit?: boolean;
}

export default function LivePreview({
  resume,
  templateId = "modern",
  autoFit = false,
}: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [estimatedPages, setEstimatedPages] = useState(1);
  const [spillLines, setSpillLines] = useState(0);

  const isModern = templateId === "modern";
  const primaryColor = isModern ? "text-lt-blue" : "text-slate-900";
  const headingBorder = isModern ? "border-b border-lt-blue/30" : "border-b border-slate-300";

  useEffect(() => {
    if (!containerRef.current) return;
    const scrollHeight = containerRef.current.scrollHeight;
    // Standard A4 simulated height around 1050px in container
    const a4Height = 1050;
    if (scrollHeight <= a4Height) {
      setEstimatedPages(1);
      setSpillLines(0);
    } else {
      const extraHeight = scrollHeight - a4Height;
      const extraLines = Math.ceil(extraHeight / 22);
      setEstimatedPages(2);
      setSpillLines(extraLines);
    }
  }, [resume, autoFit]);

  return (
    <div className="space-y-3">
      {/* Page Fit Indicator Banner */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          {estimatedPages === 1 ? (
            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Fits cleanly on 1 page (A4)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{spillLines} lines spill onto Page 2 (shorten wordy bullets to fit 1 page)</span>
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase">
          {isModern ? "Modern Style" : "Classic Style"}
        </span>
      </div>

      {/* Printable / Viewable A4 Sheet Simulation */}
      <div className="overflow-y-auto max-h-[800px] rounded-xl border border-slate-300 shadow-md bg-slate-100 p-2 sm:p-4">
        <div
          ref={containerRef}
          className={`bg-white mx-auto shadow-sm text-slate-800 transition-all ${
            autoFit ? "p-6 leading-snug text-[13px]" : "p-8 leading-normal text-[14px]"
          }`}
          style={{
            maxWidth: "794px", // Standard A4 ratio
            minHeight: "1050px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-slate-200">
            <h1 className={`text-2xl font-bold tracking-tight ${primaryColor}`}>
              {(resume.contact.fullName || "Your Full Name").toUpperCase()}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 mt-1.5">
              {resume.contact.email && <span>{resume.contact.email}</span>}
              {resume.contact.phone && <span>• +91 {resume.contact.phone}</span>}
              {resume.contact.city && <span>• {resume.contact.city}</span>}
              {resume.contact.linkedin && <span>• linkedin.com</span>}
              {resume.contact.github && <span>• github.com</span>}
              {resume.contact.portfolio && <span>• portfolio</span>}
            </div>
          </div>

          {/* Professional Summary */}
          {resume.summary && resume.summary.trim() && (
            <div className="mt-4">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${primaryColor} ${headingBorder} pb-0.5 mb-1.5`}>
                Professional Summary
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">{resume.summary.trim()}</p>
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div className="mt-4">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${primaryColor} ${headingBorder} pb-0.5 mb-1.5`}>
                Education
              </h2>
              <div className="space-y-2">
                {resume.education.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{edu.degree || "Degree"}</span>
                      <span className="font-semibold text-slate-600">{edu.endYear}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11.5px] italic">
                      <span>{edu.institution || "College / University"}</span>
                      {edu.grade && <span className="font-semibold not-italic">CGPA / %: {edu.grade}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resume.skills.length > 0 && (
            <div className="mt-4">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${primaryColor} ${headingBorder} pb-0.5 mb-1.5`}>
                Technical Skills
              </h2>
              <div className="space-y-1 text-xs">
                {resume.skills.map((sk, idx) => (
                  <div key={idx} className="leading-snug">
                    <strong className="text-slate-900">{sk.group}: </strong>
                    <span className="text-slate-700">{sk.items.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <div className="mt-4">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${primaryColor} ${headingBorder} pb-0.5 mb-1.5`}>
                Projects
              </h2>
              <div className="space-y-3">
                {resume.projects.map((proj, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{proj.name || "Project Name"}</span>
                      {proj.techStack && (
                        <span className="font-mono text-[11px] text-slate-500 font-normal">
                          [{proj.techStack}]
                        </span>
                      )}
                    </div>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-700 text-[11.5px] leading-relaxed">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {resume.experience.length > 0 && (
            <div className="mt-4">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${primaryColor} ${headingBorder} pb-0.5 mb-1.5`}>
                Work Experience
              </h2>
              <div className="space-y-3">
                {resume.experience.map((exp, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{exp.role || "Role"}</span>
                      <span className="font-semibold text-slate-600">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11.5px] italic mb-1">
                      {exp.company} {exp.location ? `• ${exp.location}` : ""}
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-700 text-[11.5px] leading-relaxed">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {resume.certifications.length > 0 && (
            <div className="mt-4">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${primaryColor} ${headingBorder} pb-0.5 mb-1.5`}>
                Certifications
              </h2>
              <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">
                {resume.certifications.map((cert, idx) => (
                  <li key={idx}>
                    <strong>{cert.name}</strong> - {cert.issuer} ({cert.year})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements */}
          {resume.achievements.length > 0 && (
            <div className="mt-4">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${primaryColor} ${headingBorder} pb-0.5 mb-1.5`}>
                Key Achievements
              </h2>
              <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">
                {resume.achievements.map((ach, idx) => (
                  <li key={idx}>{ach}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
