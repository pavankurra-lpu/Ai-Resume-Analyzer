"use client";

import React, { useState } from "react";
import {
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  FileText,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { triggerMilestoneConfetti } from "@/components/TrackCoach";
import { CheckpointResult } from "@/lib/scoring";
import { StructuredResume } from "@/lib/resumeTypes";

interface DownloadScreenProps {
  resumeId: string;
  reportId?: string;
  resume: StructuredResume;
  totalScore: number;
  initialScore: number;
  grade: string;
  checkpoints: CheckpointResult[];
  templateId: "modern" | "classic";
  onBackToEditor: () => void;
  onFixRemaining: (targetField: string) => void;
}

export default function DownloadScreen({
  resumeId,
  reportId,
  resume,
  totalScore,
  initialScore,
  grade,
  checkpoints,
  templateId,
  onBackToEditor,
  onFixRemaining,
}: DownloadScreenProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const redIssues = checkpoints.filter((c) => c.status === "fail" && c.severity === "must-fix");
  const scoreDiff = totalScore - initialScore;

  const candidateName = (resume.contact?.fullName || "Candidate").trim();
  const nameParts = candidateName.split(/\s+/);
  const firstName = nameParts[0] || "Candidate";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const roleName = (resume.headline || "Software_Engineer").replace(/[^a-zA-Z0-9]/g, "_");
  const targetFilename = lastName
    ? `${firstName}_${lastName}_${roleName}.pdf`
    : `${firstName}_${roleName}.pdf`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      triggerMilestoneConfetti();
      const res = await fetch(`/api/resume/${resumeId}/export?format=pdf&templateId=${templateId}`);
      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = targetFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccess(true);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-8 animate-in fade-in duration-200">
      {/* Top Back link */}
      <div>
        <button
          type="button"
          onClick={onBackToEditor}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-lt-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Document Editor</span>
        </button>
      </div>

      {/* Completion Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-lg text-center space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-lt-yellow/30 blur-2xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Your Resume Is Recruiter-Ready!</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-lt-blue-dark tracking-tight">
          Download Your Optimized Resume
        </h1>

        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Clean single-column layout, verified contact links, strong action verbs, and ATS-compliant hierarchy ready to impress top engineering hiring teams.
        </p>

        {/* Score Before to After Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto py-2">
          {/* Initial Score */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Initial Score
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-700 font-heading mt-1">
              {initialScore}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">out of 100</span>
          </div>

          {/* Current Score */}
          <div className="bg-gradient-to-b from-lt-bg-soft to-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col items-center justify-center shadow-xs">
            <span className="text-xs font-bold text-lt-blue uppercase tracking-wider">
              Current Score
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-lt-blue-dark font-heading mt-1">
              {totalScore}
            </span>
            <span className="text-[11px] text-lt-blue font-semibold">{grade}</span>
          </div>

          {/* Score Gain */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Score Gain
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-heading mt-1">
              {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium font-mono">
              points gained
            </span>
          </div>
        </div>

        {/* Warning if red items remain */}
        {redIssues.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 max-w-xl mx-auto flex items-start justify-between gap-4 text-left">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-rose-900">
                  {redIssues.length} must-fix item(s) remain
                </h4>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                  {redIssues[0]?.title}: {redIssues[0]?.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onFixRemaining(redIssues[0]?.targetField || "summary")}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex-shrink-0"
            >
              Fix remaining
            </button>
          </div>
        )}

        {/* Main Action: Single Download PDF Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full inline-flex items-center justify-center gap-3 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            <Download className="w-5 h-5" />
            <span>{downloading ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="inline-flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Downloaded: {targetFilename}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Free & ATS Clean</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-lt-blue" />
            <span>Selectable Vector Text</span>
          </div>
        </div>
      </div>
    </div>
  );
}
