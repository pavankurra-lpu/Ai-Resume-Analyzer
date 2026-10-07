import React from "react";
import { Check, UploadCloud, BarChart3, Wrench, Download } from "lucide-react";

export type StepNumber = 1 | 2 | 3 | 4;

interface ProgressStepperProps {
  currentStep: StepNumber;
  reportId?: string;
}

export default function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const steps = [
    { num: 1, label: "Upload", icon: UploadCloud },
    { num: 2, label: "Your score", icon: BarChart3 },
    { num: 3, label: "Fix it", icon: Wrench },
    { num: 4, label: "Download", icon: Download },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200/80 shadow-2xs py-3 px-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {steps.map((s, idx) => {
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1 group flex-shrink-0">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isCurrent
                      ? "bg-lt-yellow text-lt-blue-dark ring-2 ring-lt-blue ring-offset-1 font-extrabold shadow-sm scale-105"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <span>{s.num}</span>}
                </div>
                <span
                  className={`text-[10px] sm:text-xs tracking-tight text-center ${
                    isCurrent
                      ? "font-extrabold text-lt-blue-dark"
                      : isDone
                      ? "font-bold text-slate-700"
                      : "text-slate-400 font-medium"
                  }`}
                >
                  {s.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 rounded-full transition-colors ${
                    s.num < currentStep ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
