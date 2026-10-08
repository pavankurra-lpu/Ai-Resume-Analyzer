"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  X,
  Plus,
  Trash2,
  Wrench,
  Check,
  Split,
  Smile,
  ShieldAlert,
  Flame,
  Award,
  ChevronRight,
  Info,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Layers,
  FileText,
  Loader2,
} from "lucide-react";
import { CheckpointResult, evaluateBulletPoint, ACTION_VERBS, CLICHES, SENSITIVE_PATTERNS } from "@/lib/scoring";
import { StructuredResume } from "@/lib/resumeTypes";

export function MascotCap({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="#2B3A92" />
      <path d="M5 13.18V17C5 19.21 8.13 21 12 21C15.87 21 19 19.21 19 17V13.18L12 17L5 13.18Z" fill="#FFCC00" />
      <circle cx="12" cy="15" r="1.5" fill="#1F2937" />
    </svg>
  );
}

interface FixPanelProps {
  checkpoint?: CheckpointResult | null;
  targetField: string;
  resume: StructuredResume;
  totalScore: number;
  scoreDiff: number;
  pointsPopped: number | null;
  streakCount: number;
  failingCheckpoints: CheckpointResult[];
  onUpdateResume: (updated: StructuredResume) => void;
  onNextFix: () => void;
  onSkipFix: () => void;
  onClose: () => void;
  isOpenMobile: boolean;
  targetRole?: string;
  reportId?: string;
}

