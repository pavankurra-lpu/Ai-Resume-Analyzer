"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function BulletImproverPage() {
  const [bullet, setBullet] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [versions, setVersions] = useState<string[]>([]);
  const [metricAdvice, setMetricAdvice] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bullet.trim() || bullet.trim().length < 10) {
      setError("Please paste a bullet point with at least 10 characters.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: bullet.trim(), role: role.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate improvements.");
      }

      setVersions(data.versions || []);
      setMetricAdvice(data.metricAdvice || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error improving bullet point.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleBullets = [
    "Worked on bug fixes and website development with the team.",
    "Responsible for database queries and optimizing backend code.",
    "Created machine learning model to classify student records.",
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Bullet Point Enhancer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-lt-blue-dark">
            Transform Weak Bullets Into High-Impact Achievements
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Our engine applies the proven formula: <strong className="text-lt-blue">Strong Action Verb</strong> + <strong className="text-lt-blue">Task</strong> + <strong className="text-lt-blue">Tool/Method</strong> + <strong className="text-lt-blue">Measurable Outcome</strong>.
          </p>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-card p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Paste One Resume Bullet Point <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={bullet}
                onChange={(e) => setBullet(e.target.value)}
                placeholder="e.g. Worked on bug fixes and developed the homepage with React..."
                rows={3}
                className="w-full p-4 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-lt-blue"
              />
            </div>

            {/* Quick pre-fill samples */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Try an example:</span>
              {sampleBullets.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBullet(sample)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs truncate max-w-xs transition-colors text-left"
                >
                  &quot;{sample}&quot;
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Target Job Role (Optional)
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Analyst, QA Engineer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-lt-blue"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-base py-3.5 px-6 rounded-full shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-lt-blue-dark" />
                  <span>Enhancing bullet point...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-lt-blue-dark" />
                  <span>Generate 3 Stronger Versions</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {versions.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="font-heading font-bold text-xl text-lt-blue-dark flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>3 Enhanced Recruiter-Ready Versions</span>
            </h2>

            <div className="space-y-4">
              {versions.map((ver, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-card p-5 border border-slate-200 shadow-soft hover:border-lt-blue/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-lt-blue font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{ver}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(ver, idx)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-lt-blue bg-lt-bg-soft hover:bg-blue-100/70 px-3.5 py-2 rounded-xl transition-colors self-end sm:self-auto flex-shrink-0 border border-blue-100"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Bullet</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Metrics Advice Callout */}
            {metricAdvice && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Important Note on Metrics:</span>
                </div>
                <p className="leading-relaxed pl-6">{metricAdvice}</p>
              </div>
            )}
          </div>
        )}

        {/* Education Formula Guide */}
        <div className="bg-white rounded-card p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-800">
            The Google & Recruiter Formula for High-Impact Bullets:
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs sm:text-sm text-lt-blue-dark">
            [Action Verb] + [Accomplished [X]] + [as measured by [Y]] + [by doing [Z]]
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl">
              <span className="font-bold text-rose-800 block mb-1">❌ Weak & Passive:</span>
              <p className="text-slate-600 italic">
                &quot;Worked on bug fixes and made the website faster.&quot;
              </p>
            </div>
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="font-bold text-emerald-800 block mb-1">
                ✅ Strong & Quantified:
              </span>
              <p className="text-slate-800 font-medium">
                &quot;Refactored 12 legacy React components and optimized image pipelines, slicing page load time by [40%] across mobile devices.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA to Full Scan */}
        <div className="text-center p-6 bg-lt-bg-soft rounded-2xl border border-blue-50">
          <p className="text-sm text-slate-600 mb-3">Want your entire resume audited across 10 categories?</p>
          <Link
            href="/check"
            className="inline-flex items-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-sm px-6 py-3 rounded-full shadow-sm transition-all"
          >
            <span>Run Full Resume Check Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
