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
  GripVertical
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
  activeTargetField?: string;
  onUpdate: (updated: StructuredResume) => void;
  onOpenIssueModal?: (checkpoint: CheckpointResult, targetField: string) => void;
}

export default function WordEditor({
  resume,
  templateId,
  fontSize,
  zoom,
  checkpoints,
  activeTargetField,
  onUpdate,
}: WordEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePopover, setActivePopover] = useState<{
    checkpoint: CheckpointResult;
    path: string;
    text: string;
  } | null>(null);

  // Scroll to activeTargetField when deep link or checklist item is selected
  useEffect(() => {
    if (activeTargetField) {
      const el = document.getElementById(`field-${activeTargetField.replace(/\./g, "-")}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-lt-blue", "animate-pulse");
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-lt-blue", "animate-pulse");
        }, 2500);

        // Auto-open popover if checkpoint matches
        const matchingCp = checkpoints.find((c) => c.targetField === activeTargetField && c.status !== "pass");
        if (matchingCp) {
          setActivePopover({
            checkpoint: matchingCp,
            path: activeTargetField,
            text: "",
          });
        }
      }
    }
  }, [activeTargetField, checkpoints]);

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
    const list = [...(resume.education || [])];
    list.splice(idx, 1);
    onUpdate({ ...resume, education: list });
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
    const list = [...(resume.skills || [])];
    list.splice(idx, 1);
    onUpdate({ ...resume, skills: list });
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
    const list = [...(resume.projects || [])];
    list.splice(idx, 1);
    onUpdate({ ...resume, projects: list });
  };

  const addProjectBullet = (pIdx: number) => {
    const list = [...(resume.projects || [])];
    list[pIdx].bullets.push("Engineered high-performance module, optimizing latency by [X%].");
    onUpdate({ ...resume, projects: list });
  };

  const updateProjectBullet = (pIdx: number, bIdx: number, val: string) => {
    const list = [...(resume.projects || [])];
    list[pIdx].bullets[bIdx] = val;
    onUpdate({ ...resume, projects: list });
  };

  const removeProjectBullet = (pIdx: number, bIdx: number) => {
    const list = [...(resume.projects || [])];
    list[pIdx].bullets.splice(bIdx, 1);
    onUpdate({ ...resume, projects: list });
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
    const list = [...(resume.experience || [])];
    list.splice(idx, 1);
    onUpdate({ ...resume, experience: list });
  };

  const addExperienceBullet = (eIdx: number) => {
    const list = [...(resume.experience || [])];
    list[eIdx].bullets.push("Engineered automated data pipelines, decreasing runtime by [X%].");
    onUpdate({ ...resume, experience: list });
  };

  const updateExperienceBullet = (eIdx: number, bIdx: number, val: string) => {
    const list = [...(resume.experience || [])];
    list[eIdx].bullets[bIdx] = val;
    onUpdate({ ...resume, experience: list });
  };

  const removeExperienceBullet = (eIdx: number, bIdx: number) => {
    const list = [...(resume.experience || [])];
    list[eIdx].bullets.splice(bIdx, 1);
    onUpdate({ ...resume, experience: list });
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

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center py-6 px-2 sm:px-4"
      style={{
        transform: `scale(${zoom / 100})`,
        transformOrigin: "top center",
      }}
    >
      {/* Popover overlay if open */}
      {activePopover && (
        <IssuePopover
          checkpoint={activePopover.checkpoint}
          currentText={activePopover.text}
          onApply={(newText) => {
            const parts = activePopover.path.split(".");
            if (parts[0] === "projects" && parts[2] === "bullets") {
              updateProjectBullet(parseInt(parts[1]), parseInt(parts[3]), newText);
            } else if (parts[0] === "experience" && parts[2] === "bullets") {
              updateExperienceBullet(parseInt(parts[1]), parseInt(parts[3]), newText);
            } else if (parts[0] === "summary") {
              updateSummary(newText);
            }
            setActivePopover(null);
          }}
          onClose={() => setActivePopover(null)}
          onFocusField={() => {
            const el = document.getElementById(`field-${activePopover.path.replace(/\./g, "-")}`);
            const input = el?.querySelector("input, textarea");
            if (input instanceof HTMLElement) input.focus();
          }}
        />
      )}

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
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-1">
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
                      const list = [...(resume.education || [])];
                      list[eIdx].degree = e.target.value;
                      onUpdate({ ...resume, education: list });
                    }}
                    placeholder="Degree (e.g. B.Tech in Computer Science)"
                    className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none flex-1 text-xs sm:text-sm"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={edu.endYear}
                      onChange={(e) => {
                        const list = [...(resume.education || [])];
                        list[eIdx].endYear = e.target.value;
                        onUpdate({ ...resume, education: list });
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
                      const list = [...(resume.education || [])];
                      list[eIdx].institution = e.target.value;
                      onUpdate({ ...resume, education: list });
                    }}
                    placeholder="College / Institution Name"
                    className="italic text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none flex-1 text-xs"
                  />

                  <input
                    type="text"
                    value={edu.grade}
                    onChange={(e) => {
                      const list = [...(resume.education || [])];
                      list[eIdx].grade = e.target.value;
                      onUpdate({ ...resume, education: list });
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
                    const list = [...(resume.skills || [])];
                    list[sIdx].group = e.target.value;
                    onUpdate({ ...resume, skills: list });
                  }}
                  placeholder="Category"
                  className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none w-36"
                />
                <span className="text-slate-400">:</span>
                <input
                  type="text"
                  value={(sk.items || []).join(", ")}
                  onChange={(e) => {
                    const list = [...(resume.skills || [])];
                    list[sIdx].items = e.target.value.split(",").map((i) => i.trim()).filter(Boolean);
                    onUpdate({ ...resume, skills: list });
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
                        const list = [...(resume.projects || [])];
                        list[pIdx].name = e.target.value;
                        onUpdate({ ...resume, projects: list });
                      }}
                      placeholder="Project Name"
                      className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-xs sm:text-sm flex-1"
                    />

                    <input
                      type="text"
                      value={proj.techStack || ""}
                      onChange={(e) => {
                        const list = [...(resume.projects || [])];
                        list[pIdx].techStack = e.target.value;
                        onUpdate({ ...resume, projects: list });
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
                        const list = [...(resume.experience || [])];
                        list[eIdx].role = e.target.value;
                        onUpdate({ ...resume, experience: list });
                      }}
                      placeholder="Role (e.g. Software Engineer Intern)"
                      className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-lt-blue outline-none text-xs sm:text-sm flex-1"
                    />

                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const list = [...(resume.experience || [])];
                        list[eIdx].company = e.target.value;
                        onUpdate({ ...resume, experience: list });
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
                        const list = [...(resume.experience || [])];
                        list[eIdx].startDate = parts[0] || "";
                        list[eIdx].endDate = parts[1] || "";
                        onUpdate({ ...resume, experience: list });
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
  );
}
