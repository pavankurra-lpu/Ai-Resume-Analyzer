import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import {
  AnalysisResult,
  CategoryResult,
  AtsCheckResult,
  SuggestedCourseResult,
  getScoreColor,
} from "@/lib/schema";
import ScoreRing from "@/components/ScoreRing";
import CategoryCard from "@/components/CategoryCard";
import AtsChecklist from "@/components/AtsChecklist";
import JdMatchSection from "@/components/JdMatchSection";
import CourseRecommendations from "@/components/CourseRecommendations";
import BeforeAfterComparison from "@/components/BeforeAfterComparison";
import PdfReportDocument from "@/components/PdfReportDocument";
import ProgressStepper from "@/components/ProgressStepper";
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileCheck2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Target,
  Wrench,
} from "lucide-react";

interface ReportPageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = params;

  // 1. Fetch current report from Prisma
  const report = await prisma.report.findUnique({
    where: { id },
    include: { lead: true },
  });

  if (!report) {
    notFound();
  }

  // 2. Check for an earlier report for the same email
  let previousReport = null;
  if (report.lead.email) {
    previousReport = await prisma.report.findFirst({
      where: {
        lead: {
          email: report.lead.email,
        },
        createdAt: {
          lt: report.createdAt,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Parse JSON payloads safely
  const categories: CategoryResult[] = JSON.parse(report.categoriesJson || "[]");
  const topQuickWins: string[] = JSON.parse(report.topQuickWinsJson || "[]");
  const jdMatch = report.jdMatchJson ? JSON.parse(report.jdMatchJson) : null;
  const atsChecks: AtsCheckResult[] = JSON.parse(report.atsChecksJson || "[]");
  const suggestedCourses: SuggestedCourseResult[] = JSON.parse(
    report.suggestedCoursesJson || "[]"
  );

  let previousCategories: CategoryResult[] = [];
  if (previousReport) {
    previousCategories = JSON.parse(previousReport.categoriesJson || "[]");
  }

  const scoreTheme = getScoreColor(report.overallScore);
  const counsellorPhone = process.env.COUNSELLOR_PHONE || "+919876543210";

  const getCategoryTargetField = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("contact")) return "contact.email";
    if (n.includes("summary")) return "summary";
    if (n.includes("education")) return "education.0.degree";
    if (n.includes("skill")) return "skills.0";
    if (n.includes("project")) return "projects.0.bullets.0";
    if (n.includes("experience")) return "experience.0.bullets.0";
    if (n.includes("bullet")) return "projects.0.bullets.0";
    if (n.includes("clean") || n.includes("safe")) return "summary";
    return "summary";
  };

  // Calculate high-impact gaps for "Fix these first (+N pts)"
  const highImpactFixes = [...categories]
    .map((c) => ({
      ...c,
      ptsGap: Math.max(0, c.max_score - c.score),
      targetField: getCategoryTargetField(c.name),
    }))
    .filter((c) => c.ptsGap > 0)
    .sort((a, b) => b.ptsGap - a.ptsGap)
    .slice(0, 3);

  // Recruiter scan verdict (Clearly labeled as AI estimate)
  const getRecruiterVerdict = (score: number) => {
    if (score >= 90) {
      return "AI estimate: Highly competitive. Clean formatting and impact metrics will quickly grab recruiter interest during the 6-second scan.";
    }
    if (score >= 75) {
      return "AI estimate: Solid profile with good structure, but missing quantified business metrics and targeted keywords to guarantee shortlists.";
    }
    if (score >= 60) {
      return "AI estimate: Average foundation. Bullet points list daily responsibilities rather than measurable achievements, causing recruiter drop-off.";
    }
    return "AI estimate: Critical ATS & formatting issues detected. Recruiters will likely pass within 6 seconds unless bullets and structure are polished.";
  };

  const recruiterVerdict = getRecruiterVerdict(report.overallScore);

  const fullAnalysisResult: AnalysisResult = {
    overall_score: report.overallScore,
    grade: report.grade as "Needs Work" | "Average" | "Good" | "Excellent",
    summary: report.summary,
    categories,
    top_quick_wins: topQuickWins,
    jd_match: jdMatch,
    ats_checks: atsChecks,
    suggested_courses: suggestedCourses,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* 4-STEP GUIDED STEPPER */}
      <ProgressStepper currentStep={2} reportId={report.id} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* TOP ACTION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link
              href="/check"
              className="inline-flex items-center gap-2 text-xs font-bold text-lt-blue hover:text-lt-blue-dark"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check Another Resume</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(report.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PdfReportDocument
              report={fullAnalysisResult}
              candidateName={report.lead.name || "Candidate"}
              targetRole={report.lead.targetRole || "Candidate"}
              reportId={report.id}
            />

            <Link
              href={`/editor/${report.id}`}
              className="inline-flex items-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-lt-blue" />
              <span>Fix My Resume Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* PRINTABLE CONTAINER */}
        <div id="printable-report" className="space-y-8">
          {/* REPORT HERO HEADER CARD */}
          <div className="bg-white rounded-card p-6 sm:p-10 border border-slate-200/80 shadow-soft relative overflow-hidden">
            {/* Top accent border */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-lt-blue via-indigo-600 to-lt-yellow" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Score Ring */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-4">
                <ScoreRing targetScore={report.overallScore} size={190} strokeWidth={15} />

                {/* Grade Badge */}
                <div className="mt-4">
                  <span
                    className={`inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider border shadow-2xs ${scoreTheme.bg} ${scoreTheme.border} ${scoreTheme.text}`}
                  >
                    Grade: {report.grade}
                  </span>
                </div>
              </div>

              {/* Right Profile & Summary */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                    Exp: {report.lead.experienceLevel}
                  </span>
                  {report.lead.collegeOrCompany && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                      {report.lead.collegeOrCompany}
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-lt-blue-dark">
                    {report.lead.name || "Resume Diagnostic Report"}
                  </h1>
                  <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-lt-blue" />
                    <span>
                      Target Role:{" "}
                      <strong className="text-slate-800">
                        {report.lead.targetRole || "Software Engineer"}
                      </strong>
                    </span>
                  </p>
                </div>

                {/* Recruiter Scan Verdict */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-950 text-xs sm:text-sm font-medium flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-900 block text-xs uppercase tracking-wider">
                      Recruiter 6-Second Glance Verdict (AI Estimate)
                    </span>
                    <p className="mt-0.5 text-xs text-amber-800 leading-relaxed font-sans">
                      {recruiterVerdict}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                  {report.summary}
                </p>
              </div>
            </div>
          </div>

          {/* WHAT RECRUITERS NOTICE FIRST CARD */}
          <div className="bg-gradient-to-r from-lt-blue-dark to-lt-blue text-white rounded-card p-6 sm:p-8 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lt-yellow">
                <Target className="w-5 h-5 text-lt-yellow" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                  What Recruiters Notice in the First 6 Seconds
                </h3>
                <p className="text-xs text-slate-300">
                  Hiring managers scan your resume in a classic &quot;F-pattern&quot; before deciding to read in detail.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 space-y-1.5">
                <span className="text-xs font-bold text-lt-yellow uppercase tracking-wider">
                  1. The Top 1/3
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Your name, title, contact links, and summary must immediately confirm you match the job opening.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 space-y-1.5">
                <span className="text-xs font-bold text-lt-yellow uppercase tracking-wider">
                  2. Impact Numbers
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Recruiters look for percentages (%), scale, latency drops, and quantified outcomes over generic task descriptions.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 space-y-1.5">
                <span className="text-xs font-bold text-lt-yellow uppercase tracking-wider">
                  3. Clean Layout
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Single-column ATS layout without graphics or confusing tables ensures standard parsing across HR software.
                </p>
              </div>
            </div>
          </div>

          {/* GIANT YELLOW CTA TO FIX RESUME NOW */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-lt-yellow/20 rounded-card p-6 sm:p-8 border-2 border-lt-yellow shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-lt-blue uppercase tracking-wider">
                <Wrench className="w-4 h-4 text-lt-blue" />
                <span>Step 3: Fix & Upgrade Your Score</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-lt-blue-dark">
                Ready to improve your score from {report.overallScore} to 85+?
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 max-w-xl">
                Open the interactive Word-style editor to edit your resume directly, apply AI bullet rewrites, and download your clean PDF!
              </p>
            </div>
            <Link
              href={`/editor/${report.id}`}
              className="inline-flex items-center justify-center gap-2.5 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-black text-sm sm:text-base px-8 py-4 rounded-full shadow-lg transition-all shrink-0 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Fix my resume now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* FIX THESE FIRST (SORTED BY POINTS TO GAIN) */}
          {highImpactFixes.length > 0 && (
            <div className="bg-white rounded-card p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-lt-blue/10 text-lt-blue flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5 text-lt-blue" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">
                      Fix These First (Highest Score Gains)
                    </h3>
                    <p className="text-xs text-slate-600">
                      Target these areas first in the editor to make the largest leap in your recruiter score.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {highImpactFixes.map((item) => (
                  <div
                    key={item.name}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading font-extrabold text-sm text-slate-900">
                          {item.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                          +{item.ptsGap} pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {item.issues[0]?.problem || "Refine this section with live AI rewrites."}
                      </p>
                    </div>

                    <Link
                      href={`/editor/${report.id}?target=${item.targetField}`}
                      className="inline-flex items-center justify-between w-full text-xs font-bold text-lt-blue hover:text-lt-blue-dark pt-2 border-t border-slate-200"
                    >
                      <span>Fix in editor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BEFORE VS AFTER DIFF IF PREVIOUS REPORT EXISTS */}
          {previousReport && (
            <BeforeAfterComparison
              previousScore={previousReport.overallScore}
              currentScore={report.overallScore}
              previousCategories={previousCategories}
              currentCategories={categories}
              previousDate={new Date(previousReport.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
          )}

          {/* COLLAPSIBLE DETAILED CATEGORY CARDS */}
          <details className="group bg-white rounded-card border border-slate-200/80 shadow-soft overflow-hidden">
            <summary className="p-6 cursor-pointer font-heading font-extrabold text-lg sm:text-xl text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-lt-blue" />
                <span>See Full Details (10 Section Breakdown)</span>
              </div>
              <span className="text-xs font-bold text-lt-blue group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="p-6 pt-2 border-t border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat, idx) => (
                  <CategoryCard key={idx} category={cat} />
                ))}
              </div>
            </div>
          </details>

          {/* ATS COMPATIBILITY CHECKLIST */}
          <AtsChecklist checks={atsChecks} />

          {/* TARGET JD MATCHING (IF JD WAS PROVIDED) */}
          {jdMatch && <JdMatchSection jdMatch={jdMatch} />}

          {/* RECOMMENDED LEARNERS TRACK COURSES */}
          {suggestedCourses && suggestedCourses.length > 0 && (
            <CourseRecommendations
              suggestedCourses={suggestedCourses}
              leadName={report.lead.name || ""}
              leadPhone={report.lead.phone || ""}
              counsellorPhone={counsellorPhone}
            />
          )}
        </div>
      </div>
    </div>
  );
}