export default function FixPanel({
  checkpoint,
  targetField,
  resume,
  totalScore,
  scoreDiff,
  pointsPopped,
  streakCount,
  failingCheckpoints,
  onUpdateResume,
  onNextFix,
  onSkipFix,
  onClose,
  isOpenMobile,
  targetRole = "Software Engineer",
  reportId = "",
}: FixPanelProps) {
  // Checkpoint classification
  const cpId = checkpoint?.id || "";
  const isContact = cpId.startsWith("contact_") || targetField.startsWith("contact");
  const isSummary = cpId.startsWith("summary_") || targetField === "summary";
  const isEducation = cpId.startsWith("education_") || targetField.startsWith("education");
  const isSkills = cpId.startsWith("skills_") || targetField.startsWith("skills");
  const isProjects = cpId.startsWith("projects_") || targetField.startsWith("projects");
  const isExperience = cpId.startsWith("experience_") || targetField.startsWith("experience");
  const isLayout = cpId.startsWith("layout_") || targetField === "layout";
  const isCleanPlaceholders = cpId === "clean_placeholders";
  const isCleanSensitive = cpId === "clean_sensitive_data";
  const isCleanCliches = cpId === "clean_cliches";
  const isCertifications = cpId === "certifications_achievements" || targetField.startsWith("certifications");
  const isBulletCp = cpId.startsWith("bullets_");

  // Determine active bullet (if any)
  const projBulletMatch = targetField.match(/^projects\.(\d+)\.bullets\.(\d+)$/);
  const expBulletMatch = targetField.match(/^experience\.(\d+)\.bullets\.(\d+)$/);

  const activeBulletInfo = useMemo(() => {
    if (projBulletMatch) {
      const pIdx = parseInt(projBulletMatch[1], 10);
      const bIdx = parseInt(projBulletMatch[2], 10);
      return {
        type: "project" as const,
        pIdx,
        bIdx,
        text: resume.projects?.[pIdx]?.bullets?.[bIdx] || "",
        path: targetField,
      };
    }
    if (expBulletMatch) {
      const eIdx = parseInt(expBulletMatch[1], 10);
      const bIdx = parseInt(expBulletMatch[2], 10);
      return {
        type: "experience" as const,
        eIdx,
        bIdx,
        text: resume.experience?.[eIdx]?.bullets?.[bIdx] || "",
        path: targetField,
      };
    }
    // Fallback to first available bullet if on a bullet checkpoint
    if (isBulletCp) {
      if (resume.projects?.[0]?.bullets?.[0] !== undefined) {
        return {
          type: "project" as const,
          pIdx: 0,
          bIdx: 0,
          text: resume.projects[0].bullets[0] || "",
          path: "projects.0.bullets.0",
        };
      }
    }
    return null;
  }, [targetField, resume, projBulletMatch, expBulletMatch, isBulletCp]);

  // All bullets in resume for selection
  const allResumeBullets = useMemo(() => {
    const list: Array<{ path: string; text: string; location: string }> = [];
    (resume.projects || []).forEach((p, pIdx) => {
      (p.bullets || []).forEach((b, bIdx) => {
        list.push({
          path: `projects.${pIdx}.bullets.${bIdx}`,
          text: b,
          location: `${p.name || "Project"} - Bullet ${bIdx + 1}`,
        });
      });
    });
    (resume.experience || []).forEach((e, eIdx) => {
      (e.bullets || []).forEach((b, bIdx) => {
        list.push({
          path: `experience.${eIdx}.bullets.${bIdx}`,
          text: b,
          location: `${e.company || "Experience"} - Bullet ${bIdx + 1}`,
        });
      });
    });
    return list;
  }, [resume]);

  // Selected bullet path for bullet-focused checkpoints
  const [selectedBulletPath, setSelectedBulletPath] = useState<string>(
    activeBulletInfo?.path || allResumeBullets[0]?.path || "projects.0.bullets.0"
  );

  useEffect(() => {
    if (activeBulletInfo?.path) {
      setSelectedBulletPath(activeBulletInfo.path);
    }
  }, [activeBulletInfo?.path]);

  // Current bullet text being edited
  const currentBulletText = useMemo(() => {
    const found = allResumeBullets.find((b) => b.path === selectedBulletPath);
    return found ? found.text : activeBulletInfo?.text || "";
  }, [allResumeBullets, selectedBulletPath, activeBulletInfo?.text]);

  // Helper to save bullet updates
  const handleSaveBullet = (newText: string, pathOverride?: string) => {
    const path = pathOverride || selectedBulletPath;
    const pMatch = path.match(/^projects\.(\d+)\.bullets\.(\d+)$/);
    const eMatch = path.match(/^experience\.(\d+)\.bullets\.(\d+)$/);

    if (pMatch) {
      const pIdx = parseInt(pMatch[1], 10);
      const bIdx = parseInt(pMatch[2], 10);
      const nextProjects = (resume.projects || []).map((p, i) =>
        i === pIdx
          ? {
              ...p,
              bullets: (p.bullets || []).map((b, j) => (j === bIdx ? newText : b)),
            }
          : p
      );
      onUpdateResume({ ...resume, projects: nextProjects });
    } else if (eMatch) {
      const eIdx = parseInt(eMatch[1], 10);
      const bIdx = parseInt(eMatch[2], 10);
      const nextExp = (resume.experience || []).map((e, i) =>
        i === eIdx
          ? {
              ...e,
              bullets: (e.bullets || []).map((b, j) => (j === bIdx ? newText : b)),
            }
          : e
      );
      onUpdateResume({ ...resume, experience: nextExp });
    }
  };

  // Summary state
  const [summaryDraft, setSummaryDraft] = useState(resume.summary || "");
  useEffect(() => {
    setSummaryDraft(resume.summary || "");
  }, [resume.summary]);

  const handleSaveSummary = (newSummary: string) => {
    setSummaryDraft(newSummary);
    onUpdateResume({ ...resume, summary: newSummary });
  };

  // AI Suggestion State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAlternatives, setAiAlternatives] = useState<Array<{ text: string; why: string }>>([]);
  const [aiAltIndex, setAiAltIndex] = useState(0);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const handleImproveWithAi = async (textToImprove: string, type: "bullet" | "summary") => {
    setIsAiLoading(true);
    setAiNotice(null);
    try {
      const candidateSkills = (resume.skills || []).flatMap((s) => s.items || []).filter(Boolean);
      const techStack = resume.projects?.[0]?.techStack || "";

      const res = await fetch(`/api/resume/${reportId || "current"}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentText: (textToImprove || "").trim(),
          type,
          targetRole: targetRole || resume.headline || "Software Engineer",
          skills: candidateSkills,
          techStack,
          checkpointId: checkpoint?.id,
          fieldPath: isSummary ? "summary" : selectedBulletPath,
        }),
      });

      if (!res.ok) throw new Error("Failed to get suggestion");
      const data = await res.json();
      if (data.alternatives && data.alternatives.length > 0) {
        setAiAlternatives(data.alternatives);
        setAiAltIndex(0);
        if (data.notice) {
          setAiNotice(data.notice);
        }
      } else {
        setAiNotice("No alternative found. Try refining your wording.");
      }
    } catch (err) {
      console.warn("AI suggest error:", err);
      const candidateSkills = (resume.skills || []).flatMap((s) => s.items || []).filter(Boolean);
      if (type === "summary") {
        const topSkills = candidateSkills.slice(0, 3).join(", ") || "core web frameworks";
        setAiAlternatives([
          {
            text: `Dedicated ${targetRole} skilled in ${topSkills}. Focused on writing maintainable, clean code and delivering robust project solutions.`,
            why: "Directly aligns summary with target role and verified skills.",
          },
          {
            text: `Detail-focused ${targetRole} with hands-on proficiency in ${topSkills}. Eager to contribute to software delivery and collaborate effectively in engineering teams.`,
            why: "Crisp, role-aligned fresher summary centered on core competencies.",
          },
        ]);
        setAiAltIndex(0);
      } else {
        setAiAlternatives([
          {
            text: `Built and deployed responsive features using ${candidateSkills[0] || "modern frameworks"} following clean architectural patterns.`,
            why: "Begins with an active verb showcasing direct ownership.",
          },
          {
            text: `Engineered maintainable software components ensuring clean code quality and verified reliability.`,
            why: "Highlights software craftsmanship and best practices.",
          },
        ]);
        setAiAltIndex(0);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  // Pre-load AI recommendations automatically when navigating to summary or bullet checkpoints
  useEffect(() => {
    if (isSummary) {
      handleImproveWithAi(summaryDraft, "summary");
    } else if (isBulletCp) {
      handleImproveWithAi(currentBulletText, "bullet");
    }
  }, [cpId, selectedBulletPath]);

  // Project AI Suggestion State
  const [isAiProjectLoading, setIsAiProjectLoading] = useState(false);
  const handleGenerateProjectWithAi = async () => {
    setIsAiProjectLoading(true);
    try {
      const candidateSkills = (resume.skills || []).flatMap((s) => s.items || []).filter(Boolean);
      const res = await fetch(`/api/resume/${reportId || "current"}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project",
          targetRole: targetRole || resume.headline || "Software Engineer",
          skills: candidateSkills,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          onUpdateResume({
            ...resume,
            projects: [
              ...(resume.projects || []),
              {
                id: Math.random().toString(36).substring(2, 9),
                name: data.project.name,
                techStack: data.project.techStack,
                link: "",
                bullets: data.project.bullets,
              },
            ],
          });
        }
      }
    } catch (err) {
      console.warn("Project AI suggest error:", err);
    } finally {
      setIsAiProjectLoading(false);
    }
  };

  // Mode state for Metrics
  const [resultMode, setResultMode] = useState<"words" | "number">("words");
  const [wordsStarter, setWordsStarter] = useState("so that users can ");
  const [wordsCustom, setWordsCustom] = useState("");
  const [numberCounted, setNumberCounted] = useState("users");
  const [numberValue, setNumberValue] = useState("");
  const [otherTool, setOtherTool] = useState("");

  // Skills helpers
  const [newSkillText, setNewSkillText] = useState("");
  const [activeSkillGroupIdx, setActiveSkillGroupIdx] = useState(0);

  // Student's skills and tech stack
  const candidateSkills = useMemo(() => {
    return (resume.skills || []).flatMap((s) => s.items || []).filter(Boolean);
  }, [resume.skills]);

  // Smart verb chips for bullets
  const smartVerbs = useMemo(() => {
    const lower = (currentBulletText || "").toLowerCase();
    if (lower.includes("bug") || lower.includes("error") || lower.includes("defect") || lower.includes("issue")) {
      return ["Fixed", "Debugged", "Resolved", "Diagnosed", "Eliminated"];
    }
    if (lower.includes("page") || lower.includes("screen") || lower.includes("ui") || lower.includes("component") || lower.includes("interface")) {
      return ["Designed", "Built", "Developed", "Engineered", "Implemented"];
    }
    if (lower.includes("api") || lower.includes("server") || lower.includes("backend") || lower.includes("database") || lower.includes("endpoint")) {
      return ["Architected", "Engineered", "Implemented", "Integrated", "Optimized"];
    }
    if (lower.includes("data") || lower.includes("query") || lower.includes("model") || lower.includes("analytics")) {
      return ["Analyzed", "Structured", "Optimized", "Aggregated", "Processed"];
    }
    if (lower.includes("team") || lower.includes("collaborat") || lower.includes("lead") || lower.includes("member")) {
      return ["Led", "Organized", "Spearheaded", "Guided", "Coordinated"];
    }
    return ["Built", "Developed", "Implemented", "Optimized", "Automated", "Created", "Wrote", "Added", "Fixed", "Contributed"];
  }, [currentBulletText]);

  const applyVerb = (verb: string) => {
    const trimmed = currentBulletText.trim();
    if (!trimmed) {
      handleSaveBullet(`${verb} `);
      return;
    }
    const weakOpeners = /^(worked on|responsible for|helped with|assisted in|involved in|handled|contributed to|supported|tasked with)\b\s*/i;
    if (weakOpeners.test(trimmed)) {
      handleSaveBullet(trimmed.replace(weakOpeners, `${verb} `));
      return;
    }
    const ingWord = /^[a-zA-Z]+ing\b\s*/i;
    if (ingWord.test(trimmed)) {
      handleSaveBullet(trimmed.replace(ingWord, `${verb} `));
      return;
    }
    const firstLower = trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
    handleSaveBullet(`${verb} ${firstLower}`);
  };

  const applyTool = (tool: string) => {
    if (!tool.trim()) return;
    const trimmed = currentBulletText.trim();
    if (trimmed.toLowerCase().includes(tool.toLowerCase())) return;
    const clean = trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
    handleSaveBullet(`${clean} using ${tool}.`);
    setOtherTool("");
  };

  const applyResultWords = () => {
    if (!wordsCustom.trim() || wordsCustom.trim().split(/\s+/).length < 2) return;
    const trimmed = currentBulletText.trim();
    const clean = trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
    const phrase = `${wordsStarter}${wordsCustom.trim()}`.trim();
    handleSaveBullet(`${clean}, ${phrase}.`);
    setWordsCustom("");
  };

  const applyResultNumber = () => {
    if (!numberValue.trim()) return;
    const trimmed = currentBulletText.trim();
    const clean = trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
    let metricStr = "";
    if (numberCounted === "% improvement") {
      metricStr = `improving performance by ${numberValue}%`;
    } else {
      metricStr = `serving ${numberValue}+ ${numberCounted}`;
    }
    handleSaveBullet(`${clean}, ${metricStr}.`);
    setNumberValue("");
  };

  const handleSplitBullet = () => {
    const words = currentBulletText.split(/\s+/);
    if (words.length < 14) return;
    const mid = Math.floor(words.length / 2);
    const b1 = words.slice(0, mid).join(" ") + ".";
    const b2 = "Built " + words.slice(mid).join(" ");

    const pMatch = selectedBulletPath.match(/^projects\.(\d+)\.bullets\.(\d+)$/);
    if (pMatch) {
      const pIdx = parseInt(pMatch[1], 10);
      const bIdx = parseInt(pMatch[2], 10);
      const nextProjects = (resume.projects || []).map((p, i) =>
        i === pIdx
          ? {
              ...p,
              bullets: [
                ...p.bullets.slice(0, bIdx),
                b1,
                b2,
                ...p.bullets.slice(bIdx + 1),
              ],
            }
          : p
      );
      onUpdateResume({ ...resume, projects: nextProjects });
    }
  };

  // Check if current checkpoint is passing
  const isCheckpointPassing = checkpoint ? checkpoint.status === "pass" : false;

  // Coach reactive message
  const coachMessage = useMemo(() => {
    if (pointsPopped && pointsPopped > 0) {
      return `Awesome! That fix just earned +${pointsPopped} pts! Keep going!`;
    }
    if (failingCheckpoints.length > 0) {
      const mustFix = failingCheckpoints.filter((c) => c.severity === "must-fix");
      if (mustFix.length > 0) {
        return `${mustFix.length} must-fix issue(s) remaining. Let's tackle them one by one.`;
      }
      return `${failingCheckpoints.length} improvement(s) available. You are very close to ATS-ready!`;
    }
    return "All checks passed! Your resume is 100% recruiter-ready.";
  }, [pointsPopped, failingCheckpoints]);

  // Summary word counter
  const summaryWordCount = (summaryDraft || "").trim().split(/\s+/).filter(Boolean).length;
  const isSummaryLengthValid = summaryWordCount >= 25 && summaryWordCount <= 85;
  const isSummaryRoleAligned = targetRole
    ? summaryDraft.toLowerCase().includes(targetRole.toLowerCase().trim())
    : true;

  // Cliché detection in summary
  const summaryClichesFound = useMemo(() => {
    const text = summaryDraft.toLowerCase();
    return CLICHES.filter((c) => new RegExp(`\\b${c}\\b`, "i").test(text));
  }, [summaryDraft]);

  const removeClicheFromSummary = (cliche: string) => {
    const reg = new RegExp(`\\b${cliche}\\b\\s*`, "gi");
    const cleaned = summaryDraft.replace(reg, "").replace(/\s\s+/g, " ").trim();
    handleSaveSummary(cleaned);
  };

  // Global total resume word count for layout
  const totalResumeWords = useMemo(() => {
    const fullText = [
      resume.contact?.fullName,
      resume.contact?.email,
      resume.contact?.phone,
      resume.contact?.city,
      resume.contact?.linkedin,
      resume.contact?.github,
      resume.headline,
      resume.summary,
      ...(resume.education || []).map((e) => `${e.degree} ${e.institution} ${e.grade}`),
      ...(resume.skills || []).flatMap((s) => [s.group, ...s.items]),
      ...(resume.projects || []).flatMap((p) => [p.name, p.techStack, ...p.bullets]),
      ...(resume.experience || []).flatMap((e) => [e.company, e.role, ...e.bullets]),
      ...(resume.certifications || []).map((c) => `${c.name} ${c.issuer}`),
      ...(resume.achievements || []),
    ].join(" ");
    return fullText.split(/\s+/).filter(Boolean).length;
  }, [resume]);

  return (
    <aside
      className={`fixed lg:static inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-slate-200/90 shadow-2xl lg:shadow-none flex flex-col transition-transform duration-300 ${
        isOpenMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}
    >
      {/* 1. TOP GAME STRIP & COACH */}
      <div className="p-3.5 bg-gradient-to-r from-lt-bg-soft via-indigo-50/50 to-white border-b border-indigo-100 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MascotCap className="w-6 h-6 flex-shrink-0 animate-bounce" style={{ animationDuration: "3s" }} />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-lt-blue block">
                {totalScore >= 85 ? "Shortlist-ready" : totalScore >= 70 ? "Almost there" : totalScore >= 50 ? "Rising" : "Starter"}
              </span>
              <span className="font-heading font-extrabold text-sm text-slate-800">
                {totalScore} / 100 ATS Score
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {streakCount > 0 && (
              <div className="inline-flex items-center gap-1 bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>{streakCount} streak</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Coach reactive message */}
        <div className="p-2 bg-white rounded-xl border border-indigo-100/80 text-[11px] text-slate-700 leading-snug flex items-start gap-2 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-lt-blue flex-shrink-0 mt-0.5" />
          <span>{coachMessage}</span>
        </div>
      </div>

      {/* 2. DOCKED FIX HEADER & NAVIGATOR */}
      <div className="px-4 py-3 bg-white border-b border-slate-200/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-lt-blue/10 text-lt-blue flex items-center justify-center font-bold text-xs flex-shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-extrabold text-xs text-slate-900 truncate">
              {checkpoint?.title || "Guided Fix Panel"}
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 block">
              +{checkpoint?.points || 4} points available
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={onSkipFix}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onNextFix}
            className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-lt-blue text-white hover:bg-lt-blue-dark px-2.5 py-1 rounded-lg shadow-2xs transition-all"
          >
            <span>Next Fix</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. SCROLLABLE HELPER BODY (Check-Specific) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Why Recruiters Care Card */}
        {checkpoint?.whyRecruitersCare && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1 text-[10px] uppercase tracking-wider">
              <Info className="w-3 h-3 text-lt-blue" />
              Why Recruiters Care
            </span>
            <p className="leading-relaxed">{checkpoint.whyRecruitersCare}</p>
          </div>
        )}

        {/* GREEN FIXED BANNER IF CHECKPOINT IS PASSING */}
        {isCheckpointPassing && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Fixed! +{checkpoint?.points} points earned
                </span>
                <span className="text-[11px] text-emerald-700">
                  This check is now passing. Great work!
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onNextFix}
              className="inline-flex items-center gap-1 text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-2xs transition-all"
            >
              <span>Next Fix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* CHECKPOINT A: CONTACT INFORMATION */}
        {/* ==================================================== */}
        {isContact && (
          <div className="space-y-3">
            {cpId === "contact_email" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Professional Email Address</label>
                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.contact?.email || "") && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valid format
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  value={resume.contact?.email || ""}
                  onChange={(e) =>
                    onUpdateResume({
                      ...resume,
                      contact: { ...resume.contact, email: e.target.value },
                    })
                  }
                  placeholder="e.g. arun.kumar@gmail.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-lt-blue focus:ring-1 focus:ring-lt-blue outline-none bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-500">
                  💡 <strong>Tip:</strong> Use a personal email (Gmail/Outlook). Avoid university emails that expire after graduation.
                </p>
              </div>
            )}

            {cpId === "contact_phone" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">10-Digit Mobile Number</label>
                  {(resume.contact?.phone || "").replace(/\D/g, "").length >= 10 && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valid number
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  value={resume.contact?.phone || ""}
                  onChange={(e) =>
                    onUpdateResume({
                      ...resume,
                      contact: { ...resume.contact, phone: e.target.value },
                    })
                  }
                  placeholder="e.g. 9876543210"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-lt-blue focus:ring-1 focus:ring-lt-blue outline-none bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-500">
                  💡 <strong>Tip:</strong> Indian recruiters call or WhatsApp first. Provide your primary active number.
                </p>
              </div>
            )}

            {cpId === "contact_location" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Location (City, State)</label>
                  {(resume.contact?.city || "").trim().length >= 2 && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valid city
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={resume.contact?.city || ""}
                  onChange={(e) =>
                    onUpdateResume({
                      ...resume,
                      contact: { ...resume.contact, city: e.target.value },
                    })
                  }
                  placeholder="e.g. Bangalore, Karnataka"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-lt-blue focus:ring-1 focus:ring-lt-blue outline-none bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-500">
                  💡 <strong>Tip:</strong> Just city and state. No street address or pin code needed for ATS.
                </p>
              </div>
            )}

            {cpId === "contact_linkedin" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">LinkedIn Profile Link</label>
                  {(resume.contact?.linkedin || "").includes("linkedin.com/in/") && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valid URL
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={resume.contact?.linkedin || ""}
                  onChange={(e) =>
                    onUpdateResume({
                      ...resume,
                      contact: { ...resume.contact, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-lt-blue focus:ring-1 focus:ring-lt-blue outline-none bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-500">
                  🔍 <strong>Where to find:</strong> Open LinkedIn Profile &gt; Edit Public Profile & URL in right rail &gt; Copy link.
                </p>
              </div>
            )}

            {cpId === "contact_links" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">GitHub Profile Link</label>
                    {(resume.contact?.github || "").includes("github.com/") && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    value={resume.contact?.github || ""}
                    onChange={(e) =>
                      onUpdateResume({
                        ...resume,
                        contact: { ...resume.contact, github: e.target.value },
                      })
                    }
                    placeholder="https://github.com/yourusername"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-lt-blue focus:ring-1 focus:ring-lt-blue outline-none bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Portfolio Website (Optional)</label>
                  <input
                    type="url"
                    value={resume.contact?.portfolio || ""}
                    onChange={(e) =>
                      onUpdateResume({
                        ...resume,
                        contact: { ...resume.contact, portfolio: e.target.value },
                      })
                    }
                    placeholder="https://yourportfolio.dev"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-lt-blue focus:ring-1 focus:ring-lt-blue outline-none bg-slate-50/50"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  💡 <strong>Tip:</strong> Tech recruiters look for verified GitHub links to review your project commits.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* CHECKPOINT B: SUMMARY BUILDER & CLICHE REMOVER */}
        {/* ==================================================== */}
        {isSummary && (
          <div className="space-y-3.5">
            {/* Real text box with word counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700">Professional Summary</span>
                <span
                  className={`font-mono text-[10px] font-bold ${
                    isSummaryLengthValid ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {summaryWordCount} words {isSummaryLengthValid ? "✓ (target: 25-85)" : "(target: 25-85)"}
                </span>
              </div>

              <textarea
                value={summaryDraft}
                onChange={(e) => handleSaveSummary(e.target.value)}
                rows={4}
                placeholder="Write 2-3 sentences introducing your role and key technologies..."
                className="w-full text-xs font-sans p-2.5 rounded-xl border border-slate-200 focus:border-lt-blue focus:ring-1 focus:ring-lt-blue outline-none resize-none bg-slate-50/50 text-slate-800 leading-relaxed"
              />
            </div>

            {/* Target Role Mention Check */}
            <div className="p-2.5 rounded-xl border text-[11px] flex items-center justify-between gap-2 bg-slate-50 border-slate-200">
              <div className="flex items-center gap-1.5">
                {isSummaryRoleAligned ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <span>
                  {isSummaryRoleAligned
                    ? `Mentions target role "${targetRole}"`
                    : `Missing mention of target role "${targetRole}"`}
                </span>
              </div>
              {!isSummaryRoleAligned && (
                <button
                  type="button"
                  onClick={() => {
                    const prefix = `${targetRole} with hands-on foundational skills. `;
                    handleSaveSummary(prefix + summaryDraft);
                  }}
                  className="text-[10px] font-bold text-lt-blue hover:underline whitespace-nowrap"
                >
                  + Add Role
                </button>
              )}
            </div>

            {/* Clichés / Buzzword detector */}
            {summaryClichesFound.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-rose-900 block text-[11px]">
                  Detected empty buzzword(s) in summary:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {summaryClichesFound.map((cliche) => (
                    <button
                      key={cliche}
                      type="button"
                      onClick={() => removeClicheFromSummary(cliche)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 transition-colors"
                    >
                      <span>Remove &quot;{cliche}&quot;</span>
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Builder based on Student's own skills */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Build From Your Profile Data
              </span>
              <p className="text-[11px] text-slate-600">
                Generate a clean draft using your role ({targetRole}) and your verified skills.
              </p>
              <button
                type="button"
                onClick={() => {
                  const skillsStr = candidateSkills.slice(0, 3).join(", ") || "core web frameworks";
                  const projName = resume.projects?.[0]?.name ? `developed ${resume.projects[0].name}` : "academic projects";
                  const draft = `Dedicated ${targetRole} skilled in ${skillsStr}, having ${projName}. Focused on writing maintainable, clean code and solving real-world engineering challenges.`;
                  handleSaveSummary(draft);
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:border-lt-blue hover:text-lt-blue text-xs font-bold text-slate-700 shadow-2xs transition-all"
              >
                Assemble Summary from My Skills
              </button>
            </div>

            {/* AI IMPROVE BUTTON (Kind B) */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                disabled={isAiLoading}
                onClick={() => handleImproveWithAi(summaryDraft, "summary")}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-lt-blue to-indigo-600 hover:from-lt-blue-dark hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing your words...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{summaryDraft.trim() ? "Improve Summary with AI" : "Generate Summary with AI"}</span>
                  </>
                )}
              </button>

              {aiNotice && (
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                  {aiNotice}
                </div>
              )}

              {/* AI Recommendation Cards */}
              {aiAlternatives.length > 0 && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-lt-blue bg-lt-blue/10 px-2 py-0.5 rounded-full">
                      Based on your own words
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Idea {aiAltIndex + 1} of {aiAlternatives.length}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-indigo-100">
                    &ldquo;{aiAlternatives[aiAltIndex]?.text}&rdquo;
                  </p>

                  <p className="text-[10px] text-indigo-900 leading-snug">
                    💡 <em>{aiAlternatives[aiAltIndex]?.why}</em>
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveSummary(aiAlternatives[aiAltIndex].text);
                        setAiAlternatives([]);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-lt-blue text-white hover:bg-lt-blue-dark text-xs font-bold transition-all shadow-2xs"
                    >
                      Use this
                    </button>
                    {aiAlternatives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setAiAltIndex((prev) => (prev + 1) % aiAlternatives.length)}
                        className="py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700"
                      >
                        Another idea
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* CHECKPOINT C: BULLET QUALITY (Action Verbs, Tools, Metrics, Length) */}
        {/* ==================================================== */}
        {isBulletCp && (
          <div className="space-y-4">
            {/* Bullet Selector if multiple exist */}
            {allResumeBullets.length > 1 && (
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Select Bullet Point to Fix
                </label>
                <select
                  value={selectedBulletPath}
                  onChange={(e) => setSelectedBulletPath(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
                >
                  {allResumeBullets.map((b) => (
                    <option key={b.path} value={b.path}>
                      {b.location}: {b.text.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current bullet text area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700">Your Current Bullet</span>
                {(() => {
                  const evalB = evaluateBulletPoint(currentBulletText);
                  return (
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        evalB.wordCount >= 8 && evalB.wordCount <= 30 ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {evalB.wordCount} words {evalB.wordCount >= 8 && evalB.wordCount <= 30 ? "✓ (sweet spot)" : "(target: 8-30)"}
                    </span>
                  );
                })()}
              </div>

              <textarea
                value={currentBulletText}
                onChange={(e) => handleSaveBullet(e.target.value)}
                rows={3}
                placeholder="Type your bullet point starting with a strong past-tense action verb..."
                className="w-full text-xs font-sans p-2.5 rounded-xl border border-slate-200 focus:border-lt-blue focus:ring-1 focus:ring-lt-blue outline-none resize-none bg-slate-50/50 text-slate-800 leading-relaxed"
              />
            </div>

            {/* ACTION VERBS FIX RECIPE */}
            {cpId === "bullets_action_verbs" && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Power Action Verbs (Click to replace opener)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {smartVerbs.map((verb) => (
                    <button
                      key={verb}
                      type="button"
                      onClick={() => applyVerb(verb)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-lt-blue hover:text-lt-blue hover:bg-lt-blue/5 transition-all shadow-2xs"
                    >
                      + {verb}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TOOLS & TECH RECIPE */}
            {cpId === "bullets_tools" && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Tools from Your Profile (Click to append)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {candidateSkills.slice(0, 10).map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => applyTool(tool)}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-lt-blue hover:text-lt-blue transition-all"
                    >
                      + {tool}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={otherTool}
                    onChange={(e) => setOtherTool(e.target.value)}
                    placeholder="Enter custom tool (e.g. Redux, Docker)..."
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => applyTool(otherTool)}
                    className="px-2.5 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* METRICS & RESULTS FIX RECIPE */}
            {cpId === "bullets_metrics" && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setResultMode("words")}
                    className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${
                      resultMode === "words" ? "bg-white text-lt-blue shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    Say it in words
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultMode("number")}
                    className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${
                      resultMode === "number" ? "bg-white text-lt-blue shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    I have a number
                  </button>
                </div>

                {resultMode === "words" ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-600">
                      No corporate numbers? Plain qualitative outcomes count for full credit!
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Starter phrase:</label>
                      <div className="flex flex-wrap gap-1">
                        {[
                          "so that users can ",
                          "enabling the team to ",
                          "resulting in smoother ",
                          "leading to faster ",
                        ].map((starter) => (
                          <button
                            key={starter}
                            type="button"
                            onClick={() => setWordsStarter(starter)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              wordsStarter === starter
                                ? "bg-lt-blue text-white border-lt-blue"
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            {starter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <input
                        type="text"
                        value={wordsCustom}
                        onChange={(e) => setWordsCustom(e.target.value)}
                        placeholder="Finish in your words: filter products easily"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                      />
                      <button
                        type="button"
                        disabled={!wordsCustom.trim() || wordsCustom.trim().split(/\s+/).length < 2}
                        onClick={applyResultWords}
                        className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-40 transition-all shadow-2xs"
                      >
                        Add Outcome to Bullet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-600">
                      Quantify scale or impact with real numbers from your actual project:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Counted:</label>
                        <select
                          value={numberCounted}
                          onChange={(e) => setNumberCounted(e.target.value)}
                          className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                        >
                          <option value="users">users</option>
                          <option value="pages">pages</option>
                          <option value="features">features</option>
                          <option value="weeks saved">weeks saved</option>
                          <option value="bugs fixed">bugs fixed</option>
                          <option value="teammates">teammates</option>
                          <option value="% improvement">% improvement</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block">Number value:</label>
                        <input
                          type="number"
                          value={numberValue}
                          onChange={(e) => setNumberValue(e.target.value)}
                          placeholder="e.g. 500 or 25"
                          className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    {numberValue && (
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Preview: , {numberCounted === "% improvement" ? `improving performance by ${numberValue}%` : `serving ${numberValue}+ ${numberCounted}`}.
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={!numberValue.trim()}
                      onClick={applyResultNumber}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-40 transition-all shadow-2xs"
                    >
                      Add Real Number to Bullet
                    </button>
                    <p className="text-[10px] text-slate-500 italic">
                      ⚠️ Honesty guarantee: Only input numbers from your real work. Never invent fake stats.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* BULLET LENGTH FIX RECIPE */}
            {cpId === "bullets_length" && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Concise Bullet Length
                </span>
                {(() => {
                  const evalB = evaluateBulletPoint(currentBulletText);
                  return (
                    <div className="space-y-2 text-xs">
                      {evalB.wordCount > 30 ? (
                        <>
                          <p className="text-amber-800 text-[11px]">
                            This bullet is {evalB.wordCount} words (exceeds recommended 25-30 words). Long paragraphs get skipped in recruiter 6-second scans.
                          </p>
                          <button
                            type="button"
                            onClick={handleSplitBullet}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-lt-blue text-white hover:bg-lt-blue-dark font-bold text-xs shadow-2xs"
                          >
                            <Split className="w-3.5 h-3.5" />
                            <span>Split Into Two Bullets</span>
                          </button>
                        </>
                      ) : evalB.wordCount < 8 ? (
                        <p className="text-amber-800 text-[11px]">
                          This bullet is only {evalB.wordCount} words (a short fragment). Expand with what you built and the tools used.
                        </p>
                      ) : (
                        <p className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Optimal length ({evalB.wordCount} words). Fits cleanly on 1 line.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* AI IMPROVE BUTTON FOR BULLETS (Kind B) */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                disabled={isAiLoading}
                onClick={() => handleImproveWithAi(currentBulletText, "bullet")}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-lt-blue to-indigo-600 hover:from-lt-blue-dark hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing your words...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{currentBulletText.trim() ? "Improve with AI" : "Generate Bullet with AI"}</span>
                  </>
                )}
              </button>

              {aiNotice && (
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
                  {aiNotice}
                </div>
              )}

              {/* AI Recommendation Cards */}
              {aiAlternatives.length > 0 && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-lt-blue bg-lt-blue/10 px-2 py-0.5 rounded-full">
                      Based on your own words
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Idea {aiAltIndex + 1} of {aiAlternatives.length}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-indigo-100">
                    &ldquo;{aiAlternatives[aiAltIndex]?.text}&rdquo;
                  </p>

                  <p className="text-[10px] text-indigo-900 leading-snug">
                    💡 <em>{aiAlternatives[aiAltIndex]?.why}</em>
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveBullet(aiAlternatives[aiAltIndex].text);
                        setAiAlternatives([]);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-lt-blue text-white hover:bg-lt-blue-dark text-xs font-bold transition-all shadow-2xs"
                    >
                      Use this
                    </button>
                    {aiAlternatives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setAiAltIndex((prev) => (prev + 1) % aiAlternatives.length)}
                        className="py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700"
                      >
                        Another idea
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* CHECKPOINT D: PROJECTS & EXPERIENCE INLINE FORMS */}
        {/* ==================================================== */}
        {isProjects && (
          <div className="space-y-3">
            {/* AI PROJECT RECOMMENDATION */}
            <button
              type="button"
              disabled={isAiProjectLoading}
              onClick={handleGenerateProjectWithAi}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-lt-blue to-indigo-600 hover:from-lt-blue-dark hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              {isAiProjectLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Project with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Recommend {targetRole} Project with AI</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Projects List ({resume.projects?.length || 0} documented)
              </span>
              <button
                type="button"
                onClick={() => {
                  onUpdateResume({
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
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-lt-blue bg-lt-blue/10 px-2 py-0.5 rounded-md hover:bg-lt-blue/20"
              >
                <Plus className="w-3 h-3" />
                <span>Add Blank Project</span>
              </button>
            </div>

            {(resume.projects || []).map((proj, pIdx) => (
              <div key={proj.id || pIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => {
                      const next = (resume.projects || []).map((p, i) =>
                        i === pIdx ? { ...p, name: e.target.value } : p
                      );
                      onUpdateResume({ ...resume, projects: next });
                    }}
                    placeholder="Project Name (e.g. Chat App)"
                    className="flex-1 text-xs font-bold p-1.5 rounded border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = (resume.projects || []).filter((_, i) => i !== pIdx);
                      onUpdateResume({ ...resume, projects: next });
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={proj.techStack || ""}
                  onChange={(e) => {
                    const next = (resume.projects || []).map((p, i) =>
                      i === pIdx ? { ...p, techStack: e.target.value } : p
                    );
                    onUpdateResume({ ...resume, projects: next });
                  }}
                  placeholder="Tech Stack (e.g. React, Node.js, MongoDB)"
                  className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                />

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Bullets:</span>
                  {(proj.bullets || []).map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const nextBullets = (proj.bullets || []).map((item, j) =>
                            j === bIdx ? e.target.value : item
                          );
                          const next = (resume.projects || []).map((p, i) =>
                            i === pIdx ? { ...p, bullets: nextBullets } : p
                          );
                          onUpdateResume({ ...resume, projects: next });
                        }}
                        placeholder="What did you build? With which tools? What did it help with?"
                        className="flex-1 text-xs p-1.5 rounded border border-slate-200 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextBullets = (proj.bullets || []).filter((_, j) => j !== bIdx);
                          const next = (resume.projects || []).map((p, i) =>
                            i === pIdx ? { ...p, bullets: nextBullets } : p
                          );
                          onUpdateResume({ ...resume, projects: next });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const next = (resume.projects || []).map((p, i) =>
                        i === pIdx ? { ...p, bullets: [...(p.bullets || []), ""] } : p
                      );
                      onUpdateResume({ ...resume, projects: next });
                    }}
                    className="text-[10px] font-bold text-lt-blue hover:underline"
                  >
                    + Add bullet point
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isExperience && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Internships / Experience ({resume.experience?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => {
                  onUpdateResume({
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
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-lt-blue bg-lt-blue/10 px-2 py-0.5 rounded-md hover:bg-lt-blue/20"
              >
                <Plus className="w-3 h-3" />
                <span>Add Blank Internship</span>
              </button>
            </div>

            {(resume.experience || []).map((exp, eIdx) => (
              <div key={exp.id || eIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const next = (resume.experience || []).map((item, i) =>
                        i === eIdx ? { ...item, role: e.target.value } : item
                      );
                      onUpdateResume({ ...resume, experience: next });
                    }}
                    placeholder="Role (e.g. Frontend Intern)"
                    className="flex-1 text-xs font-bold p-1.5 rounded border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = (resume.experience || []).filter((_, i) => i !== eIdx);
                      onUpdateResume({ ...resume, experience: next });
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const next = (resume.experience || []).map((item, i) =>
                        i === eIdx ? { ...item, company: e.target.value } : item
                      );
                      onUpdateResume({ ...resume, experience: next });
                    }}
                    placeholder="Company / Startup"
                    className="text-xs p-1.5 rounded border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => {
                      const next = (resume.experience || []).map((item, i) =>
                        i === eIdx ? { ...item, startDate: e.target.value } : item
                      );
                      onUpdateResume({ ...resume, experience: next });
                    }}
                    placeholder="Dates (e.g. Jun - Aug 2023)"
                    className="text-xs p-1.5 rounded border border-slate-200 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================================================== */}
        {/* CHECKPOINT E: EDUCATION & SKILLS & CERTIFICATIONS */}
        {/* ==================================================== */}
        {isEducation && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Quick-Add Education Levels:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onUpdateResume({
                    ...resume,
                    education: [
                      ...(resume.education || []),
                      {
                        id: Math.random().toString(36).substring(2, 9),
                        degree: "Senior Secondary (Class XII)",
                        institution: "",
                        startYear: "",
                        endYear: "2020",
                        grade: "85%",
                      },
                    ],
                  });
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-lt-blue hover:text-lt-blue shadow-2xs"
              >
                + Class XII
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateResume({
                    ...resume,
                    education: [
                      ...(resume.education || []),
                      {
                        id: Math.random().toString(36).substring(2, 9),
                        degree: "Secondary School (Class X)",
                        institution: "",
                        startYear: "",
                        endYear: "2018",
                        grade: "9.2 CGPA",
                      },
                    ],
                  });
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-lt-blue hover:text-lt-blue shadow-2xs"
              >
                + Class X
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateResume({
                    ...resume,
                    education: [
                      ...(resume.education || []),
                      {
                        id: Math.random().toString(36).substring(2, 9),
                        degree: "B.Tech in Computer Science",
                        institution: "",
                        startYear: "2020",
                        endYear: "2024",
                        grade: "8.5 CGPA",
                      },
                    ],
                  });
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-lt-blue hover:text-lt-blue shadow-2xs"
              >
                + Degree / B.Tech
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {(resume.education || []).map((edu, idx) => (
                <div key={edu.id || idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const next = (resume.education || []).map((item, i) =>
                          i === idx ? { ...item, degree: e.target.value } : item
                        );
                        onUpdateResume({ ...resume, education: next });
                      }}
                      placeholder="Degree / Qualification"
                      className="flex-1 text-xs font-bold p-1 rounded border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (resume.education || []).filter((_, i) => i !== idx);
                        onUpdateResume({ ...resume, education: next });
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const next = (resume.education || []).map((item, i) =>
                        i === idx ? { ...item, institution: e.target.value } : item
                      );
                      onUpdateResume({ ...resume, education: next });
                    }}
                    placeholder="College / Institution / School"
                    className="w-full text-xs p-1 rounded border border-slate-200 bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={edu.endYear || ""}
                      onChange={(e) => {
                        const next = (resume.education || []).map((item, i) =>
                          i === idx ? { ...item, endYear: e.target.value } : item
                        );
                        onUpdateResume({ ...resume, education: next });
                      }}
                      placeholder="Year (e.g. 2024)"
                      className="text-xs p-1 rounded border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={edu.grade || ""}
                      onChange={(e) => {
                        const next = (resume.education || []).map((item, i) =>
                          i === idx ? { ...item, grade: e.target.value } : item
                        );
                        onUpdateResume({ ...resume, education: next });
                      }}
                      placeholder="Grade / CGPA (e.g. 8.5)"
                      className="text-xs p-1 rounded border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSkills && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Skill Categories ({resume.skills?.length || 0} groups, {candidateSkills.length} total skills):
            </span>

            {/* AI Recommended Skills for targetRole */}
            <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-lt-blue flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>AI Recommended Skills for {targetRole}:</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const roleLower = targetRole.toLowerCase();
                  const recs = roleLower.includes("front") || roleLower.includes("react")
                    ? ["React", "TypeScript", "Tailwind CSS", "JavaScript", "HTML5/CSS3", "REST APIs", "Git", "Next.js"]
                    : roleLower.includes("data") || roleLower.includes("python")
                    ? ["Python", "SQL", "Pandas", "NumPy", "Data Visualization", "Git", "PostgreSQL", "Excel"]
                    : roleLower.includes("back") || roleLower.includes("node")
                    ? ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST APIs", "Docker", "Git", "TypeScript"]
                    : ["Java", "Python", "SQL", "Git", "Data Structures", "Algorithms", "Object-Oriented Design", "REST APIs"];

                  const missing = recs.filter((r) => !candidateSkills.map((s) => s.toLowerCase()).includes(r.toLowerCase()));
                  return missing.slice(0, 6).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        const existingGroups = resume.skills || [];
                        if (existingGroups.length === 0) {
                          onUpdateResume({
                            ...resume,
                            skills: [{ id: Math.random().toString(36).substring(2, 9), group: "Core Technologies", items: [skill] }],
                          });
                        } else {
                          const next = existingGroups.map((g, i) =>
                            i === 0 ? { ...g, items: [...g.items, skill] } : g
                          );
                          onUpdateResume({ ...resume, skills: next });
                        }
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-900 hover:bg-lt-blue hover:text-white transition-colors"
                    >
                      + {skill}
                    </button>
                  ));
                })()}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {["Languages", "Frameworks & Libraries", "Tools & Databases"].map((grpName) => (
                <button
                  key={grpName}
                  type="button"
                  onClick={() => {
                    if (!(resume.skills || []).some((s) => s.group === grpName)) {
                      onUpdateResume({
                        ...resume,
                        skills: [
                          ...(resume.skills || []),
                          { id: Math.random().toString(36).substring(2, 9), group: grpName, items: [] },
                        ],
                      });
                    }
                  }}
                  className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-lt-blue hover:text-lt-blue"
                >
                  + {grpName}
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              {(resume.skills || []).map((grp, gIdx) => (
                <div key={grp.id || gIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={grp.group}
                      onChange={(e) => {
                        const next = (resume.skills || []).map((s, i) =>
                          i === gIdx ? { ...s, group: e.target.value } : s
                        );
                        onUpdateResume({ ...resume, skills: next });
                      }}
                      className="text-xs font-bold text-slate-800 bg-transparent border-b border-slate-300 focus:border-lt-blue outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (resume.skills || []).filter((_, i) => i !== gIdx);
                        onUpdateResume({ ...resume, skills: next });
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Skills chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {(grp.items || []).map((item, itemIdx) => (
                      <span
                        key={itemIdx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-700"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextItems = grp.items.filter((_, j) => j !== itemIdx);
                            const next = (resume.skills || []).map((s, i) =>
                              i === gIdx ? { ...s, items: nextItems } : s
                            );
                            onUpdateResume({ ...resume, skills: next });
                          }}
                          className="hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add skill input */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Add skill (press Enter)..."
                      className="flex-1 text-xs px-2 py-1 rounded-md border border-slate-200 bg-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            const next = (resume.skills || []).map((s, i) =>
                              i === gIdx ? { ...s, items: [...(s.items || []), val] } : s
                            );
                            onUpdateResume({ ...resume, skills: next });
                            e.currentTarget.value = "";
                          }
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isCertifications && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Certifications & Academic Achievements (Fresher Boost)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateResume({
                    ...resume,
                    certifications: [
                      ...(resume.certifications || []),
                      {
                        id: Math.random().toString(36).substring(2, 9),
                        name: "",
                        issuer: "",
                        year: "2024",
                      },
                    ],
                  });
                }}
                className="flex-1 text-xs font-bold py-1.5 px-2 rounded-lg bg-white border border-slate-300 hover:border-lt-blue hover:text-lt-blue"
              >
                + Add Certification
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateResume({
                    ...resume,
                    achievements: [
                      ...(resume.achievements || []),
                      "Hackathon finalist or competitive coding achievement",
                    ],
                  });
                }}
                className="flex-1 text-xs font-bold py-1.5 px-2 rounded-lg bg-white border border-slate-300 hover:border-lt-blue hover:text-lt-blue"
              >
                + Add Achievement
              </button>
            </div>

            {(resume.certifications || []).map((c, cIdx) => (
              <div key={c.id || cIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => {
                      const next = (resume.certifications || []).map((item, i) =>
                        i === cIdx ? { ...item, name: e.target.value } : item
                      );
                      onUpdateResume({ ...resume, certifications: next });
                    }}
                    placeholder="Certification Name"
                    className="flex-1 text-xs font-bold p-1 rounded border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = (resume.certifications || []).filter((_, i) => i !== cIdx);
                      onUpdateResume({ ...resume, certifications: next });
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={c.issuer || ""}
                    onChange={(e) => {
                      const next = (resume.certifications || []).map((item, i) =>
                        i === cIdx ? { ...item, issuer: e.target.value } : item
                      );
                      onUpdateResume({ ...resume, certifications: next });
                    }}
                    placeholder="Issuer (e.g. Coursera)"
                    className="text-xs p-1 rounded border border-slate-200 bg-white"
                  />
                  <input
                    type="text"
                    value={c.year || ""}
                    onChange={(e) => {
                      const next = (resume.certifications || []).map((item, i) =>
                        i === cIdx ? { ...item, year: e.target.value } : item
                      );
                      onUpdateResume({ ...resume, certifications: next });
                    }}
                    placeholder="Year (e.g. 2024)"
                    className="text-xs p-1 rounded border border-slate-200 bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================================================== */}
        {/* CHECKPOINT F: STRUCTURE & LAYOUT (Kind C) */}
        {/* ==================================================== */}
        {isLayout && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                Total Resume Length: {totalResumeWords} words
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {totalResumeWords < 350
                  ? "Your resume is too brief. Recruiters and ATS engines need at least 350-500 words across projects, skills, and education to evaluate technical capability."
                  : totalResumeWords > 650
                  ? "Your resume exceeds 1 page (over 650 words). Fresher resumes should stay strictly on a single page."
                  : "Excellent length! Your content comfortably fits a clean 1-page A4 format."}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Jump to section:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Projects", id: "field-projects-0" },
                  { label: "Skills", id: "field-skills-0" },
                  { label: "Education", id: "field-education-0" },
                  { label: "Summary", id: "field-summary" },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(s.id);
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="py-1.5 px-2 text-xs font-bold bg-white border border-slate-200 hover:border-lt-blue hover:text-lt-blue rounded-lg text-slate-700 shadow-2xs text-left"
                  >
                    Go to {s.label} →
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* CHECKPOINT G: CLEAN & SAFE (Placeholders, Sensitive, Cliches) */}
        {/* ==================================================== */}
        {isCleanPlaceholders && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Template brackets like <code>[X%]</code>, <code>[Tool]</code> or <code>[Your Name]</code> indicate unfilled templates and result in automatic ATS rejection.
            </p>
            <button
              type="button"
              onClick={() => {
                // Strip all brackets across summary, bullets, and text
                const cleanText = (str: string) => str.replace(/\[[^\]]*\]/g, "").replace(/\[|\]/g, "").trim();
                const nextProjects = (resume.projects || []).map((p) => ({
                  ...p,
                  bullets: (p.bullets || []).map(cleanText),
                }));
                const nextExp = (resume.experience || []).map((e) => ({
                  ...e,
                  bullets: (e.bullets || []).map(cleanText),
                }));
                onUpdateResume({
                  ...resume,
                  summary: cleanText(resume.summary || ""),
                  projects: nextProjects,
                  experience: nextExp,
                });
              }}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs transition-all"
            >
              One-Tap Clean: Remove All Bracket Placeholders
            </button>
          </div>
        )}

        {isCleanSensitive && (
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-800">
              <span className="font-bold block">Sensitive Personal Data Detected</span>
              <p className="text-[11px] leading-relaxed">
                Indian and international tech recruiters explicitly discard resumes containing Date of Birth, Marital Status, Religion, Father&apos;s Name, or Aadhaar numbers to avoid bias and data privacy liabilities.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                // Strip sensitive patterns from summary and bullets
                let s = resume.summary || "";
                SENSITIVE_PATTERNS.forEach(({ regex }) => {
                  s = s.replace(regex, "");
                });
                onUpdateResume({
                  ...resume,
                  summary: s.trim(),
                });
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-2xs transition-all"
            >
              One-Tap Clean: Remove Sensitive Disclosures
            </button>
          </div>
        )}

        {isCleanCliches && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
              <span className="font-bold block">Empty Buzzwords & Clichés</span>
              <p className="text-[11px] leading-relaxed">
                Phrases like &ldquo;hardworking team player&rdquo; take up space without proving technical competency.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                let s = resume.summary || "";
                CLICHES.forEach((c) => {
                  const reg = new RegExp(`\\b${c}\\b\\s*`, "gi");
                  s = s.replace(reg, "");
                });
                onUpdateResume({
                  ...resume,
                  summary: s.replace(/\s\s+/g, " ").trim(),
                });
              }}
              className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-2xs transition-all"
            >
              One-Tap Clean: Remove All Empty Buzzwords
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
