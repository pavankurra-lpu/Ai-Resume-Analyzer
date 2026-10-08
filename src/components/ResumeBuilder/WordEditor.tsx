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
  X,
  Check,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { StructuredResume } from "@/lib/resumeTypes";
import { CheckpointResult, evaluateBulletPoint } from "@/lib/scoring";

interface WordEditorProps {
  resume: StructuredResume;
  templateId: "modern" | "classic";
  fontSize: "10pt" | "10.5pt" | "11pt";
  zoom: number;
  checkpoints: CheckpointResult[];
  focusRequest?: { field: string; checkpointId?: string; nonce: number } | null;
  onUpdate: (updated: StructuredResume) => void;
  onOpenFixPanel?: (checkpoint: CheckpointResult, targetField: string) => void;
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
      document.getElementById("field-contact-fullName") ||
      document.getElementById("field-contact-links");
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
  onOpenFixPanel,
}: WordEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkpointsRef = useRef(checkpoints);
  checkpointsRef.current = checkpoints;
  const resumeRef = useRef(resume);
  resumeRef.current = resume;

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
  }, [focusRequest]);

  // Styling tokens based on template
  const isModern = templateId === "modern";
  const primaryColor = isModern ? "text-[#2B3A92]" : "text-slate-900";
  const borderColor = isModern ? "border-[#2B3A92]/20" : "border-slate-300";

  const fontClass =
    fontSize === "10pt"
      ? "text-[12.5px] leading-relaxed"
      : fontSize === "10.5pt"
      ? "text-[13.5px] leading-relaxed"
      : "text-[14.5px] leading-relaxed";

  // Section Reordering Helpers
  const sectionOrder = resume.sectionOrder || [
    "summary",
    "education",
    "skills",
    "projects",
    "experience",
  ];

  const moveSection = (key: string, direction: "up" | "down") => {
    const idx = sectionOrder.indexOf(key);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sectionOrder.length) return;
    const nextOrder = [...sectionOrder];
    const temp = nextOrder[idx];
    nextOrder[idx] = nextOrder[targetIdx];
    nextOrder[targetIdx] = temp;
    onUpdate({ ...resume, sectionOrder: nextOrder });
  };

  const resetRecommendedOrder = () => {
    onUpdate({
      ...resume,
      sectionOrder: ["summary", "education", "skills", "projects", "experience"],
    });
  };

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

  // Education Helpers - BLANK entries with greyed hints (never fake text)
  const addEducation = (degree = "", institution = "", endYear = "", grade = "") => {
    onUpdate({
      ...resume,
      education: [
        ...(resume.education || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          degree,
          institution,
          startYear: "",
          endYear,
          grade,
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

  // Skill Helpers - BLANK entries
  const addSkillGroup = () => {
    onUpdate({
      ...resume,
      skills: [
        ...(resume.skills || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          group: "",
          items: [],
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

  // Project Helpers - BLANK entries (never fake text)
  const addProject = () => {
    onUpdate({
      ...resume,
      projects: [
        ...(resume.projects || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          name: "",
          techStack: "",
          link: "",
          bullets: [""],
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

  const addProjectBullet = (pIdx: number, insertAt?: number) => {
    const list = [...(resume.projects || [])];
    const targetProj = list[pIdx];
    if (!targetProj) return;
    const bullets = [...(targetProj.bullets || [])];
    if (insertAt !== undefined) {
      bullets.splice(insertAt + 1, 0, "");
    } else {
      bullets.push("");
    }
    list[pIdx] = { ...targetProj, bullets };
    onUpdate({ ...resume, projects: list });
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

  // Experience Helpers - BLANK entries (never fake text)
  const addExperience = () => {
    onUpdate({
      ...resume,
      experience: [
        ...(resume.experience || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          role: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: [""],
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

  const addExperienceBullet = (eIdx: number, insertAt?: number) => {
    const list = [...(resume.experience || [])];
    const targetExp = list[eIdx];
    if (!targetExp) return;
    const bullets = [...(targetExp.bullets || [])];
    if (insertAt !== undefined) {
      bullets.splice(insertAt + 1, 0, "");
    } else {
      bullets.push("");
    }
    list[eIdx] = { ...targetExp, bullets };
    onUpdate({ ...resume, experience: list });
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

  // Interactive Bullet Renderer with Word Wrapping, Enter & Backspace Support
  const renderInteractiveBullet = (
    text: string,
    path: string,
    onSave: (val: string) => void,
    onDelete: () => void,
    onAddAfter?: () => void
  ) => {
    const evalResult = evaluateBulletPoint(text);
    const hasPlaceholder = /\[([^\]]+)\]/.test(text);

    const matchingCp = checkpoints.find((c) => c.targetField === path && c.status !== "pass") ||
      (!evalResult.hasVerb
        ? checkpoints.find((c) => c.id === "bullets_action_verbs" && c.status !== "pass")
        : !evalResult.hasMetric
        ? checkpoints.find((c) => c.id === "bullets_results" && c.status !== "pass")
        : hasPlaceholder
        ? checkpoints.find((c) => c.id === "clean_placeholders" && c.status !== "pass")
        : null);

    const isMustFix = text.trim() && (matchingCp?.severity === "must-fix" || !evalResult.hasVerb || hasPlaceholder);
    const isImprove = text.trim() && (matchingCp?.severity === "improve" || (!evalResult.hasMetric && !isMustFix));

    return (
      <div
        id={`field-${path.replace(/\./g, "-")}`}
        key={path}
        className="group/bullet relative flex items-start gap-2 py-1 pl-1 rounded-md hover:bg-slate-50/70 transition-colors"
      >
        <span className="text-slate-400 select-none mt-1.5 text-xs">•</span>

        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => {
              onSave(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onAddAfter?.();
              } else if (e.key === "Backspace" && text === "") {
                e.preventDefault();
                onDelete();
              }
            }}
            rows={1}
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }
            }}
            placeholder="Type bullet point starting with an action verb (e.g. Built responsive catalog using React)..."
            className={`w-full bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none py-0.5 text-slate-800 transition-all font-sans resize-none leading-relaxed overflow-hidden ${fontClass} ${
              hasPlaceholder
                ? "bg-amber-100/60 ring-1 ring-amber-300 px-1 rounded font-medium"
                : isMustFix
                ? "border-b-2 border-dashed border-rose-500/80 hover:border-rose-600"
                : isImprove
                ? "border-b-2 border-dashed border-amber-400 hover:border-amber-500"
                : ""
            }`}
          />

          {/* Spellcheck / Issue button on page */}
          {matchingCp && text.trim() && (
            <button
              type="button"
              onClick={() => {
                onOpenFixPanel?.(matchingCp, path);
              }}
              title={`${matchingCp.title} (+${matchingCp.points} pts)`}
              className={`absolute right-1 top-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-2xs transition-transform transform hover:scale-110 ${
                isMustFix
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              !
            </button>
          )}
        </div>

        {/* AI Improve bullet button on hover */}
        <button
          type="button"
          onClick={() => {
            const cp = matchingCp || checkpoints.find((c) => c.id.startsWith("bullets")) || {
              id: "bullets_action_verbs",
              title: "Bullet Quality",
              points: 8,
              targetField: path,
              status: "fail",
            };
            onOpenFixPanel?.(cp as any, path);
          }}
          title="Improve or generate bullet with AI"
          className="opacity-0 group-hover/bullet:opacity-100 p-1 text-lt-blue hover:text-indigo-700 hover:bg-lt-blue/10 rounded transition-opacity mt-0.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        {/* Delete bullet button on hover */}
        <button
          type="button"
          onClick={onDelete}
          title="Delete bullet"
          className="opacity-0 group-hover/bullet:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity mt-0.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  const jumpChips = [
    { id: "field-contact-fullName", label: "Contact", hasContent: Boolean(resume.contact?.fullName) },
    { id: "field-summary", label: "Summary", hasContent: Boolean(resume.summary?.trim()) },
    { id: "field-education", label: "Education", hasContent: (resume.education || []).length > 0 },
    { id: "field-skills", label: "Skills", hasContent: (resume.skills || []).length > 0 },
    { id: "field-projects", label: "Projects", hasContent: (resume.projects || []).length > 0 },
    { id: "field-experience", label: "Experience", hasContent: (resume.experience || []).length > 0 },
  ];

  return (
    <>
      <div
        ref={containerRef}
        className="w-full flex flex-col items-center py-6 px-2 sm:px-4"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
      >
        {/* SECTION NAVIGATION CHIPS ("Jump to") */}
        <div className="w-full max-w-[800px] mb-3 flex items-center justify-between gap-2 overflow-x-auto py-1 px-1 text-xs">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Jump to:
            </span>
            {jumpChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  const el = document.getElementById(chip.id);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                  chip.hasContent
                    ? "bg-white border-slate-200 text-slate-700 hover:border-lt-blue hover:text-lt-blue shadow-2xs"
                    : "bg-slate-100 border-dashed border-slate-300 text-slate-400"
                }`}
              >
                {chip.hasContent && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetRecommendedOrder}
            className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark hover:underline whitespace-nowrap px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            Use recommended order
          </button>
        </div>

        {/* A4 White Page Document Container (WYSIWYG) */}
        <article
          className="w-full max-w-[800px] min-h-[1050px] bg-white rounded-xs shadow-xl border border-slate-200/90 p-8 sm:p-14 text-slate-800 transition-all font-sans relative"
          style={{ boxSizing: "border-box" }}
        >
          {/* HEADER SECTION (Candidate Name, Target Role, Contact Links) */}
          <header className="border-b border-slate-200/80 pb-5 mb-5 text-center space-y-2">
            <div id="field-contact-fullName" className="relative group/name inline-block w-full">
              <input
                type="text"
                value={resume.contact?.fullName || ""}
                onChange={(e) => updateContact("fullName", e.target.value)}
                placeholder="YOUR FULL NAME"
                className={`w-full text-center font-heading font-extrabold text-2xl sm:text-3xl tracking-tight uppercase bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none transition-colors ${primaryColor}`}
              />
            </div>

            <div id="field-headline" className="relative inline-block w-full">
              <input
                type="text"
                value={resume.headline || ""}
                onChange={(e) => updateHeadline(e.target.value)}
                placeholder="Target Role (e.g. Software Engineer / Frontend Developer)"
                className="w-full text-center font-heading font-bold text-sm sm:text-base text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none transition-colors"
              />
            </div>

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
                  placeholder="City, State"
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

          {/* DYNAMIC ORDERED SECTIONS */}
          {sectionOrder.map((sectionKey) => {
            if (sectionKey === "summary") {
              return (
                <section key="summary" id="field-summary" className="mb-6 group/sec relative">
                  <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
                        Professional Summary
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const skillsStr = (resume.skills || []).flatMap((s) => s.items || []).filter(Boolean).slice(0, 3).join(", ") || "html, Css";
                          const defaultDraft = `Dedicated ${resume.headline || "Software Engineer"} skilled in ${skillsStr}. Focused on writing maintainable, clean code and delivering robust project solutions.`;
                          const summaryCp = checkpoints.find((c) => c.id.startsWith("summary")) || {
                            id: "summary_present",
                            title: "Professional Summary",
                            points: 4,
                            targetField: "summary",
                            status: "pass",
                          };
                          if (!resume.summary?.trim()) {
                            updateSummary(defaultDraft);
                          }
                          onOpenFixPanel?.(summaryCp as any, "summary");
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-lt-blue/10 to-indigo-100 text-lt-blue hover:bg-lt-blue hover:text-white transition-all text-xs font-bold border border-lt-blue/20 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{resume.summary?.trim() ? "Improve with AI" : "Generate with AI"}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/sec:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveSection("summary", "up")}
                        title="Move Section Up"
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection("summary", "down")}
                        title="Move Section Down"
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={resume.summary || ""}
                    onChange={(e) => updateSummary(e.target.value)}
                    rows={3}
                    placeholder="Write a concise 2-4 sentence executive summary highlighting your role, tech stack, and strongest achievement..."
                    className={`w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-lt-blue rounded-md p-1.5 outline-none text-slate-700 resize-none font-sans ${fontClass}`}
                  />
                </section>
              );
            }

            if (sectionKey === "education") {
              return (
                <section key="education" id="field-education" className="mb-6 group/sec relative">
                  <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-3">
                    <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
                      Education
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Indian norm quick adds */}
                      <button
                        type="button"
                        onClick={() => addEducation("Class XII (Senior Secondary)", "", "", "")}
                        className="text-[10px] font-bold text-slate-500 hover:text-lt-blue px-1.5 py-0.5 rounded hover:bg-slate-100 border border-slate-200"
                      >
                        + Class XII
                      </button>
                      <button
                        type="button"
                        onClick={() => addEducation("Class X (Secondary)", "", "", "")}
                        className="text-[10px] font-bold text-slate-500 hover:text-lt-blue px-1.5 py-0.5 rounded hover:bg-slate-100 border border-slate-200"
                      >
                        + Class X
                      </button>
                      <button
                        type="button"
                        onClick={() => addEducation()}
                        className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Education</span>
                      </button>
                      <div className="flex items-center opacity-0 group-hover/sec:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveSection("education", "up")}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection("education", "down")}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
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
                              placeholder="Year (2024)"
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
                            placeholder="CGPA / Grade"
                            className="text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-right w-24 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (sectionKey === "skills") {
              return (
                <section key="skills" id="field-skills" className="mb-6 group/sec relative">
                  <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-3">
                    <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
                      Technical Skills
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addSkillGroup}
                        className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Skill Group</span>
                      </button>
                      <div className="flex items-center opacity-0 group-hover/sec:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveSection("skills", "up")}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection("skills", "down")}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
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
                          placeholder="Category (e.g. Languages)"
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
              );
            }

            if (sectionKey === "projects") {
              return (
                <section key="projects" id="field-projects" className="mb-6 group/sec relative">
                  <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-3">
                    <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
                      Key Projects
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addProject}
                        className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Project</span>
                      </button>
                      <div className="flex items-center opacity-0 group-hover/sec:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveSection("projects", "up")}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection("projects", "down")}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(resume.projects || []).map((proj, pIdx) => (
                      <div
                        key={proj.id || pIdx}
                        id={`field-projects-${pIdx}`}
                        className="group/proj relative p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all space-y-2"
                      >
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
                              placeholder="Tech Stack: React, Node.js"
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
                              () => removeProjectBullet(pIdx, bIdx),
                              () => addProjectBullet(pIdx, bIdx)
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            if (sectionKey === "experience") {
              return (
                <section key="experience" id="field-experience" className="mb-6 group/sec relative">
                  <div className="flex items-center justify-between border-b border-slate-200/90 pb-1 mb-3">
                    <h3 className={`font-heading font-extrabold text-xs uppercase tracking-wider ${primaryColor}`}>
                      Work Experience / Internships
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addExperience}
                        className="text-[11px] font-bold text-lt-blue hover:text-lt-blue-dark inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Role</span>
                      </button>
                      <div className="flex items-center opacity-0 group-hover/sec:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveSection("experience", "up")}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection("experience", "down")}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(resume.experience || []).map((exp, eIdx) => (
                      <div
                        key={exp.id || eIdx}
                        id={`field-experience-${eIdx}`}
                        className="group/exp relative p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all space-y-2"
                      >
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
                              value={`${exp.startDate || ""} - ${exp.endDate || ""}`}
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
                              placeholder="Jan 2024 - Present"
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
                              () => removeExperienceBullet(eIdx, bIdx),
                              () => addExperienceBullet(eIdx, bIdx)
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            return null;
          })}

          {/* PAGE 2 BOUNDARY VISUAL DASHED LINE */}
          <div className="my-8 border-b-2 border-dashed border-slate-300 relative flex items-center justify-center select-none">
            <span className="bg-slate-100 text-slate-500 font-bold text-[10px] sm:text-xs px-3 py-0.5 rounded-full border border-slate-300">
              Page 2 Boundary (Fresher resumes stay above this line)
            </span>
          </div>
        </article>
      </div>
    </>
  );
}
