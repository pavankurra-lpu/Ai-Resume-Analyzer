"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  AlertCircle,
  ExternalLink,
  GripVertical,
  X
} from "lucide-react";
import { StructuredResume } from "@/lib/resumeTypes";
import { CheckpointResult, evaluateBulletPoint } from "@/lib/scoring";
import IssuePopover from "./IssuePopover";

interface WordEditorProps {
  resume: StructuredResume;
  templateId: "modern" | "classic";
  fontSize: "10pt" | "10.5pt" | "11pt";
  zoom: number;
  checkpoints: CheckpointResult[];
  focusRequest?: { field: string; checkpointId?: string; nonce: number } | null;
  onUpdate: (updated: StructuredResume) => void;
  onOpenIssueModal?: (checkpoint: CheckpointResult, targetField: string) => void;
}

function resolveFieldElement(path: string): HTMLElement | null {
  if (!path) return null;
  const parts = path.split(".");
  for (let i = parts.length; i >= 1; i--) {
    const id = `field-${parts.slice(0, i).join("-")}`;
    const el = document.getElementById(id);
    if (el) return el;
  }
  if (parts[0] === "contact") {
    const fallback =
      document.getElementById("field-contact-email") ||
      document.getElementById("field-contact-fullName");
    if (fallback) return fallback;
  }
  return null;
}

