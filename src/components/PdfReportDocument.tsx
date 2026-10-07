"use client";

import React, { useState } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { AnalysisResult } from "@/lib/schema";

interface PdfReportDocumentProps {
  report: AnalysisResult;
  candidateName: string;
  targetRole?: string;
  reportId: string;
}

export default function PdfReportDocument({
  report,
  candidateName,
  targetRole,
  reportId,
}: PdfReportDocumentProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const element = document.getElementById("printable-report");
      if (!element) {
        throw new Error("Report element not found");
      }

      // Dynamic import of html2pdf.js to avoid SSR issues
      // @ts-expect-error html2pdf.js has loose module declarations
      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Resume_Report_${candidateName.replace(/\s+/g, "_")}_LearnersTrack.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt).from(element).save();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback: window.print() if html2pdf fails
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-lt-blue-dark font-heading font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-lt-blue disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-lt-blue" />
            <span>Generating PDF...</span>
          </>
        ) : downloadSuccess ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-lt-blue" />
            <span>Download PDF Report</span>
          </>
        )}
      </button>
    </div>
  );
}
