"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { StructuredResume } from "@/lib/resumeTypes";
import { scoreResume, ScoringResult, CheckpointResult } from "@/lib/scoring";
import TopToolbar from "./TopToolbar";
import WordEditor from "./WordEditor";
import ChecklistPanel from "./ChecklistPanel";
import DownloadScreen from "./DownloadScreen";
import TrackCoach, { triggerMilestoneConfetti } from "@/components/TrackCoach";

export interface ResumeBuilderProps {
  initialResume: StructuredResume;
  resumeId?: string;
  reportId?: string;
  leadInfo?: {
    name?: string;
    targetRole?: string;
    experienceLevel?: string;
    jobDescription?: string;
  };
  initialScore?: number;
  initialTargetField?: string;
  onChange?: (updatedResume: StructuredResume, newScore: number) => void;
  onDownload?: () => void;
}

export default function ResumeBuilder({
  initialResume,
  resumeId = "",
  reportId = "",
  leadInfo,
  initialScore: initialScoreProp,
  initialTargetField = "",
  onChange,
  onDownload,
}: ResumeBuilderProps) {
  // Main Resume State
  const [resume, setResume] = useState<StructuredResume>(initialResume);

  // View state: "editor" or "download"
  const [viewMode, setViewMode] = useState<"editor" | "download">("editor");

  // Document formatting state
  const [templateId, setTemplateId] = useState<"modern" | "classic">("modern");
  const [fontSize, setFontSize] = useState<"10pt" | "10.5pt" | "11pt">("10.5pt");
  const [zoom, setZoom] = useState<number>(100);

  // History stack for Undo / Redo (15 items)
  const [history, setHistory] = useState<StructuredResume[]>([initialResume]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Deep linking target field for highlight
  const [activeTargetField, setActiveTargetField] = useState<string>(initialTargetField);

  // Mobile checklist drawer state
  const [checklistOpenMobile, setChecklistOpenMobile] = useState(false);

  // Live Scoring state
  const [scoring, setScoring] = useState<ScoringResult>(() =>
    scoreResume(initialResume, {
      experienceLevel: leadInfo?.experienceLevel,
      targetRole: leadInfo?.targetRole,
    })
  );

  const initialScore = initialScoreProp ?? scoring.totalScore;
  const [previousScore, setPreviousScore] = useState(initialScore);
  const [pointsPopped, setPointsPopped] = useState<number | null>(null);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Milestones tracking to prevent duplicate confetti
  const reachedMilestonesRef = useRef<Set<number>>(new Set());

  // Debounced Scoring (150ms)
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      const newScoring = scoreResume(resume, {
        experienceLevel: leadInfo?.experienceLevel,
        targetRole: leadInfo?.targetRole,
      });

      setScoring(newScoring);

      const diff = newScoring.totalScore - previousScore;
      if (diff > 0) {
        setPointsPopped(diff);
        setTimeout(() => setPointsPopped(null), 2500);

        // Milestone trigger: crossing 50, 70, 85
        [50, 70, 85].forEach((m) => {
          if (newScoring.totalScore >= m && previousScore < m && !reachedMilestonesRef.current.has(m)) {
            reachedMilestonesRef.current.add(m);
            triggerMilestoneConfetti();
          }
        });

        // Milestone: all red items fixed
        if (newScoring.redIssuesCount === 0 && scoring.redIssuesCount > 0 && !reachedMilestonesRef.current.has(999)) {
          reachedMilestonesRef.current.add(999);
          triggerMilestoneConfetti();
        }
      }

      setPreviousScore(newScoring.totalScore);
      if (onChange) {
        onChange(resume, newScoring.totalScore);
      }
    }, 150);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [resume, leadInfo]);

  // Debounced Autosave (1.5s)
  useEffect(() => {
    if (!resumeId) return;

    setSaveStatus("unsaved");
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        const res = await fetch(`/api/resume/${resumeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: resume,
            templateId,
          }),
        });
        if (res.ok) {
          setSaveStatus("saved");
        }
      } catch (err) {
        console.warn("Autosave error:", err);
      }
    }, 1500);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [resume, resumeId, templateId]);

  // Keyboard Shortcuts (Ctrl+Z for Undo, Ctrl+Y for Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        handleRedo();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, historyIndex]);

  const handleUpdateResume = (newResume: StructuredResume) => {
    setResume(newResume);

    // Push snapshot to history stack
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory.length >= 15) newHistory.shift();
    newHistory.push(newResume);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setResume(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setResume(history[nextIdx]);
    }
  };

  const handleSelectCheckpoint = (cp: CheckpointResult) => {
    setActiveTargetField(cp.targetField);
    if (checklistOpenMobile) setChecklistOpenMobile(false);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col relative text-slate-800">
      {/* Top Word Ribbon Toolbar */}
      <TopToolbar
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        templateId={templateId}
        onTemplateChange={setTemplateId}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        zoom={zoom}
        onZoomChange={setZoom}
        pageCount={1}
        isOverflowing={false}
        totalScore={scoring.totalScore}
        initialScore={initialScore}
        scoreDiff={scoring.totalScore - initialScore}
        pointsPopped={pointsPopped}
        onDownloadClick={() => {
          if (onDownload) {
            onDownload();
          } else {
            setViewMode("download");
          }
        }}
        onToggleChecklistMobile={() => setChecklistOpenMobile(true)}
      />

      {/* Main Workspace Area */}
      {viewMode === "editor" ? (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Centered Document Canvas */}
          <main className="flex-1 overflow-y-auto">
            <WordEditor
              resume={resume}
              templateId={templateId}
              fontSize={fontSize}
              zoom={zoom}
              checkpoints={scoring.checkpoints}
              activeTargetField={activeTargetField}
              onUpdate={handleUpdateResume}
            />
          </main>

          {/* Right Checklist & Review Sidebar */}
          <ChecklistPanel
            categories={scoring.categories}
            checkpoints={scoring.checkpoints}
            totalScore={scoring.totalScore}
            initialScore={initialScore}
            redCount={scoring.redIssuesCount}
            amberCount={scoring.amberIssuesCount}
            resume={resume}
            targetRole={leadInfo?.targetRole}
            jobDescription={leadInfo?.jobDescription}
            onSelectCheckpoint={handleSelectCheckpoint}
            isOpenMobile={checklistOpenMobile}
            onCloseMobile={() => setChecklistOpenMobile(false)}
          />

          {/* Floating Discreet Track Mascot in corner (never covers page) */}
          <div className="fixed bottom-4 left-4 z-30 max-w-[240px] pointer-events-auto hidden md:block">
            <TrackCoach
              score={scoring.totalScore}
              message={
                scoring.redIssuesCount > 0
                  ? `${scoring.redIssuesCount} must-fix items remain. Knock them out to boost your score!`
                  : "Great progress! Your resume looks sharp and recruiter-ready."
              }
              pointsPopped={pointsPopped}
            />
          </div>
        </div>
      ) : (
        /* Final Step: Download PDF Screen */
        <DownloadScreen
          resumeId={resumeId}
          reportId={reportId}
          resume={resume}
          totalScore={scoring.totalScore}
          initialScore={initialScore}
          grade={scoring.grade}
          checkpoints={scoring.checkpoints}
          templateId={templateId}
          onBackToEditor={() => setViewMode("editor")}
          onFixRemaining={(field) => {
            setViewMode("editor");
            setActiveTargetField(field);
          }}
        />
      )}
    </div>
  );
}
