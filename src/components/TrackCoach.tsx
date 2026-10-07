"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Volume2, VolumeX } from "lucide-react";

export type CoachMood = "thinking" | "happy" | "celebrating";

export interface TrackCoachProps {
  score: number;
  message?: string;
  mood?: CoachMood;
  pointsPopped?: number | null;
  milestoneTrigger?: string | null;
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
  message,
  mood = "happy",
  pointsPopped,
  milestoneTrigger,
}: TrackCoachProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (milestoneTrigger) {
      triggerMilestoneConfetti();
    }
  }, [milestoneTrigger]);

  const readinessLevel =
    score < 50
      ? { label: "Starter", color: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" }
      : score < 70
      ? { label: "Rising", color: "bg-amber-500", text: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200" }
      : score < 85
      ? { label: "Almost there", color: "bg-teal-500", text: "text-teal-800", bg: "bg-teal-50", border: "border-teal-200" }
      : { label: "Shortlist-ready", color: "bg-emerald-500", text: "text-emerald-800", bg: "bg-emerald-50", border: "border-emerald-200" };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3 relative overflow-hidden">
      {/* Pop animation for points */}
      {pointsPopped && pointsPopped > 0 && (
        <div className="absolute top-2 right-3 animate-bounce bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-full border border-emerald-300 shadow-xs">
          +{pointsPopped} pts! 🎯
        </div>
      )}

      {/* Top bar: Coach Mascot + Score readiness */}
      <div className="flex items-center gap-3">
        {/* Track SVG Avatar */}
        <div className="relative w-11 h-11 rounded-full bg-amber-100 border-2 border-lt-yellow flex items-center justify-center flex-shrink-0 shadow-2xs">
          <svg viewBox="0 0 100 100" className="w-8 h-8">
            {/* Graduation Cap in Brand Blue */}
            <path
              d="M50 20 L88 38 L50 56 L12 38 Z"
              fill="#2B3A92"
            />
            {/* Cap bottom skullcap */}
            <path
              d="M28 46 L28 62 C28 72 72 72 72 62 L72 46"
              fill="#1E2A6B"
            />
            {/* Gold Tassel */}
            <path
              d="M78 40 L86 58 C86 64 82 68 78 68"
              fill="none"
              stroke="#FBDD05"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Mascot Eyes depending on mood */}
            {mood === "celebrating" ? (
              <>
                <path d="M40 50 Q45 44 50 50" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M54 50 Q59 44 64 50" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : mood === "thinking" ? (
              <>
                <circle cx="44" cy="50" r="2.5" fill="#FFFFFF" />
                <circle cx="60" cy="48" r="2.5" fill="#FFFFFF" />
              </>
            ) : (
              <>
                <circle cx="44" cy="50" r="2.5" fill="#FFFFFF" />
                <circle cx="60" cy="50" r="2.5" fill="#FFFFFF" />
              </>
            )}
          </svg>
          {mood === "celebrating" && (
            <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-spin" />
          )}
        </div>

        {/* Coach Speech */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-heading font-extrabold text-xs text-lt-blue-dark">
              Track <span className="font-normal text-slate-400">• AI Coach</span>
            </span>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
              title={soundEnabled ? "Mute milestone chimes" : "Sound off (click to test)"}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-lt-blue" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-slate-700 leading-snug mt-0.5 line-clamp-2 font-medium">
            {message ||
              (score >= 85
                ? "Your resume is in the Shortlist-ready zone! Preview and send it."
                : score >= 70
                ? "Almost there! Just a couple more high-impact metric fixes."
                : score >= 50
                ? "Nice progress! Keep converting passive lines to strong action verbs."
                : "Let's fix your top points step by step. You've got this!")}
          </p>
        </div>
      </div>

      {/* Shortlist Readiness Meter */}
      <div className="pt-1 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-600">Shortlist Readiness:</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] ${readinessLevel.bg} ${readinessLevel.text} ${readinessLevel.border}`}>
            {readinessLevel.label} ({score}/100)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${readinessLevel.color}`}
            style={{ width: `${Math.min(100, Math.max(8, score))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
