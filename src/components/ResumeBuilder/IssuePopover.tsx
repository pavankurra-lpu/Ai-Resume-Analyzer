"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, ArrowRight, X, Edit3, Sparkles } from "lucide-react";
import { CheckpointResult, evaluateBulletPoint } from "@/lib/scoring";

interface IssuePopoverProps {
  checkpoint: CheckpointResult;
  currentText: string;
  onApply: (newText: string) => void;
  onClose: () => void;
  onFocusField: () => void;
}

const VERB_CHIPS = ["Built", "Developed", "Designed", "Implemented", "Optimized", "Automated"];

function applyVerb(text: string, verb: string): string {
  const trimmed = text.trim();
  if (!trimmed) return `${verb} `;
  const weakOpenersRegex = /^(worked on|responsible for|helped with|assisted in|involved in|handled|contributed to|supported|tasked with)\b\s*/i;
  if (weakOpenersRegex.test(trimmed)) {
    return trimmed.replace(weakOpenersRegex, `${verb} `);
  }
  const ingWordRegex = /^[a-zA-Z]+ing\b\s*/i;
  if (ingWordRegex.test(trimmed)) {
    return trimmed.replace(ingWordRegex, `${verb} `);
  }
  const firstCharLower = trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
  return `${verb} ${firstCharLower}`;
}

export default function IssuePopover({
  checkpoint,
  currentText,
  onApply,
  onClose,
  onFocusField,
}: IssuePopoverProps) {
  const [draftText, setDraftText] = useState(currentText);
  const [metricInput, setMetricInput] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Live checks
  const evalResult = evaluateBulletPoint(draftText);
  const hasPlaceholder = /\[([^\]]+)\]/.test(draftText);
  const isWordCountValid = evalResult.wordCount >= 8 && evalResult.wordCount <= 35;

  const handleAddMetric = () => {
    const metric = metricInput.trim();
    if (!metric) return;

    const placeholderRegex = /\[([^\]]+)\]/;
    if (placeholderRegex.test(draftText)) {
      setDraftText((prev) => prev.replace(placeholderRegex, metric));
    } else {
      const trimmed = draftText.trim().replace(/\.+$/, "");
      setDraftText(`${trimmed}, ${metric}.`);
    }
    setMetricInput("");
  };

  const isRed = checkpoint.severity === "must-fix";
  const isUnchanged = draftText.trim() === currentText.trim();
  const isEmpty = !draftText.trim();

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:right-auto sm:w-[420px] z-40 max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 space-y-3 text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
              isRed
                ? "bg-rose-100 text-rose-800 border border-rose-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{isRed ? "Must Fix" : "Improve"}</span>
            <span className="font-mono font-bold">(+{checkpoint.points} pts)</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="font-heading font-bold text-xs text-lt-blue-dark">
          {checkpoint.title}
        </h4>
        <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">
          {checkpoint.message}
        </p>
      </div>

      {/* Editable Textarea prefilled with user's own text */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 block">
          Edit bullet draft:
        </label>
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          rows={3}
          placeholder="Enter bullet point text..."
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-lt-blue text-slate-800 resize-none font-sans leading-relaxed"
        />
      </div>

      {/* Verb Chips if action verb missing */}
      {!evalResult.hasVerb && (
        <div className="space-y-1.5 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
          <span className="text-[11px] font-bold text-indigo-900 block">
            Add an action verb:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {VERB_CHIPS.map((verb) => (
              <button
                key={verb}
                type="button"
                onClick={() => setDraftText(applyVerb(draftText, verb))}
                className="px-2 py-1 rounded-lg bg-white hover:bg-lt-blue hover:text-white text-lt-blue-dark font-heading font-bold text-[11px] border border-indigo-200/80 transition-all shadow-2xs"
              >
                + {verb}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metric Input Box if number is missing or placeholders exist */}
      {(!evalResult.hasMetric || hasPlaceholder) && (
        <div className="space-y-1.5 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
          <label className="text-[11px] font-bold text-amber-900 block">
            Enter your real number or metric:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={metricInput}
              onChange={(e) => setMetricInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && metricInput.trim()) {
                  e.preventDefault();
                  handleAddMetric();
                }
              }}
              placeholder="e.g. 35%, 10,000+ users, 2 weeks"
              className="flex-1 px-2.5 py-1 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lt-blue"
            />
            <button
              type="button"
              disabled={!metricInput.trim()}
              onClick={handleAddMetric}
              className="bg-lt-blue hover:bg-lt-blue-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs px-3 py-1 rounded-lg shadow-2xs transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-[10px] text-amber-800 italic">
            Honesty policy: never guess or invent metrics.
          </p>
        </div>
      )}

      {/* Live Check Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10.5px]">
        <span
          className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
            evalResult.hasVerb
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {evalResult.hasVerb ? "✓ Action verb" : "Action verb"}
        </span>

        <span
          className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
            evalResult.hasMetric
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {evalResult.hasMetric ? "✓ Has a number" : "Has a number"}
        </span>

        <span
          className={`px-2 py-0.5 rounded-full font-bold ${
            isWordCountValid
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {evalResult.wordCount} words (8–35)
        </span>
      </div>

      {/* Collapsed Example Strong Only */}
      {checkpoint.sampleStrong && (
        <details className="text-xs text-slate-500 rounded-xl bg-slate-50/80 border border-slate-200/80 p-2.5">
          <summary className="cursor-pointer font-bold text-slate-700 hover:text-slate-900 select-none text-[11px]">
            Example only (don't copy the numbers)
          </summary>
          <p className="mt-1.5 text-slate-700 text-[11px] leading-relaxed italic bg-white p-2 rounded-lg border border-slate-200/60">
            {checkpoint.sampleStrong}
          </p>
        </details>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            onFocusField();
            onClose();
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit in resume</span>
        </button>

        <button
          type="button"
          disabled={isEmpty || isUnchanged}
          onClick={() => onApply(draftText.trim())}
          className="inline-flex items-center gap-1.5 bg-lt-yellow hover:bg-lt-yellow-hover disabled:opacity-40 disabled:cursor-not-allowed text-lt-blue-dark font-heading font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-transform transform active:scale-95"
        >
          <span>Apply to resume</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
