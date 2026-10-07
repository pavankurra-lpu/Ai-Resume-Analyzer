"use client";

import React from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { CheckpointResult } from "@/lib/scoring";

export interface TrackCoachProps {
  score: number;
  initialScore: number;
  redCount: number;
  amberCount: number;
  pointsPopped?: number | null;
  nextFix?: {
    checkpoint: CheckpointResult;
  } | null;
  onNextFix?: () => void;
}

export function triggerMilestoneConfetti() {
  if (typeof window !== "undefined") {
    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    // Mobile haptic vibration if supported
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // ignore
      }
    }
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#2B3A92", "#FBDD05", "#14B8A6", "#22C55E"],
      disableForReducedMotion: true,
      ticks: 80,
    });
  }
}

export default function TrackCoach({
  score,
  initialScore,
  redCount,
  amberCount,
  pointsPopped,
  nextFix,
  onNextFix,
}: TrackCoachProps) {
  const levelInfo =
    score < 50
      ? {
          label: "Starter",
          chip: "bg-rose-100 text-rose-800 border-rose-200",
          bar: "bg-rose-500",
          ptsToNext: `${50 - score} pts to Rising`,
        }
      : score < 70
      ? {
          label: "Rising",
          chip: "bg-amber-100 text-amber-800 border-amber-200",
          bar: "bg-amber-500",
          ptsToNext: `${70 - score} pts to Almost there`,
        }
      : score < 85
      ? {
          label: "Almost there",
          chip: "bg-teal-100 text-teal-800 border-teal-200",
          bar: "bg-teal-500",
          ptsToNext: `${85 - score} pts to Shortlist-ready`,
        }
      : {
          label: "Shortlist-ready",
          chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
          bar: "bg-emerald-500",
          ptsToNext: "Shortlist-ready",
        };

  const scoreDiff = score - initialScore;

  return (
    <div className="space-y-2.5">
      {/* Top Header: Label + Level Chip */}
      <div className="flex items-center justify-between">
        <span className="font-heading font-extrabold text-xs text-slate-700 tracking-tight">
          Shortlist readiness
        </span>
        <span
          className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${levelInfo.chip}`}
        >
          {levelInfo.label}
        </span>
      </div>

      {/* Progress Bar with Thin Ticks at 50/70/85 */}
      <div className="relative w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
        {/* Tick marks */}
        <div
          className="absolute top-0 bottom-0 left-[50%] w-[1.5px] bg-white/90 z-10 pointer-events-none"
          title="Rising (50)"
        />
        <div
          className="absolute top-0 bottom-0 left-[70%] w-[1.5px] bg-white/90 z-10 pointer-events-none"
          title="Almost there (70)"
        />
        <div
          className="absolute top-0 bottom-0 left-[85%] w-[1.5px] bg-white/90 z-10 pointer-events-none"
          title="Shortlist-ready (85)"
        />

        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all duration-500 ${levelInfo.bar}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {/* Text Row: Score on left, pts to next on right */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600 text-[11px]">
          <strong className="text-slate-900 font-bold">{score}/100</strong> ·{" "}
          {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} since start
          {pointsPopped && pointsPopped > 0 && (
            <span className="ml-1.5 inline-block text-emerald-600 font-extrabold animate-bounce text-[11px]">
              +{pointsPopped}!
            </span>
          )}
        </span>
        <span className="text-slate-500 text-[11px] font-medium">
          {levelInfo.ptsToNext}
        </span>
      </div>

      {/* Next Fix Button / Completed Box */}
      {nextFix ? (
        <button
          type="button"
          onClick={onNextFix}
          className="w-full text-left p-2.5 rounded-xl border border-slate-200/90 hover:border-lt-blue bg-white hover:bg-slate-50 transition-all shadow-2xs group flex items-center justify-between gap-2"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10.5px] mb-0.5">
              <span className="font-extrabold text-lt-blue uppercase tracking-wide">
                Next fix
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">
                <span className="text-rose-600 font-bold">{redCount} must-fix</span>,{" "}
                <span className="text-amber-600 font-bold">{amberCount} to improve</span>
              </span>
            </div>
            <div className="text-xs font-bold text-slate-800 truncate group-hover:text-lt-blue transition-colors">
              {nextFix.checkpoint.title}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
              +{nextFix.checkpoint.points} pts
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-lt-blue group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>
      ) : (
        <div className="w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>All checks passed. Ready to download.</span>
        </div>
      )}
    </div>
  );
}
