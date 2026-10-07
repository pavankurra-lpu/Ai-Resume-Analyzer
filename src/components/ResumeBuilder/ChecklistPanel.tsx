"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Eye,
  FileText,
  Target,
  Copy,
  Check,
  X,
  ExternalLink
} from "lucide-react";
import { CheckpointResult, CategoryScore } from "@/lib/scoring";
import { StructuredResume } from "@/lib/resumeTypes";

interface ChecklistPanelProps {
  categories: CategoryScore[];
  checkpoints: CheckpointResult[];
  totalScore: number;
  initialScore: number;
  redCount: number;
  amberCount: number;
  resume: StructuredResume;
  targetRole?: string;
  jobDescription?: string;
  onSelectCheckpoint: (cp: CheckpointResult) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function ChecklistPanel({
  categories,
  checkpoints,
  totalScore,
  initialScore,
  redCount,
  amberCount,
  resume,
  targetRole,
  jobDescription,
  onSelectCheckpoint,
  isOpenMobile,
  onCloseMobile,
}: ChecklistPanelProps) {
  const [activeTab, setActiveTab] = useState<"checklist" | "review">("checklist");
  const [reviewMode, setReviewMode] = useState<"recruiter" | "ats" | "keywords">("recruiter");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Bullet quality": true,
    "Clean & safe": true,
    "Projects": true,
  });
  const [copiedAts, setCopiedAts] = useState(false);

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // ATS plain text converter
  const atsPlainText = [
    (resume.contact?.fullName || "CANDIDATE NAME").toUpperCase(),
    [
      resume.contact?.email,
      resume.contact?.phone ? `+91 ${resume.contact.phone}` : "",
      resume.contact?.city,
      resume.contact?.linkedin,
      resume.contact?.github,
    ].filter(Boolean).join(" | "),
    "",
    resume.summary ? `PROFESSIONAL SUMMARY\n${resume.summary}\n` : "",
    resume.education?.length ? `EDUCATION\n${resume.education.map((e) => `${e.degree} - ${e.institution} (${e.endYear || "2024"}) Grade: ${e.grade || "N/A"}`).join("\n")}\n` : "",
    resume.skills?.length ? `SKILLS\n${resume.skills.map((s) => `${s.group}: ${s.items.join(", ")}`).join("\n")}\n` : "",
    resume.projects?.length ? `PROJECTS\n${resume.projects.map((p) => `${p.name} [${p.techStack}]\n${(p.bullets || []).map((b) => `• ${b}`).join("\n")}`).join("\n\n")}\n` : "",
    resume.experience?.length ? `EXPERIENCE\n${resume.experience.map((e) => `${e.role} at ${e.company} (${e.startDate} - ${e.endDate || "Present"})\n${(e.bullets || []).map((b) => `• ${b}`).join("\n")}`).join("\n\n")}\n` : "",
    resume.certifications?.length ? `CERTIFICATIONS\n${resume.certifications.map((c) => `• ${c.name} - ${c.issuer} (${c.year})`).join("\n")}\n` : "",
  ].filter(Boolean).join("\n");

  const handleCopyAts = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(atsPlainText);
      setCopiedAts(true);
      setTimeout(() => setCopiedAts(false), 2000);
    }
  };

  // Keywords extraction for JD
  const jdKeywords = jobDescription
    ? Array.from(
        new Set(
          jobDescription
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length >= 4)
        )
      ).slice(0, 12)
    : ["react", "typescript", "javascript", "tailwind", "rest api", "git", "sql", "performance"];

  const resumeLower = JSON.stringify(resume).toLowerCase();
  const matchedKeywords = jdKeywords.filter((k) => resumeLower.includes(k));
  const missingKeywords = jdKeywords.filter((k) => !resumeLower.includes(k));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 right-0 h-full lg:h-auto w-full max-w-sm lg:w-80 bg-white border-l border-slate-200/90 shadow-xl lg:shadow-none z-50 flex flex-col transition-transform duration-200 ${
          isOpenMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-sm text-lt-blue-dark">
              Resume Intelligence
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-lt-blue text-white">
              {totalScore}/100
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Mode switch */}
            <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("checklist")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === "checklist"
                    ? "bg-white text-lt-blue-dark shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Checklist
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("review")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === "review"
                    ? "bg-white text-lt-blue-dark shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Review
              </button>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status banner */}
        <div className="px-4 py-2.5 bg-slate-100/60 border-b border-slate-200/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {redCount} must-fix
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {amberCount} to improve
            </span>
          </div>
          <span className="text-slate-500 font-medium text-[11px]">
            Started: {initialScore} pts
          </span>
        </div>

        {/* Panel Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-700">
          {activeTab === "checklist" ? (
            /* CHECKLIST TAB */
            <div className="space-y-3">
              {categories.map((cat) => {
                const isExpanded = expandedCategories[cat.name] ?? false;
                const failingCount = cat.checkpoints.filter((c) => c.status !== "pass").length;

                return (
                  <div
                    key={cat.name}
                    className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Category Title bar */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-heading font-bold text-xs text-slate-800">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {failingCount > 0 ? (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            {failingCount} to fix
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            100%
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {cat.score}/{cat.maxScore}
                        </span>
                      </div>
                    </button>

                    {/* Checkpoints list */}
                    {isExpanded && (
                      <div className="p-2 space-y-1.5 border-t border-slate-100 divide-y divide-slate-50">
                        {cat.checkpoints.map((cp) => {
                          const isPass = cp.status === "pass";
                          const isRed = cp.severity === "must-fix";

                          return (
                            <div
                              key={cp.id}
                              onClick={() => onSelectCheckpoint(cp)}
                              className={`p-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50 flex items-start justify-between gap-2 text-xs group ${
                                !isPass
                                  ? isRed
                                    ? "hover:border-rose-200"
                                    : "hover:border-amber-200"
                                  : "opacity-80 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                {isPass ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                ) : isRed ? (
                                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                )}

                                <div className="min-w-0">
                                  <div className="font-bold text-slate-800 group-hover:text-lt-blue transition-colors truncate">
                                    {cp.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 line-clamp-1">
                                    {cp.message}
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 font-mono ${
                                  isPass
                                    ? "bg-slate-100 text-slate-500"
                                    : isRed
                                    ? "bg-rose-100 text-rose-800 border border-rose-200 group-hover:bg-rose-200"
                                    : "bg-amber-100 text-amber-800 border border-amber-200 group-hover:bg-amber-200"
                                }`}
                              >
                                {isPass ? `${cp.points} pts` : `+${cp.points} pts`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* REVIEW TAB */
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setReviewMode("recruiter")}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    reviewMode === "recruiter" ? "bg-white text-lt-blue-dark shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Recruiter 6s
                </button>
                <button
                  type="button"
                  onClick={() => setReviewMode("ats")}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    reviewMode === "ats" ? "bg-white text-lt-blue-dark shadow-2xs" : "text-slate-600"
                  }`}
                >
                  ATS Plain
                </button>
                <button
                  type="button"
                  onClick={() => setReviewMode("keywords")}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    reviewMode === "keywords" ? "bg-white text-lt-blue-dark shadow-2xs" : "text-slate-600"
                  }`}
                >
                  Keywords
                </button>
              </div>

              {reviewMode === "recruiter" && (
                <div className="space-y-3 text-xs">
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-1.5">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-amber-600" />
                      <span>Estimated Recruiter Verdict (AI Estimate)</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed text-[11px]">
                      {totalScore >= 85
                        ? "Strong pass! Recruiter will immediately notice high-impact metrics and cleanly formatted single-column structure."
                        : totalScore >= 70
                        ? "Likely candidate pool. Add 2 more quantified achievements to lock in an interview call."
                        : "At risk of rejection in the first 6 seconds. Missing active verbs and metric proofs."}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                      Recruiter Scan Order:
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                      <li><strong className="text-slate-800">Top 1/3:</strong> Name, role, contact links & summary.</li>
                      <li><strong className="text-slate-800">Middle:</strong> Recent project outcomes & metrics.</li>
                      <li><strong className="text-slate-800">Bottom:</strong> Education graduation year & skills.</li>
                    </ol>
                  </div>
                </div>
              )}

              {reviewMode === "ats" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Linear ATS Readable Text
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAts}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark"
                    >
                      {copiedAts ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAts ? "Copied!" : "Copy text"}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap">
                    {atsPlainText}
                  </pre>
                </div>
              )}

              {reviewMode === "keywords" && (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5">
                      Matched Keywords ({matchedKeywords.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedKeywords.map((k) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {missingKeywords.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-800 block mb-1.5">
                        Missing Keywords ({missingKeywords.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {missingKeywords.map((k) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-bold"
                          >
                            + {k}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 italic">
                        Only add keywords if you have real hands-on experience using them.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
