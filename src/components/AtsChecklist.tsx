import React from "react";
import { AtsCheckResult } from "@/lib/schema";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

interface AtsChecklistProps {
  checks: AtsCheckResult[];
}

export default function AtsChecklist({ checks }: AtsChecklistProps) {
  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div className="bg-white rounded-card p-6 sm:p-7 border border-slate-200/80 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
        <div>
          <h3 className="font-heading font-bold text-lg text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lt-blue" />
            <span>ATS Compatibility Audit</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Applicant Tracking System parseability checks against Indian and global filters.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-lt-blue font-bold text-xs rounded-full border border-blue-100 self-start sm:self-auto">
          <span>{passedCount} / {checks.length} Passed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
        {checks.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
              item.passed
                ? "bg-emerald-50/40 border-emerald-100"
                : "bg-rose-50/40 border-rose-100"
            }`}
          >
            {item.passed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {item.check}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
