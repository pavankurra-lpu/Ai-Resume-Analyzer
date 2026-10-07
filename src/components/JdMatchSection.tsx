import React from "react";
import { JdMatchSchema } from "@/lib/schema";
import { z } from "zod";
import { Target, Check, AlertCircle, Sparkles } from "lucide-react";

type JdMatchType = z.infer<typeof JdMatchSchema>;

interface JdMatchSectionProps {
  jdMatch: JdMatchType;
}

export default function JdMatchSection({ jdMatch }: JdMatchSectionProps) {
  if (!jdMatch) return null;

  return (
    <div className="bg-white rounded-card p-6 sm:p-7 border border-slate-200/80 shadow-soft space-y-6">
      {/* Title & Match % */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="font-heading font-bold text-lg text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-lt-blue" />
            <span>Job Description Match Analysis</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Keyword alignment between your target job description and current resume text.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-extrabold text-lt-blue font-heading leading-none">
              {jdMatch.percentage}%
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              JD Alignment
            </span>
          </div>
          <div className="w-16 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                jdMatch.percentage >= 70
                  ? "bg-emerald-500"
                  : jdMatch.percentage >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${jdMatch.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Keywords Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords (Green Chips) */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Matched Keywords in Your Resume ({jdMatch.matched_keywords.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {jdMatch.matched_keywords.length > 0 ? (
              jdMatch.matched_keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold"
                >
                  ✓ {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No direct keyword matches detected.</span>
            )}
          </div>
        </div>

        {/* Missing Keywords (Red Chips) */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Missing High-Priority Keywords ({jdMatch.missing_keywords.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {jdMatch.missing_keywords.length > 0 ? (
              jdMatch.missing_keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-semibold"
                >
                  + {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-600 font-medium">
                Awesome! All major target JD keywords are present.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Advice block */}
      {jdMatch.advice && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>How to bridge the keyword gap:</span>
          </div>
          <p className="text-slate-700 leading-relaxed">{jdMatch.advice}</p>
        </div>
      )}
    </div>
  );
}
