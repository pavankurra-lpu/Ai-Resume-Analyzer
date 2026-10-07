import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <Loader2 className="w-10 h-10 text-lt-blue animate-spin" />
      <div className="space-y-1">
        <h3 className="font-heading font-extrabold text-base text-lt-blue-dark">
          Loading Resume Intelligence...
        </h3>
        <p className="text-xs text-slate-500">
          Preparing your recruiter diagnostic report and editor.
        </p>
      </div>
    </div>
  );
}
