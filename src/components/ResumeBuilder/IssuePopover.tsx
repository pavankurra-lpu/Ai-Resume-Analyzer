"use client";

import React, { useState } from "react";
import { Sparkles, AlertCircle, CheckCircle2, ArrowRight, X, RefreshCw, Edit3 } from "lucide-react";
import { CheckpointResult, ACTION_VERBS } from "@/lib/scoring";

interface IssuePopoverProps {
  checkpoint: CheckpointResult;
  currentText: string;
  onApply: (newText: string) => void;
  onClose: () => void;
  onFocusField: () => void;
}

export default function IssuePopover({
  checkpoint,
  currentText,
  onApply,
  onClose,
  onFocusField,
}: IssuePopoverProps) {
  const [metricInput, setMetricInput] = useState("");
  const [activeRewriteIndex, setActiveRewriteIndex] = useState(0);

  // Generate dynamic alternative rewrites based on current text and action verbs
  const verbs = ["Engineered", "Architected", "Spearheaded", "Optimized", "Automated", "Streamlined"];
  const currentFirstWord = currentText.trim().split(/\s+/)[0] || "";
  const remainingText = currentText.trim().split(/\s+/).slice(1).join(" ") || "scalable features and automated workflows.";

  const dynamicRewrites = [
    checkpoint.sampleStrong || `${verbs[0]} ${remainingText} boosting throughput by [X%].`,
    `${verbs[1]} ${remainingText} slashing latency by [X%].`,
    `${verbs[2]} ${remainingText} serving [X+] active users with 99.9% uptime.`,
  ];

  const currentRewrite = dynamicRewrites[activeRewriteIndex % dynamicRewrites.length];

  const handleApplyWithMetric = () => {
    const val = metricInput.trim() || "25%";
    const filled = currentRewrite.replace(/\[X%?\]/g, val).replace(/\[X\+?\]/g, val);
    onApply(filled);
  };

  const handleCycleRewrite = () => {
    setActiveRewriteIndex((prev) => prev + 1);
  };

  const isRed = checkpoint.severity === "must-fix";

  return (
    <div className="fixed inset-0 sm:absolute sm:inset-auto z-50 flex items-center justify-center sm:block p-4 sm:p-0">
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs sm:hidden"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-50 text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                isRed
                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{isRed ? "Must Fix" : "Improve"}</span>
              <span className="font-mono">(+{checkpoint.points} pts)</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Issue Explanation */}
        <div>
          <h4 className="font-heading font-bold text-sm text-lt-blue-dark">
            {checkpoint.title}
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {checkpoint.message}
          </p>
        </div>

        {/* Recruiter Insight */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs space-y-1">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Why Recruiters Care
          </span>
          <p className="text-slate-600 leading-relaxed">
            {checkpoint.whyRecruitersCare}
          </p>
        </div>

        {/* Suggested Rewrite */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Suggested High-Impact Rewrite
            </span>
            <button
              type="button"
              onClick={handleCycleRewrite}
              className="text-[11px] font-semibold text-lt-blue hover:text-lt-blue-dark inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Another idea</span>
            </button>
          </div>

          <div className="bg-lt-bg-soft/70 border border-indigo-100 rounded-xl p-3 text-xs font-medium text-slate-800 leading-relaxed font-sans">
            {currentRewrite}
          </div>
        </div>

        {/* Number / Metric input if rewrite contains placeholder */}
        {currentRewrite.includes("[X") && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-2">
            <label className="text-[11px] font-bold text-amber-900 block">
              Enter your real number or metric:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={metricInput}
                onChange={(e) => setMetricInput(e.target.value)}
                placeholder="e.g. 35%, 10,000+, 2 weeks"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lt-blue"
              />
              <button
                type="button"
                onClick={handleApplyWithMetric}
                className="bg-lt-blue hover:bg-lt-blue-dark text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                Apply
              </button>
            </div>
            <p className="text-[10px] text-amber-700 italic">
              Honesty policy: Never guess or invent metrics. Use your real project numbers.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onFocusField();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit myself</span>
          </button>

          {!currentRewrite.includes("[X") ? (
            <button
              type="button"
              onClick={() => onApply(currentRewrite)}
              className="inline-flex items-center gap-1.5 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-transform transform active:scale-95"
            >
              <span>Use this</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyWithMetric}
              className="inline-flex items-center gap-1.5 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-transform transform active:scale-95"
            >
              <span>Insert with metric</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
