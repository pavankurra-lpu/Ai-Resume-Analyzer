"use client";

import React from "react";
import {
  Undo2,
  Redo2,
  Download,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Layers,
  FileCheck,
  Menu,
  ChevronDown
} from "lucide-react";

interface TopToolbarProps {
  reportId?: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  templateId: "modern" | "classic";
  onTemplateChange: (t: "modern" | "classic") => void;
  fontSize: "10pt" | "10.5pt" | "11pt";
  onFontSizeChange: (s: "10pt" | "10.5pt" | "11pt") => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  pageCount: number;
  isOverflowing: boolean;
  totalScore: number;
  initialScore: number;
  scoreDiff: number;
  pointsPopped: number | null;
  onDownloadClick: () => void;
  onToggleChecklistMobile: () => void;
}

export default function TopToolbar({
  reportId,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  templateId,
  onTemplateChange,
  fontSize,
  onFontSizeChange,
  zoom,
  onZoomChange,
  pageCount,
  isOverflowing,
  totalScore,
  initialScore,
  scoreDiff,
  pointsPopped,
  onDownloadClick,
  onToggleChecklistMobile,
}: TopToolbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Document Controls (Undo/Redo, Template, Font) */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
          {/* Back to Report */}
          {reportId && (
            <a
              href={`/report/${reportId}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-lt-blue px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors mr-1"
            >
              <span>&larr;</span>
              <span className="hidden sm:inline">Report</span>
            </a>
          )}

          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          {/* Template Toggle */}
          <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => onTemplateChange("modern")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                templateId === "modern"
                  ? "bg-white text-lt-blue-dark shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Modern ATS
            </button>
            <button
              type="button"
              onClick={() => onTemplateChange("classic")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                templateId === "classic"
                  ? "bg-white text-lt-blue-dark shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Classic
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="hidden lg:flex items-center gap-1 text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-1 rounded-lg">
            <span>Font:</span>
            <select
              value={fontSize}
              onChange={(e) => onFontSizeChange(e.target.value as "10pt" | "10.5pt" | "11pt")}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="10pt">10 pt</option>
              <option value="10.5pt">10.5 pt</option>
              <option value="11pt">11 pt</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="hidden xl:flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(70, zoom - 10))}
              title="Zoom out"
              className="p-1 rounded hover:bg-white text-slate-700"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] font-bold">{zoom}%</span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(130, zoom + 10))}
              title="Zoom in"
              className="p-1 rounded hover:bg-white text-slate-700"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
            <span>Page {pageCount} of 1</span>
            {isOverflowing && (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                Spilling
              </span>
            )}
          </div>
        </div>

        {/* Center/Right: Live Score Pill & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Score Pill */}
          <div className="relative flex items-center gap-2 bg-gradient-to-r from-lt-bg-soft to-indigo-50/60 border border-indigo-100 px-3 py-1.5 rounded-full shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-lt-blue text-white flex items-center justify-center font-heading font-extrabold text-xs">
              {totalScore}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="font-heading font-extrabold text-xs text-lt-blue-dark">
                  Score
                </span>
                {scoreDiff > 0 && (
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full font-mono">
                    +{scoreDiff}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                Started at {initialScore}, now {totalScore}
              </span>
            </div>

            {/* Score increase popup badge */}
            {pointsPopped && pointsPopped > 0 && (
              <span className="absolute -top-3 -right-2 animate-bounce bg-emerald-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-md font-mono">
                +{pointsPopped} pts
              </span>
            )}
          </div>

          {/* Mobile Checklist Toggle */}
          <button
            type="button"
            onClick={onToggleChecklistMobile}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs inline-flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Checklist</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={onDownloadClick}
            className="inline-flex items-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