export default function WordEditor({
  resume,
  templateId,
  fontSize,
  zoom,
  checkpoints,
  focusRequest,
  onUpdate,
}: WordEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkpointsRef = useRef(checkpoints);
  checkpointsRef.current = checkpoints;
  const resumeRef = useRef(resume);
  resumeRef.current = resume;

  const [activePopover, setActivePopover] = useState<{
    checkpoint: CheckpointResult;
    path: string;
    text: string;
  } | null>(null);

  const [hintCard, setHintCard] = useState<{
    checkpoint: CheckpointResult;
    path: string;
  } | null>(null);

  // Auto-dismiss hint card after ~8s
  useEffect(() => {
    if (!hintCard) return;
    const timer = setTimeout(() => {
      setHintCard(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [hintCard]);

  // Handle focusRequest: depends ONLY on focusRequest
  useEffect(() => {
    if (!focusRequest || !focusRequest.field) return;

    const targetPath = focusRequest.field;
    const el = resolveFieldElement(targetPath);

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-4", "ring-lt-blue", "animate-pulse");
      setTimeout(() => {
        el.classList.remove("ring-4", "ring-lt-blue", "animate-pulse");
      }, 2500);

      const input =
        el.tagName === "INPUT" || el.tagName === "TEXTAREA"
          ? (el as HTMLElement)
          : el.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
      if (input && "focus" in input) {
        input.focus();
      }
    }

    const currentCheckpoints = checkpointsRef.current;
    const matchingCp = focusRequest.checkpointId
      ? currentCheckpoints.find((c) => c.id === focusRequest.checkpointId)
      : currentCheckpoints.find(
          (c) => c.targetField === targetPath && c.status !== "pass"
        );

    // Passing checkpoints just scroll, no popover or hint
    if (!matchingCp || matchingCp.status === "pass") {
      setActivePopover(null);
      setHintCard(null);
      return;
    }

    // Check if target is a text field: summary or bullets
    const isSummary = targetPath === "summary";
    const projBulletMatch = targetPath.match(/^projects\.(\d+)\.bullets\.(\d+)$/);
    const expBulletMatch = targetPath.match(/^experience\.(\d+)\.bullets\.(\d+)$/);
    const isBullet = Boolean(projBulletMatch || expBulletMatch);

    if (isSummary || isBullet) {
      let realText = "";
      const curResume = resumeRef.current;
      if (isSummary) {
        realText = curResume.summary || "";
      } else if (projBulletMatch) {
        const pIdx = parseInt(projBulletMatch[1], 10);
        const bIdx = parseInt(projBulletMatch[2], 10);
        realText = curResume.projects?.[pIdx]?.bullets?.[bIdx] || "";
      } else if (expBulletMatch) {
        const eIdx = parseInt(expBulletMatch[1], 10);
        const bIdx = parseInt(expBulletMatch[2], 10);
        realText = curResume.experience?.[eIdx]?.bullets?.[bIdx] || "";
      }

      setActivePopover({
        checkpoint: matchingCp,
        path: targetPath,
        text: realText,
      });
      setHintCard(null);
    } else {
      setActivePopover(null);
      setHintCard({
        checkpoint: matchingCp,
        path: targetPath,
      });
    }
  }, [focusRequest]);

  // Styling tokens based on template
  const isModern = templateId === "modern";
  const primaryColor = isModern ? "text-[#2B3A92]" : "text-slate-900";
  const borderColor = isModern ? "border-[#2B3A92]/20" : "border-slate-300";
  const headerBg = isModern ? "bg-[#2B3A92]/5" : "bg-slate-100/50";

  const fontClass =
    fontSize === "10pt"
      ? "text-[12.5px] leading-relaxed"
      : fontSize === "10.5pt"
      ? "text-[13.5px] leading-relaxed"
      : "text-[14.5px] leading-relaxed";

  // Helper to update specific fields immutably
  const updateContact = (key: keyof StructuredResume["contact"], val: string) => {
    onUpdate({
      ...resume,
      contact: { ...resume.contact, [key]: val },
    });
  };

  const updateSummary = (val: string) => {
    onUpdate({ ...resume, summary: val });
  };

  const updateHeadline = (val: string) => {
    onUpdate({ ...resume, headline: val });
  };

  // Education Helpers
  const addEducation = () => {
    onUpdate({
      ...resume,
      education: [
        ...(resume.education || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          degree: "B.Tech in Computer Science",
          institution: "University Name",
          startYear: "2020",
          endYear: "2024",
          grade: "8.5 CGPA",
        },
      ],
    });
  };

  const removeEducation = (idx: number) => {
    onUpdate({
      ...resume,
      education: (resume.education || []).filter((_, i) => i !== idx),
    });
  };

  // Skill Helpers
  const addSkillGroup = () => {
    onUpdate({
      ...resume,
      skills: [
        ...(resume.skills || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          group: "New Skill Category",
          items: ["Skill 1", "Skill 2"],
        },
      ],
    });
  };

  const removeSkillGroup = (idx: number) => {
    onUpdate({
      ...resume,
      skills: (resume.skills || []).filter((_, i) => i !== idx),
    });
  };

  // Project Helpers
  const addProject = () => {
    onUpdate({
      ...resume,
      projects: [
        ...(resume.projects || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          name: "New Key Project",
          techStack: "React, Node.js, TypeScript",
          link: "https://github.com/...",
          bullets: [
            "Architected full stack responsive dashboard, slashing query latency by [X%].",
            "Engineered secure authentication workflows serving [X+] verified users.",
          ],
        },
      ],
    });
  };

  const removeProject = (idx: number) => {
    onUpdate({
      ...resume,
      projects: (resume.projects || []).filter((_, i) => i !== idx),
    });
  };

  const addProjectBullet = (pIdx: number) => {
    onUpdate({
      ...resume,
      projects: (resume.projects || []).map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              bullets: [
                ...(proj.bullets || []),
                "Engineered high-performance module, optimizing latency by [X%].",
              ],
            }
          : proj
      ),
    });
  };

  const updateProjectBullet = (pIdx: number, bIdx: number, val: string) => {
    onUpdate({
      ...resume,
      projects: (resume.projects || []).map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              bullets: (proj.bullets || []).map((b, j) => (j === bIdx ? val : b)),
            }
          : proj
      ),
    });
  };

  const removeProjectBullet = (pIdx: number, bIdx: number) => {
    onUpdate({
      ...resume,
      projects: (resume.projects || []).map((proj, i) =>
        i === pIdx
          ? {
              ...proj,
              bullets: (proj.bullets || []).filter((_, j) => j !== bIdx),
            }
          : proj
      ),
    });
  };

  // Experience Helpers
  const addExperience = () => {
    onUpdate({
      ...resume,
      experience: [
        ...(resume.experience || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          role: "Software Engineering Intern",
          company: "Company Name",
          location: "Bangalore",
          startDate: "Jan 2024",
          endDate: "Present",
          current: true,
          bullets: [
            "Built scalable user-facing features using React and REST APIs with 99.9% uptime.",
            "Streamlined automated test pipeline, increasing test coverage from 60% to 85%.",
          ],
        },
      ],
    });
  };

  const removeExperience = (idx: number) => {
    onUpdate({
      ...resume,
      experience: (resume.experience || []).filter((_, i) => i !== idx),
    });
  };

  const addExperienceBullet = (eIdx: number) => {
    onUpdate({
      ...resume,
      experience: (resume.experience || []).map((exp, i) =>
        i === eIdx
          ? {
              ...exp,
              bullets: [
                ...(exp.bullets || []),
                "Engineered automated data pipelines, decreasing runtime by [X%].",
              ],
            }
          : exp
      ),
    });
  };

  const updateExperienceBullet = (eIdx: number, bIdx: number, val: string) => {
    onUpdate({
      ...resume,
      experience: (resume.experience || []).map((exp, i) =>
        i === eIdx
          ? {
              ...exp,
              bullets: (exp.bullets || []).map((b, j) => (j === bIdx ? val : b)),
            }
          : exp
      ),
    });
  };

  const removeExperienceBullet = (eIdx: number, bIdx: number) => {
    onUpdate({
      ...resume,
      experience: (resume.experience || []).map((exp, i) =>
        i === eIdx
          ? {
              ...exp,
              bullets: (exp.bullets || []).filter((_, j) => j !== bIdx),
            }
          : exp
      ),
    });
  };

  // Helper to render spellcheck-style underlined bullet
  const renderInteractiveBullet = (
    text: string,
    path: string,
    onSave: (val: string) => void,
    onDelete: () => void
  ) => {
    const evalResult = evaluateBulletPoint(text);
    const hasPlaceholder = /\[([^\]]+)\]/.test(text);

    // Find if a checkpoint rule targets this exact bullet or has issues
    const matchingCp = checkpoints.find((c) => c.targetField === path && c.status !== "pass") ||
      (!evalResult.hasVerb
        ? checkpoints.find((c) => c.id === "bullets_action_verbs" && c.status !== "pass")
        : !evalResult.hasMetric
        ? checkpoints.find((c) => c.id === "bullets_metrics" && c.status !== "pass")
        : hasPlaceholder
        ? checkpoints.find((c) => c.id === "clean_placeholders" && c.status !== "pass")
        : null);

    const isMustFix = matchingCp?.severity === "must-fix" || !evalResult.hasVerb || hasPlaceholder;
    const isImprove = matchingCp?.severity === "improve" || (!evalResult.hasMetric && !isMustFix);

    return (
      <div
        id={`field-${path.replace(/\./g, "-")}`}
        key={path}
        className="group/bullet relative flex items-start gap-2 py-1 pl-1 rounded-md hover:bg-slate-50/70 transition-colors"
      >
        <span className="text-slate-400 select-none mt-1 text-xs">•</span>

        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => onSave(e.target.value)}
            className={`w-full bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none py-0.5 text-slate-800 transition-all font-sans ${fontClass} ${
              hasPlaceholder
                ? "bg-amber-100/60 ring-1 ring-amber-300 px-1 rounded font-medium"
                : isMustFix
                ? "border-b-2 border-dashed border-rose-500/80 hover:border-rose-600"
                : isImprove
                ? "border-b-2 border-dashed border-amber-400 hover:border-amber-500"
                : ""
            }`}
          />

          {/* Spellcheck indicator icon on hover/focus */}
          {matchingCp && (
            <button
              type="button"
              onClick={() => setActivePopover({ checkpoint: matchingCp, path, text })}
              title={`${matchingCp.title} (+${matchingCp.points} pts)`}
              className={`absolute right-1 top-1 p-0.5 rounded-full shadow-2xs transition-transform transform hover:scale-110 ${
                isMustFix
                  ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Delete bullet button on hover */}
        <button
          type="button"
          onClick={onDelete}
          title="Delete bullet"
          className="opacity-0 group-hover/bullet:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  const handleApplyPopoverFix = (path: string, newText: string) => {
    if (path === "summary") {
      updateSummary(newText);
      return;
    }
    const projBulletMatch = path.match(/^projects\.(\d+)\.bullets\.(\d+)$/);
    if (projBulletMatch) {
      const pIdx = parseInt(projBulletMatch[1], 10);
      const bIdx = parseInt(projBulletMatch[2], 10);
      updateProjectBullet(pIdx, bIdx, newText);
      return;
    }
    const expBulletMatch = path.match(/^experience\.(\d+)\.bullets\.(\d+)$/);
    if (expBulletMatch) {
      const eIdx = parseInt(expBulletMatch[1], 10);
      const bIdx = parseInt(expBulletMatch[2], 10);
      updateExperienceBullet(eIdx, bIdx, newText);
      return;
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="w-full flex justify-center py-6 px-2 sm:px-4"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
      >
        {/* A4 White Page Document Container (WYSIWYG) */}
        <article
          className="w-full max-w-[800px] min-h-[1050px] bg-white rounded-xs shadow-xl border border-slate-200/90 p-8 sm:p-14 text-slate-800 transition-all font-sans relative"
          style={{ boxSizing: "border-box" }}
        >
          {/* HEADER SECTION (Candidate Name, Target Role, Contact Links) */}
          <header className="border-b border-slate-200/80 pb-5 mb-5 text-center space-y-2">
            {/* Candidate Full Name */}
            <div id="field-contact-fullName" className="relative group/name inline-block w-full">
              <input
                type="text"
                value={resume.contact?.fullName || ""}
                onChange={(e) => updateContact("fullName", e.target.value)}
                placeholder="YOUR FULL NAME"
                className={`w-full text-center font-heading font-extrabold text-2xl sm:text-3xl tracking-tight uppercase bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none transition-colors ${primaryColor}`}
              />
            </div>

            {/* Headline / Target Role */}
            <div id="field-headline" className="relative inline-block w-full">
              <input
                type="text"
                value={resume.headline || ""}
                onChange={(e) => updateHeadline(e.target.value)}
                placeholder="Target Role (e.g. Software Engineer / Frontend Developer)"
                className="w-full text-center font-heading font-bold text-sm sm:text-base text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none transition-colors"
              />
            </div>

            {/* Contact Bar Inline Inputs */}
            <div id="field-contact-links" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-1">
              <div id="field-contact-email" className="flex items-center gap-1">
                <input
                  type="email"
                  value={resume.contact?.email || ""}
                  onChange={(e) => updateContact("email", e.target.value)}
                  placeholder="name@email.com"
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-center font-medium w-36 sm:w-44 text-xs"
                />
              </div>

              <span className="text-slate-300 select-none">|</span>

              <div id="field-contact-phone" className="flex items-center gap-1">
                <input
                  type="tel"
                  value={resume.contact?.phone || ""}
                  onChange={(e) => updateContact("phone", e.target.value)}
                  placeholder="+91 9876543210"
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-center font-medium w-28 text-xs"
                />
              </div>

              <span className="text-slate-300 select-none">|</span>

              <div id="field-contact-city" className="flex items-center gap-1">
                <input
                  type="text"
                  value={resume.contact?.city || ""}
                  onChange={(e) => updateContact("city", e.target.value)}
                  placeholder="City, India"
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-center font-medium w-28 text-xs"
                />
              </div>

              <span className="text-slate-300 select-none">|</span>

              <div id="field-contact-linkedin" className="flex items-center gap-1">
                <input
                  type="text"
                  value={resume.contact?.linkedin || ""}
                  onChange={(e) => updateContact("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/you"
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-center font-medium w-32 sm:w-40 text-xs"
                />
              </div>

              <span className="text-slate-300 select-none">|</span>

              <div id="field-contact-github" className="flex items-center gap-1">
                <input
                  type="text"
                  value={resume.contact?.github || ""}
                  onChange={(e) => updateContact("github", e.target.value)}
                  placeholder="github.com/you"
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-center font-medium w-28 sm:w-36 text-xs"
                />
              </div>

              <span className="text-slate-300 select-none">|</span>

              <div id="field-contact-portfolio" className="flex items-center gap-1">
                <input
                  type="text"
                  value={resume.contact?.portfolio || ""}
                  onChange={(e) => updateContact("portfolio", e.target.value)}
                  placeholder="portfolio.dev"
                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-center font-medium w-28 sm:w-36 text-xs"
                />
              </div>
            </div>
          </header>

        {/* 1. PROFESSIONAL SUMMARY SECTION */}
        <section id="field-summary" className="mb-6 group/sec relative">
          <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-2">
            <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
              Professional Summary
            </h3>
          </div>

          <textarea
            value={resume.summary || ""}
            onChange={(e) => updateSummary(e.target.value)}
            rows={3}
            placeholder="Write a concise 2-4 sentence executive summary highlighting your role, tech stack, and strongest achievement..."
            className={`w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-lt-blue rounded-md p-1.5 outline-none text-slate-700 resize-none font-sans ${fontClass}`}
          />
        </section>

        {/* 2. EDUCATION SECTION */}
        <section id="field-education" className="mb-6 group/sec relative">
          <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-3">
            <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
              Education
            </h3>
            <button
              type="button"
              onClick={addEducation}
              className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-3">
            {(resume.education || []).map((edu, eIdx) => (
              <div
                key={edu.id || eIdx}
                id={`field-education-${eIdx}`}
                className="group/edu relative p-2 rounded-lg hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      onUpdate({
                        ...resume,
                        education: (resume.education || []).map((item, i) =>
                          i === eIdx ? { ...item, degree: e.target.value } : item
                        ),
                      });
                    }}
                    placeholder="Degree (e.g. B.Tech in Computer Science)"
                    className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none flex-1 text-xs sm:text-sm"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={edu.endYear}
                      onChange={(e) => {
                        onUpdate({
                          ...resume,
                          education: (resume.education || []).map((item, i) =>
                            i === eIdx ? { ...item, endYear: e.target.value } : item
                          ),
                        });
                      }}
                      placeholder="Graduation Year (2024)"
                      className="font-medium text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-right w-24 text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => removeEducation(eIdx)}
                      className="opacity-0 group-hover/edu:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      onUpdate({
                        ...resume,
                        education: (resume.education || []).map((item, i) =>
                          i === eIdx ? { ...item, institution: e.target.value } : item
                        ),
                      });
                    }}
                    placeholder="College / Institution Name"
                    className="italic text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none flex-1 text-xs"
                  />

                  <input
                    type="text"
                    value={edu.grade}
                    onChange={(e) => {
                      onUpdate({
                        ...resume,
                        education: (resume.education || []).map((item, i) =>
                          i === eIdx ? { ...item, grade: e.target.value } : item
                        ),
                      });
                    }}
                    placeholder="CGPA: 8.5"
                    className="text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-right w-20 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. TECHNICAL SKILLS SECTION */}
        <section id="field-skills" className="mb-6 group/sec relative">
          <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-3">
            <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
              Technical Skills
            </h3>
            <button
              type="button"
              onClick={addSkillGroup}
              className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Skill Category</span>
            </button>
          </div>

          <div className="space-y-2">
            {(resume.skills || []).map((sk, sIdx) => (
              <div
                key={sk.id || sIdx}
                className="group/skill flex items-start gap-2 p-1 rounded hover:bg-slate-50 transition-colors text-xs"
              >
                <input
                  type="text"
                  value={sk.group}
                  onChange={(e) => {
                    onUpdate({
                      ...resume,
                      skills: (resume.skills || []).map((item, i) =>
                        i === sIdx ? { ...item, group: e.target.value } : item
                      ),
                    });
                  }}
                  placeholder="Category"
                  className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none w-36"
                />
                <span className="text-slate-400">:</span>
                <input
                  type="text"
                  value={(sk.items || []).join(", ")}
                  onChange={(e) => {
                    const parsed = e.target.value.split(",").map((i) => i.trim()).filter(Boolean);
                    onUpdate({
                      ...resume,
                      skills: (resume.skills || []).map((item, i) =>
                        i === sIdx ? { ...item, items: parsed } : item
                      ),
                    });
                  }}
                  placeholder="TypeScript, React, Node.js (comma separated)"
                  className="flex-1 text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSkillGroup(sIdx)}
                  className="opacity-0 group-hover/skill:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PROJECTS SECTION */}
        <section id="field-projects" className="mb-6 group/sec relative">
          <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-3">
            <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
              Projects
            </h3>
            <button
              type="button"
              onClick={addProject}
              className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="space-y-4">
            {(resume.projects || []).map((proj, pIdx) => (
              <div
                key={proj.id || pIdx}
                id={`field-projects-${pIdx}`}
                className="group/proj relative p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all space-y-2"
              >
                {/* Project Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => {
                        onUpdate({
                          ...resume,
                          projects: (resume.projects || []).map((p, i) =>
                            i === pIdx ? { ...p, name: e.target.value } : p
                          ),
                        });
                      }}
                      placeholder="Project Name"
                      className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-xs sm:text-sm flex-1"
                    />

                    <input
                      type="text"
                      value={proj.techStack || ""}
                      onChange={(e) => {
                        onUpdate({
                          ...resume,
                          projects: (resume.projects || []).map((p, i) =>
                            i === pIdx ? { ...p, techStack: e.target.value } : p
                          ),
                        });
                      }}
                      placeholder="[Tech Stack: React, Node.js]"
                      className="text-slate-500 font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-xs w-48 sm:w-64"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => addProjectBullet(pIdx)}
                      title="Add bullet"
                      className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark px-1.5 py-0.5 rounded hover:bg-white"
                    >
                      + Bullet
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProject(pIdx)}
                      className="opacity-0 group-hover/proj:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bullets List */}
                <div className="space-y-1 pl-1">
                  {(proj.bullets || []).map((b, bIdx) =>
                    renderInteractiveBullet(
                      b,
                      `projects.${pIdx}.bullets.${bIdx}`,
                      (val) => updateProjectBullet(pIdx, bIdx, val),
                      () => removeProjectBullet(pIdx, bIdx)
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. WORK EXPERIENCE SECTION */}
        <section id="field-experience" className="mb-6 group/sec relative">
          <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-3">
            <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
              Work Experience / Internships
            </h3>
            <button
              type="button"
              onClick={addExperience}
              className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Role</span>
            </button>
          </div>

          <div className="space-y-4">
            {(resume.experience || []).map((exp, eIdx) => (
              <div
                key={exp.id || eIdx}
                id={`field-experience-${eIdx}`}
                className="group/exp relative p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all space-y-2"
              >
                {/* Role Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        onUpdate({
                          ...resume,
                          experience: (resume.experience || []).map((item, i) =>
                            i === eIdx ? { ...item, role: e.target.value } : item
                          ),
                        });
                      }}
                      placeholder="Role (e.g. Software Engineer Intern)"
                      className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-xs sm:text-sm flex-1"
                    />

                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        onUpdate({
                          ...resume,
                          experience: (resume.experience || []).map((item, i) =>
                            i === eIdx ? { ...item, company: e.target.value } : item
                          ),
                        });
                      }}
                      placeholder="Company Name"
                      className="text-slate-600 font-semibold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-xs w-36 sm:w-48"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${exp.startDate || ""} - ${exp.endDate || "Present"}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("-").map((s) => s.trim());
                        onUpdate({
                          ...resume,
                          experience: (resume.experience || []).map((item, i) =>
                            i === eIdx
                              ? { ...item, startDate: parts[0] || "", endDate: parts[1] || "" }
                              : item
                          ),
                        });
                      }}
                      placeholder="Jan 2024 - Jun 2024"
                      className="text-slate-500 font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-right w-36 text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => addExperienceBullet(eIdx)}
                      title="Add bullet"
                      className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark px-1.5 py-0.5 rounded hover:bg-white"
                    >
                      + Bullet
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExperience(eIdx)}
                      className="opacity-0 group-hover/exp:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bullets List */}
                <div className="space-y-1 pl-1">
                  {(exp.bullets || []).map((b, bIdx) =>
                    renderInteractiveBullet(
                      b,
                      `experience.${eIdx}.bullets.${bIdx}`,
                      (val) => updateExperienceBullet(eIdx, bIdx, val),
                      () => removeExperienceBullet(eIdx, bIdx)
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>

    {/* Non-modal, bottom-left IssuePopover for summary / bullets */}
    {activePopover && (
      <IssuePopover
        key={`${activePopover.path}-${activePopover.checkpoint.id}`}
        checkpoint={activePopover.checkpoint}
        currentText={activePopover.text}
        onApply={(newText) => {
          handleApplyPopoverFix(activePopover.path, newText);
          setActivePopover(null);
        }}
        onClose={() => setActivePopover(null)}
        onFocusField={() => {
          const el = resolveFieldElement(activePopover.path);
          el?.focus();
        }}
      />
    )}

    {/* Dismissible Hint Card for non-text fields (contact, education, skills) */}
    {hintCard && (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 left-6 z-40 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-2 duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-lt-blue bg-lt-blue/10 px-2 py-0.5 rounded-full inline-block">
              Quick Guide
            </span>
            <h4 className="text-sm font-bold text-slate-800">{hintCard.checkpoint.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {hintCard.checkpoint.fixHint || hintCard.checkpoint.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHintCard(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Dismiss guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
  </>
  );
}
