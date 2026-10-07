"use client";

import React, { useState } from "react";
import { Sparkles, X, Check, RefreshCw, HelpCircle, ArrowRight, Lightbulb, MessageSquare } from "lucide-react";

export interface CoachModalData {
  fieldPath: string;
  fieldLabel: string;
  currentText: string;
  initialRewrite?: string;
  problem?: string;
  whyRecruitersCare?: string;
  question?: string;
  targetRole?: string;
}

interface AiCoachModalProps {
  data: CoachModalData;
  language: string; // 'en' | 'hi' | 'te'
  resumeId: string;
  onApply: (newText: string) => void;
  onClose: () => void;
}

export default function AiCoachModal({
  data,
  language,
  resumeId,
  onApply,
  onClose,
}: AiCoachModalProps) {
  const [rewrite, setRewrite] = useState(data.initialRewrite || "");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [altIndex, setAltIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(data.question || "");
  const [whyCare, setWhyCare] = useState(data.whyRecruitersCare || "");
  const [problem, setProblem] = useState(data.problem || "");

  // Rough to Polished states
  const [roughText, setRoughText] = useState("");
  const [roughLoading, setRoughLoading] = useState(false);

  // Fetch initial suggestion if not already passed
  React.useEffect(() => {
    if (!rewrite) {
      handleFetchSuggestion();
    }
  }, []);

  const handleFetchSuggestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resume/${resumeId}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "field-improve",
          currentText: data.currentText,
          fieldPath: data.fieldPath,
          targetRole: data.targetRole || "Software Engineer",
          language,
        }),
      });
      const d = await res.json();
      if (d.rewrite) setRewrite(d.rewrite);
      if (d.alternatives) setAlternatives(d.alternatives);
      if (d.question) setQuestion(d.question);
      if (d.whyRecruitersCare) setWhyCare(d.whyRecruitersCare);
      if (d.problem) setProblem(d.problem);
    } catch (e) {
      console.error("Failed to load coach suggestions:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleNextAlternative = () => {
    if (alternatives.length === 0) return;
    const nextIdx = (altIndex + 1) % alternatives.length;
    setAltIndex(nextIdx);
    setRewrite(alternatives[nextIdx]);
  };

  const handleRoughToPolished = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roughText.trim()) return;
    setRoughLoading(true);
    try {
      const res = await fetch(`/api/resume/${resumeId}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rough-to-polished",
          currentText: roughText.trim(),
          fieldPath: data.fieldPath,
          targetRole: data.targetRole || "Software Engineer",
          language,
        }),
      });
      const d = await res.json();
      if (d.polished) setRewrite(d.polished);
      if (d.alternatives) setAlternatives(d.alternatives);
      if (d.question) setQuestion(d.question);
      if (d.whyRecruitersCare) setWhyCare(d.whyRecruitersCare);
    } catch (e) {
      console.error("Rough to polished error:", e);
    } finally {
      setRoughLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-lt-blue-dark">
                AI Coach: {data.fieldLabel}
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Recruiter-Calibrated Improvement</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Original Text */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
            Your Current Line:
          </span>
          <p className="text-slate-800 italic">{data.currentText || "(Empty)"}</p>
        </div>

        {/* 2. What is Wrong & Why Recruiters Care */}
        {(problem || whyCare) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {problem && (
              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl space-y-0.5">
                <strong className="text-rose-800 block font-bold text-[11px]">What is missing:</strong>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">{problem}</p>
              </div>
            )}
            {whyCare && (
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-0.5">
                <strong className="text-lt-blue block font-bold text-[11px]">Why recruiters care:</strong>
                <p className="text-slate-700 leading-relaxed text-[11.5px]">{whyCare}</p>
              </div>
            )}
          </div>
        )}

        {/* 3. Recommended Rewrite */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Rewrite:</span>
            </span>
            {alternatives.length > 0 && (
              <button
                type="button"
                onClick={handleNextAlternative}
                className="text-xs text-lt-blue hover:underline font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Give me another ({altIndex + 1}/{alternatives.length})</span>
              </button>
            )}
          </div>

          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs sm:text-sm text-slate-900 leading-relaxed font-medium">
            {loading ? "Generating recruiter-approved rewrite..." : rewrite}
          </div>

          {/* Question / Metric prompt */}
          {question && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-950">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Question:</strong> {question}{" "}
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  (Note: Never invent fake numbers. If you don&apos;t know the exact count, describe the impact in words.)
                </span>
              </p>
            </div>
          )}
        </div>

        {/* 4. Rough-to-Polished Converter Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-lt-blue" />
            <span>Not sure what to write? Type it in your own words:</span>
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={roughText}
              onChange={(e) => setRoughText(e.target.value)}
              placeholder="e.g. I made the login page and helped solve some bugs..."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lt-blue"
            />
            <button
              type="button"
              disabled={roughLoading || !roughText.trim()}
              onClick={handleRoughToPolished}
              className="px-3 py-2 bg-lt-blue text-white rounded-lg text-xs font-bold hover:bg-lt-blue-dark transition-all disabled:opacity-50"
            >
              {roughLoading ? "Polishing..." : "Polish It"}
            </button>
          </div>
        </div>

        {/* 5. Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            I&apos;ll edit it myself
          </button>

          <button
            type="button"
            onClick={() => {
              onApply(rewrite);
              onClose();
            }}
            disabled={!rewrite || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Check className="w-4 h-4 text-lt-blue" />
            <span>Use This Rewrite</span>
          </button>
        </div>
      </div>
    </div>
  );
}
