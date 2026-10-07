import React from "react";
import { TrendingUp, TrendingDown, Minus, ArrowRight, Sparkles } from "lucide-react";
import { CategoryResult } from "@/lib/schema";

interface BeforeAfterComparisonProps {
  currentScore: number;
  previousScore: number;
  currentCategories: CategoryResult[];
  previousCategories: CategoryResult[];
  previousDate: string;
}

export default function BeforeAfterComparison({
  currentScore,
  previousScore,
  currentCategories,
  previousCategories,
  previousDate,
}: BeforeAfterComparisonProps) {
  const scoreDiff = currentScore - previousScore;

  // Build category score map for previous
  const prevMap = new Map<string, number>();
  previousCategories.forEach((c) => {
    prevMap.set(c.name, c.score);
  });

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-card p-6 sm:p-8 shadow-xl border border-blue-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lt-yellow text-lt-blue-dark text-xs font-extrabold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Progress Detected: Resume Re-Check</span>
          </div>
          <h3 className="font-heading font-extrabold text-xl text-white">
            Before vs After Comparison
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            Compared with your previous resume evaluated on {previousDate}.
          </p>
        </div>

        {/* Big Overall Delta */}
        <div className="flex items-center gap-4 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm self-start sm:self-auto">
          <div className="text-center">
            <span className="text-xs text-blue-200 block">Previous</span>
            <span className="text-xl font-bold text-slate-300">{previousScore}</span>
          </div>

          <ArrowRight className="w-5 h-5 text-lt-yellow" />

          <div className="text-center">
            <span className="text-xs text-blue-200 block">Current</span>
            <span className="text-2xl font-extrabold text-white">{currentScore}</span>
          </div>

          <div className="pl-2 border-l border-white/20">
            {scoreDiff > 0 ? (
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                +{scoreDiff} pts
              </span>
            ) : scoreDiff < 0 ? (
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-rose-400">
                <TrendingDown className="w-4 h-4" />
                {scoreDiff} pts
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-300">
                <Minus className="w-4 h-4" />
                Same
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category breakdown delta grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-6">
        {currentCategories.map((cat) => {
          const prevCatScore = prevMap.get(cat.name) ?? cat.score;
          const diff = cat.score - prevCatScore;

          return (
            <div
              key={cat.name}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs flex flex-col justify-between"
            >
              <div className="font-medium text-slate-300 line-clamp-1 mb-2" title={cat.name}>
                {cat.name}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  {prevCatScore} → <strong className="text-white">{cat.score}</strong>
                </span>
                {diff > 0 ? (
                  <span className="text-emerald-400 font-bold flex items-center">
                    +{diff} <TrendingUp className="w-3 h-3 ml-0.5" />
                  </span>
                ) : diff < 0 ? (
                  <span className="text-rose-400 font-bold flex items-center">
                    {diff} <TrendingDown className="w-3 h-3 ml-0.5" />
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">0</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
