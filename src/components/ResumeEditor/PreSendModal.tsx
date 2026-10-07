"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  Download,
  Loader2,
  FileText,
  Mail,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { triggerMilestoneConfetti } from "../TrackCoach";

interface PreSendModalProps {
  resumeId: string;
  defaultEmail: string;
  candidateName: string;
  targetRole?: string;
  scoreBefore?: number | null;
  scoreAfter: number;
  unfilledPlaceholders: string[];
  failedRulesCount: number;
  templateId: string;
  onClose: () => void;
}

export default function PreSendModal({
  resumeId,
  defaultEmail,
  candidateName,
  targetRole = "Software_Engineer",
  scoreBefore,
  scoreAfter,
  unfilledPlaceholders,
  failedRulesCount,
  templateId,
  onClose,
}: PreSendModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [emailConfirmed, setEmailConfirmed] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isDemoOutbox, setIsDemoOutbox] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const cleanRole = (targetRole || "Software_Engineer").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${candidateName.replace(/\s+/g, "_")}_${cleanRole}.pdf`;

  const hasBlockers = unfilledPlaceholders.length > 0;
  const hasWarnings = failedRulesCount > 0;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!emailConfirmed) {
      setErrorMessage("Please check the box confirming this is your email address.");
      return;
    }

    setErrorMessage(null);
    setIsSending(true);

    try {
      const res = await fetch(`/api/resume/${resumeId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: email.trim(),
          emailConfirmed: true,
          scoreBefore: scoreBefore || null,
          scoreAfter,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send resume email.");
      }

      setSentSuccess(true);
      setIsDemoOutbox(Boolean(data.isDemoOutbox));
      setResendCooldown(60);
      triggerMilestoneConfetti();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error sending email.";
      setErrorMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) => `${first}***${domain}`)
    : "";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-lt-blue" />
            <h3 className="font-heading font-extrabold text-base text-slate-900">
              {sentSuccess ? "Resume Sent Successfully!" : "Pre-Send Verification"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUCCESS VIEW */}
        {sentSuccess ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h4 className="font-heading font-extrabold text-lg text-slate-900">
                Your Resume Is on Its Way!
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Sent to <strong>{maskedEmail}</strong>. Both PDF and DOCX formats are attached.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Check your spam/promotions folder if it does not appear in 2 minutes.
              </p>
            </div>

            {isDemoOutbox && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left">
                <strong>Demo Mode Active:</strong> SMTP is not configured in local environment, so your email and attachments were saved to <code>/outbox</code> as a .eml file.
              </div>
            )}

            {/* Direct Downloads fallback */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 block">Or download directly right now:</span>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={`/api/resume/${resumeId}/export?format=pdf&templateId=${templateId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-lt-blue text-white rounded-lg font-bold hover:bg-lt-blue-dark transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                <a
                  href={`/api/resume/${resumeId}/export?format=docx&templateId=${templateId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Word (.docx)</span>
                </a>
              </div>
            </div>

            {/* Resend Cooldown */}
            <div className="pt-2">
              <button
                type="button"
                disabled={resendCooldown > 0 || isSending}
                onClick={handleSend}
                className="text-xs text-lt-blue hover:underline font-bold disabled:text-slate-400"
              >
                {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Resend email"}
              </button>
            </div>
          </div>
        ) : (
          /* PRE-SEND CHECKLIST FORM */
          <div className="space-y-4">
            {/* Score Delta Display */}
            <div className="p-3.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-blue-200 uppercase font-bold block">Verified Score</span>
                <span className="text-base font-extrabold text-lt-yellow">
                  {scoreBefore ? `${scoreBefore} → ` : ""}{scoreAfter} / 100
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-200 uppercase block">Attached Filename</span>
                <span className="font-mono text-[11px] text-slate-200">{filename}</span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Single-column ATS format applied (A4, 1-page optimized).</span>
              </div>

              {hasBlockers ? (
                <div className="flex items-start gap-2 text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Warning: Unfilled placeholders found!</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Found {unfilledPlaceholders.slice(0, 2).join(", ")}. Please resolve all yellow brackets before sending.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Zero unfilled placeholders [X%]. All facts are complete.</span>
                </div>
              )}

              {hasWarnings && !hasBlockers && (
                <div className="flex items-center gap-2 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{failedRulesCount} minor tip(s) remaining (you can still send now).</span>
                </div>
              )}
            </div>

            {/* Recipient Email Input */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-lt-blue"
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={emailConfirmed}
                  onChange={(e) => setEmailConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-lt-blue focus:ring-lt-blue"
                />
                <span>This is my personal email address.</span>
              </label>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Back to Edit
              </button>

              <button
                type="button"
                disabled={isSending}
                onClick={handleSend}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-lt-blue" />
                    <span>Preparing & Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-lt-blue" />
                    <span>{hasBlockers ? "Send Anyway" : "Send My Resume"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
