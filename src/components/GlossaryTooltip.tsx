"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

export const GLOSSARY: Record<string, { term: string; simple: string }> = {
  ats: {
    term: "ATS (Applicant Tracking System)",
    simple: "A computer program companies use to read hundreds of resumes and filter candidates before a human recruiter looks at them.",
  },
  keyword: {
    term: "Keyword",
    simple: "Important skills, tools, or qualifications named in the job description that computer filters look for.",
  },
  metric: {
    term: "Metric (Numbers / Results)",
    simple: "Hard numbers like %, counts, hours saved, or scale that prove you did the work well (e.g. 'cut load time by 30%').",
  },
  actionverb: {
    term: "Action Verb",
    simple: "Strong power words at the start of a sentence that show you made something happen (e.g. Built, Optimized, Engineered).",
  },
  bullet: {
    term: "Resume Bullet Point",
    simple: "A short 1 to 2-line sentence explaining what you accomplished in a project or job.",
  },
  summary: {
    term: "Career Summary",
    simple: "A 2 to 3-sentence introduction at the top of your resume stating your target job role and top 3 technical skills.",
  },
};

interface GlossaryTooltipProps {
  termKey: keyof typeof GLOSSARY;
  children?: React.ReactNode;
}

export default function GlossaryTooltip({ termKey, children }: GlossaryTooltipProps) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[termKey];

  if (!entry) return <>{children}</>;

  return (
    <span className="relative inline-flex items-center gap-0.5">
      <span
        onClick={() => setOpen(!open)}
        className="underline decoration-dotted decoration-lt-blue/60 underline-offset-2 cursor-pointer font-medium hover:text-lt-blue transition-colors"
      >
        {children || entry.term}
      </span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-slate-400 hover:text-lt-blue p-0.5 focus:outline-none"
        aria-label={`Explain ${entry.term}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white rounded-xl text-xs shadow-xl z-50 animate-in fade-in zoom-in-95">
            <p className="font-bold text-lt-yellow text-[11px] mb-1">{entry.term}</p>
            <p className="text-slate-200 leading-relaxed text-[11.5px]">{entry.simple}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
          </div>
        </>
      )}
    </span>
  );
}
