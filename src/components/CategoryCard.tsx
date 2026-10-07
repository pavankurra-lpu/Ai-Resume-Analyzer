"use client";

import React, { useState } from "react";
import { CategoryResult } from "@/lib/schema";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Quote,
} from "lucide-react";

interface CategoryCardProps {
  category: CategoryResult;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const percentage = Math.round((category.score / category.max_score) * 100);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getPriorityBadge = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "Medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getBarColor = (pct: number) => {
    if (pct < 50) return "bg-rose-500";
    if (pct < 70) return "bg-amber-500";
    if (pct < 85) return "bg-teal-500";
    return "bg-emerald-500";
  };

  return (
    <div className="bg-white rounded-card border border-slate-200/80 shadow-soft overflow-hidden transition-all duration-200 hover:shadow-hover">
      {/* Header bar */}
      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-800 leading-snug">
              {category.name}
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {percentage}% Mastery
            </span>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-lt-blue">
              {category.score}
            </span>
            <span className="text-slate-400 font-bold text-sm"> / {category.max_score}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor(percentage)}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>

        {/* Strengths bullet points */}
        {category.strengths && category.strengths.length > 0 && (
          <div className="pt-2 space-y-1.5">
            {category.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{str}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expand/Collapse Issues Section */}
      {category.issues && category.issues.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold text-lt-blue hover:text-lt-blue-dark transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>
                {category.issues.length} {category.issues.length === 1 ? "Issue & Fix" : "Issues & Fixes"} to review
              </span>
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              {isOpen ? "Hide details" : "View fixes"}
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {isOpen && (
            <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-1 duration-200">
              {category.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm space-y-3"
                >
                  {/* Priority & Problem */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getPriorityBadge(
                        issue.priority
                      )}`}
                    >
                      {issue.priority} Priority
                    </span>
                  </div>

                  {/* Quoted Original Line */}
                  <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-lg text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-1">
                      <Quote className="w-3.5 h-3.5" />
                      <span>Original Resume Line:</span>
                    </div>
                    <p className="italic text-slate-700 font-mono text-[11.5px] leading-relaxed">
                      &quot;{issue.original_text}&quot;
                    </p>
                  </div>

                  {/* Problem Description */}
                  <div className="text-xs text-slate-600 space-y-1">
                    <strong className="text-slate-800">The Problem: </strong>
                    <span>{issue.problem}</span>
                  </div>

                  {/* Recommended Fix */}
                  <div className="text-xs text-slate-600 space-y-1">
                    <strong className="text-slate-800">Actionable Fix: </strong>
                    <span>{issue.fix}</span>
                  </div>

                  {/* Improved Rewrite Box */}
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-900">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>High-Impact Rewrite:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(issue.rewrite, idx)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-100/60 px-2 py-1 rounded border border-emerald-200 shadow-2xs transition-all"
                        title="Copy rewrite"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-900 font-medium leading-relaxed">
                      {issue.rewrite}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
