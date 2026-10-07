"use client";

import React, { useState } from "react";
import { Target, Check, Plus, AlertCircle, ShieldCheck } from "lucide-react";

interface KeywordPanelProps {
  matchedKeywords: string[];
  missingKeywords: string[];
  onAddSkill: (skill: string) => void;
}

export default function KeywordPanel({
  matchedKeywords,
  missingKeywords,
  onAddSkill,
}: KeywordPanelProps) {
  const [confirmedSkills, setConfirmedSkills] = useState<Record<string, boolean>>({});

  const handleToggleConfirm = (kw: string) => {
    setConfirmedSkills((prev) => ({
      ...prev,
      [kw]: !prev[kw],
    }));
  };

  const handleAddConfirmed = (kw: string) => {
    onAddSkill(kw);
    // remove confirmation
    setConfirmedSkills((prev) => {
      const copy = { ...prev };
      delete copy[kw];
      return copy;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-lt-blue" />
          <h3 className="font-heading font-bold text-sm text-slate-800">
            Target Job Keywords
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500">
          {matchedKeywords.length} Matched / {missingKeywords.length} Missing
        </span>
      </div>

      {/* Matched Keywords */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Matched In Your Resume ({matchedKeywords.length})</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {matchedKeywords.map((kw, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold"
            >
              ✓ {kw}
            </span>
          ))}
          {matchedKeywords.length === 0 && (
            <span className="text-xs text-slate-400 italic">No matched keywords yet.</span>
          )}
        </div>
      </div>

      {/* Missing Keywords with Honest Confirmation */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div>
          <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Missing Keywords ({missingKeywords.length})</span>
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Only add skills you actually know. Recruiters will test you on them!
          </p>
        </div>

        <div className="space-y-2">
          {missingKeywords.map((kw, i) => {
            const isConfirmed = Boolean(confirmedSkills[kw]);

            return (
              <div
                key={i}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 text-sm block">{kw}</span>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer mt-1 select-none">
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={() => handleToggleConfirm(kw)}
                      className="rounded text-lt-blue focus:ring-lt-blue"
                    />
                    <span>I really have hands-on knowledge of this skill</span>
                  </label>
                </div>

                <button
                  type="button"
                  disabled={!isConfirmed}
                  onClick={() => handleAddConfirmed(kw)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-lt-blue text-white font-bold text-xs hover:bg-lt-blue-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed self-end sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Skills</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
