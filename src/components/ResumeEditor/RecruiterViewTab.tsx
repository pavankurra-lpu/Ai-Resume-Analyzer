"use client";

import React from "react";
import { StructuredResume } from "@/lib/resumeTypes";
import { Eye, ShieldAlert, CheckCircle2, HelpCircle, AlertCircle, Sparkles } from "lucide-react";

interface RecruiterViewTabProps {
  resume: StructuredResume;
  score: number;
}

export default function RecruiterViewTab({ resume, score }: RecruiterViewTabProps) {
  // Determine Recruiter Verdict based on score
  const verdict =
    score >= 85
      ? {
          status: "Likely Shortlist",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          reasons: [
            "Clear technical project evidence with measurable metrics.",
            "Categorized, highly relevant skills that match standard fresher job descriptions.",
            "Clean single-column layout that ATS filters and recruiters parse in seconds.",
          ],
          improvements: [
            "Add direct live deployment URLs to your top GitHub repositories.",
            "Be ready to explain the architecture choices in your primary project during tech rounds.",
          ],
        }
      : score >= 65
      ? {
          status: "Maybe (Borderline)",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          reasons: [
            "Relevant skills are present, but bullet points lack quantifiable numbers and measurable outcomes.",
            "Summary is somewhat generic and doesn't hook the recruiter in the first 3 seconds.",
            "Missing links to live demo deployments or verified hackathon/competition achievements.",
          ],
          improvements: [
            "Add realistic numbers (e.g. % speedup, user count, test coverage) to at least 3 bullets.",
            "Refactor summary to lead with your core technical specialization.",
          ],
        }
      : {
          status: "Needs Work (Risk of Rejection)",
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          reasons: [
            "Bullets start with passive duty words ('Responsible for', 'Worked on') instead of action verbs.",
            "Too few specific skills listed or missing distinct categorization.",
            "Unclear what role the candidate is specifically targeting.",
          ],
          improvements: [
            "Convert weak openers to strong past-tense action verbs (Engineered, Architected, Automated).",
            "Fill in all project tech stacks and details using the AI Coach suggestions.",
          ],
        };

  // Potential interview questions
  const interviewQuestions: string[] = [];
  if (resume.projects.length > 0) {
    const p1 = resume.projects[0];
    interviewQuestions.push(
      `"In your '${p1.name}' project, what was the biggest technical bottleneck you faced and how did you resolve it?"`
    );
  }
  if (resume.experience.length > 0) {
    const e1 = resume.experience[0];
    interviewQuestions.push(
      `"Can you walk me through your daily workflow and deliverables at ${e1.company}?"`
    );
  } else {
    interviewQuestions.push(
      `"Since you don't have full-time corporate experience yet, how did you collaborate with others on your capstone projects?"`
    );
  }
  interviewQuestions.push(
    `"Why did you choose ${resume.skills[0]?.items.slice(0, 2).join(" and ") || "this stack"} over other alternatives?"`
  );

  return (
    <div className="space-y-6">
      {/* 6-Second Scan Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-lt-blue" />
          <h3 className="font-heading font-bold text-sm text-slate-800">
            Typical 6-Second Recruiter Scan Order
          </h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Tech recruiters review hundreds of resumes each week. Here is the exact order their eyes scan in the first 10 seconds (labeled as an industry scan guide, not eye-tracking telemetry):
        </p>

        <div className="space-y-2 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-lt-blue text-white font-extrabold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
              1
            </span>
            <div>
              <strong className="text-slate-800 block">Name, Headline & Professional Links</strong>
              <span className="text-slate-600 text-[11px]">Recruiters verify your target role and check if GitHub/LinkedIn links are visible.</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-lt-blue text-white font-extrabold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
              2
            </span>
            <div>
              <strong className="text-slate-800 block">Skills Section</strong>
              <span className="text-slate-600 text-[11px]">They quickly skim for required stack matches (e.g. React, Python, SQL) before reading any descriptions.</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-lt-blue text-white font-extrabold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
              3
            </span>
            <div>
              <strong className="text-slate-800 block">Top Featured Project or Latest Experience</strong>
              <span className="text-slate-600 text-[11px]">They read the first 1-2 bullet points looking for numbers, results, and architecture ownership.</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-lt-blue text-white font-extrabold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
              4
            </span>
            <div>
              <strong className="text-slate-800 block">Education, Branch & Graduation Year</strong>
              <span className="text-slate-600 text-[11px]">They confirm your college batch (e.g. 2024 passout) to verify batch eligibility criteria.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter Verdict Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-slate-800">
            Recruiter Screening Verdict
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${verdict.bg}`}>
            {verdict.status}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <strong className="text-slate-700 block">Top Reasons for this Verdict:</strong>
          {verdict.reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{r}</span>
            </div>
          ))}
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
          <strong className="text-amber-900 block font-bold">What would improve your callback odds most:</strong>
          {verdict.improvements.map((imp, i) => (
            <p key={i} className="text-slate-700 leading-relaxed">• {imp}</p>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 italic flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Note: AI estimate based on tech recruiter rubric calibrations, not a guaranteed shortlist.</span>
        </div>
      </div>

      {/* Questions a Recruiter May Ask */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          <h3 className="font-heading font-bold text-sm text-slate-800">
            Interview Questions to Prepare For
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Based on the details currently in your resume, expect technical interviewers to ask:
        </p>
        <div className="space-y-2 pt-1 text-xs">
          {interviewQuestions.map((q, i) => (
            <div key={i} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-purple-950 font-medium leading-relaxed">
              {q}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
