"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, CheckCircle2, Loader2, ArrowLeft, Shield } from "lucide-react";

function AnalyzingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Reading your resume", desc: "Extracting sections and structural elements..." },
    { title: "Checking ATS compatibility", desc: "Checking parsability and section hierarchy..." },
    { title: "Scoring each section", desc: "Evaluating against the 100-point rubric..." },
    { title: "Writing recommendations", desc: "Composing line-by-line rewrites & course matches..." },
  ];

  useEffect(() => {
    if (!reportId) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/report/${reportId}`);
          }, 800);
          return prev;
        }
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [reportId, router, steps.length]);

  return (
    <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-soft border border-slate-100 text-center space-y-6">
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-lt-yellow border-t-lt-blue animate-spin" />
        <Sparkles className="w-8 h-8 text-lt-blue animate-pulse" />
      </div>

      <div>
        <h1 className="font-heading font-extrabold text-2xl text-lt-blue-dark">
          Analyzing Your Resume
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Please keep this window open while we benchmark your resume.
        </p>
      </div>

      <div className="space-y-3 text-left">
        {steps.map((s, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          return (
            <div
              key={s.title}
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                isDone
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : isCurrent
                  ? "bg-amber-50 border-amber-300 text-amber-900 shadow-sm"
                  : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-sm leading-tight">{s.title}</p>
                <p className="text-xs opacity-80 mt-0.5">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!reportId && (
        <div className="pt-2">
          <Link
            href="/check"
            className="inline-flex items-center gap-2 text-sm text-lt-blue hover:underline font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Upload Resume</span>
          </Link>
        </div>
      )}

      <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Shield className="w-3.5 h-3.5" />
        <span>Uploaded file is deleted immediately after extraction</span>
      </div>
    </div>
  );
}

export default function AnalyzingPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6">
      <Suspense
        fallback={
          <div className="text-center p-8 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-lt-blue" />
            <span>Loading...</span>
          </div>
        }
      >
        <AnalyzingContent />
      </Suspense>
    </div>
  );
}
