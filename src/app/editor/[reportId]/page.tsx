"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProgressStepper from "@/components/ProgressStepper";
import ResumeBuilder from "@/components/ResumeBuilder";
import { StructuredResume } from "@/lib/resumeTypes";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ResumeEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reportId = params.reportId as string;
  const initialTargetField = searchParams.get("target") || searchParams.get("focus") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string>("");
  const [resume, setResume] = useState<StructuredResume | null>(null);
  const [leadInfo, setLeadInfo] = useState<{
    name?: string;
    targetRole?: string;
    experienceLevel?: string;
    jobDescription?: string;
  }>({});
  const [initialScore, setInitialScore] = useState<number>(65);

  useEffect(() => {
    async function loadResume() {
      try {
        setLoading(true);
        setError(null);

        // Fetch or parse the resume for this report
        const parseRes = await fetch("/api/resume/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId }),
        });

        if (!parseRes.ok) {
          throw new Error("Could not load resume for editing.");
        }

        const data = await parseRes.json();
        setResumeId(data.resumeId);
        setResume(data.resume);

        // Fetch full resume & lead details
        const detailsRes = await fetch(`/api/resume/${data.resumeId}`);
        if (detailsRes.ok) {
          const details = await detailsRes.json();
          if (details.lead) {
            setLeadInfo({
              name: details.lead.name,
              targetRole: details.lead.targetRole,
              experienceLevel: details.lead.experienceLevel,
              jobDescription: details.lead.jobDescription,
            });
          }
          if (details.baseReport?.overallScore) {
            setInitialScore(details.baseReport.overallScore);
          }
        }
      } catch (err: unknown) {
        console.error("Editor load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load resume editor");
      } finally {
        setLoading(false);
      }
    }

    if (reportId) {
      loadResume();
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <ProgressStepper currentStep={3} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
          <Loader2 className="w-10 h-10 text-lt-blue animate-spin" />
          <h2 className="font-heading font-extrabold text-lg text-lt-blue-dark">
            Opening Document Editor...
          </h2>
          <p className="text-xs text-slate-500">
            Converting scan analysis into live interactive A4 document.
          </p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <ProgressStepper currentStep={3} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-lg text-slate-800">
            Unable to Open Editor
          </h2>
          <p className="text-xs text-slate-600">
            {error || "We could not find the resume data for this report."}
          </p>
          <Link
            href={`/report/${reportId}`}
            className="inline-flex items-center gap-2 bg-lt-blue text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Report</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <ProgressStepper currentStep={3} />

      <ResumeBuilder
        initialResume={resume}
        resumeId={resumeId}
        reportId={reportId}
        leadInfo={leadInfo}
        initialScore={initialScore}
        initialTargetField={initialTargetField}
      />
    </div>
  );
}
