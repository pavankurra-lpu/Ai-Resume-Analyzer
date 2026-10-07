"use client";

import React, { useEffect, useState } from "react";
import { getScoreColor } from "@/lib/schema";

interface ScoreRingProps {
  targetScore: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreRing({
  targetScore,
  size = 180,
  strokeWidth = 14,
}: ScoreRingProps) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = targetScore / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetScore) {
        setCurrentScore(targetScore);
        clearInterval(timer);
      } else {
        setCurrentScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetScore]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;
  const { color } = getScoreColor(targetScore);

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated score stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-heading font-extrabold tracking-tight leading-none"
          style={{ fontSize: size * 0.28, color: "#1E2A6B" }}
        >
          {currentScore}
        </span>
        <span
          className="font-bold text-slate-400 uppercase tracking-widest mt-1"
          style={{ fontSize: Math.max(10, size * 0.08) }}
        >
          out of 100
        </span>
      </div>
    </div>
  );
}
