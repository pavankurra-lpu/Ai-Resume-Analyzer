import React from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-lt-bg-soft text-lt-blue flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="w-8 h-8 text-lt-blue" />
      </div>

      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-lt-blue-dark tracking-tight">
        404 - Page Not Found
      </h1>

      <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mt-2 leading-relaxed">
        The resume report or page you are looking for doesn&apos;t exist, has been moved, or has expired.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-heading font-bold text-xs px-5 py-3 rounded-full border border-slate-200 shadow-2xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/check"
          className="inline-flex items-center justify-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-xs px-6 py-3 rounded-full shadow-md transition-all"
        >
          <span>Check a Resume Free</span>
        </Link>
      </div>
    </div>
  );
}
