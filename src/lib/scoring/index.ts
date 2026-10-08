import { StructuredResume } from "../resumeTypes";
import {
  scoreResume as legacyScoreResume,
  CheckpointResult,
  ScoringResult,
  ScoringOptions,
  evaluateBulletPoint,
} from "./scoringEngine";
import { computeAtsScore, AtsScoringResult } from "../ats";
import { AnalysisResult, CategoryResult, IssueResult } from "../schema";
import { LEARNERS_TRACK_COURSES } from "@/config/courses";

export * from "./scoringEngine";
export { computeAtsScore } from "../ats";

export const scoreResume = legacyScoreResume;

/**
 * Converts pure deterministic scoring results into the full AnalysisResult structure
 * needed by the Report page, ensuring 100% consistency between the scanner,
 * the report, and the live interactive builder.
 */
export function convertScoringToReport(
  scoring: ScoringResult | AtsScoringResult,
  resume: StructuredResume,
  options?: {
    targetRole?: string;
    jobDescription?: string;
  }
): AnalysisResult {
  const scoreNum = "totalScore" in scoring ? scoring.totalScore : scoring.score;
  const gradeStr: "Needs Work" | "Average" | "Good" | "Excellent" =
    scoring.grade === "ATS-ready"
      ? "Excellent"
      : scoring.grade === "Good"
      ? "Good"
      : scoring.grade === "Average"
      ? "Average"
      : "Needs Work";
  const summaryStr = scoring.summary;

  const categories: CategoryResult[] = scoring.categories.map((cat) => {
    const strengths: string[] = [];
    const issues: IssueResult[] = [];

    cat.checkpoints.forEach((cp) => {
      if (cp.status === "pass") {
        strengths.push(cp.message);
      } else {
        issues.push({
          original_text: cp.sampleWeak || cp.title,
          problem: cp.message,
          fix: cp.fixHint,
          rewrite: cp.sampleStrong || `Focus on: ${cp.fixHint}`,
          priority: cp.severity === "must-fix" ? "High" : "Medium",
        });
      }
    });

    if (strengths.length === 0) {
      strengths.push(`Addressed core ${cat.name.toLowerCase()} standards.`);
    }

    return {
      name: cat.name,
      score: cat.score,
      max_score: cat.maxScore,
      strengths,
      issues,
    };
  });

  // Top quick wins from unfulfilled checkpoints, ordered by points to gain
  const failingCheckpoints = scoring.checkpoints
    .filter((c) => c.status !== "pass")
    .sort((a, b) => b.points - a.points);

  const topQuickWins = failingCheckpoints.slice(0, 5).map((c) => `+${c.points} pts: ${c.fixHint}`);
  if (topQuickWins.length === 0) {
    topQuickWins.push("Great work! Your resume passes all core ATS checks.");
  }

  // ATS Checks
  const atsChecks = [
    {
      check: "Single-Column Linear Hierarchy",
      passed: scoring.checkpoints.find((c) => c.id === "format_single_column")?.status !== "fail",
      note: "Standard heading hierarchy easily parsed by workday, greenhouse, and taleo systems.",
    },
    {
      check: "Direct Plain-Text Contact Information",
      passed: scoring.checkpoints.find((c) => c.id === "format_contact_in_body")?.status !== "fail",
      note: "Email and telephone numbers located at the top of the body text.",
    },
    {
      check: "Action Verb Openers",
      passed: scoring.checkpoints.find((c) => c.id === "bullets_action_verbs")?.status !== "fail",
      note: "Bullet points initiate with active past-tense engineering and leadership verbs.",
    },
    {
      check: "Zero Sensitive Personal Disclosures",
      passed: scoring.checkpoints.find((c) => c.id === "clean_sensitive_data")?.status !== "fail",
      note: "Excluded marital status, date of birth, and identity document numbers.",
    },
    {
      check: "No Unfilled Bracket Placeholders",
      passed: scoring.checkpoints.find((c) => c.id === "clean_placeholders")?.status !== "fail",
      note: "Zero template brackets or placeholder indicators present.",
    },
  ];

  // JD Matching (if jobDescription provided)
  let jdMatch = null;
  const jd = options?.jobDescription?.trim();
  if (jd && jd.length > 20) {
    const jdWords = Array.from(
      new Set(
        jd
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 4)
      )
    );

    const resumeLower = JSON.stringify(resume).toLowerCase();
    const matched = jdWords.filter((w) => resumeLower.includes(w)).slice(0, 8);
    const missing = jdWords.filter((w) => !resumeLower.includes(w)).slice(0, 6);
    const matchPct = Math.min(95, Math.max(35, Math.round((matched.length / (matched.length + missing.length || 1)) * 100)));

    jdMatch = {
      percentage: matchPct,
      matched_keywords: matched,
      missing_keywords: missing,
      advice:
        missing.length > 0
          ? `Incorporate key job description requirements like '${missing.slice(0, 3).join("', '")}' into your project descriptions.`
          : "Strong alignment with target role keywords.",
    };
  }

  // Recommended Courses tailored to candidate gaps
  const weakCategory = scoring.categories
    .filter((c) => c.score < c.maxScore)
    .sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)[0];

  const suggestedCourses = LEARNERS_TRACK_COURSES.slice(0, 2).map((c) => ({
    name: c.name,
    reason: `Build industry portfolio projects and master ${weakCategory?.name || "technical skills"} with mentor feedback.`,
  }));

  return {
    overall_score: scoreNum,
    grade: gradeStr,
    summary: summaryStr,
    categories,
    top_quick_wins: topQuickWins,
    jd_match: jdMatch,
    ats_checks: atsChecks,
    suggested_courses: suggestedCourses,
  };
}
