"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, CheckCircle2, Loader2, Mail } from "lucide-react";

export default function DeleteDataForm() {
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !confirmed) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/user/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete data.");
      }

      setResult({
        success: true,
        message: data.message || "All records associated with your email have been erased.",
      });
      setEmail("");
      setConfirmed(false);
    } catch (err: unknown) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "An error occurred while deleting data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-6 sm:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
          <Trash2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-extrabold text-lg text-slate-900">
            Self-Service Data Deletion
          </h3>
          <p className="text-xs text-slate-600">
            Permanently remove your candidate profile, resume versions, and scoring reports from our system.
          </p>
        </div>
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
            result.success
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-100 border border-rose-300 text-rose-900"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{result.message}</span>
        </div>
      )}

      <form onSubmit={handleDelete} className="space-y-4 pt-1">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          <span className="text-xs text-slate-600">
            I understand that this action is immediate, permanent, and cannot be undone. All my scores, resume drafts, and counsellor notes will be erased.
          </span>
        </label>

        <button
          type="submit"
          disabled={!email || !confirmed || isLoading}
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-heading font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Erasing Data...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Permanently Delete My Data</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
