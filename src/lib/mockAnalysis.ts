import { AnalysisResult } from "./schema";
import { parseResumeHeuristic } from "./resumeParser";
import { scoreResume, convertScoringToReport } from "./scoring";

/**
 * Generates an analysis report using the deterministic scoring engine.
 * Scores are never hardcoded or randomized: they are calculated using the single source of truth.
 */
export function generateMockAnalysis(
  resumeText: string,
  targetRole?: string,
  jobDescription?: string,
  experienceLevel?: string
): AnalysisResult {
  const structured = parseResumeHeuristic(resumeText);

  if (targetRole && !structured.headline) {
    structured.headline = targetRole;
  }

  const scoring = scoreResume(structured, {
    experienceLevel: experienceLevel || "Fresher",
    targetRole,
  });

  return convertScoringToReport(scoring, structured, {
    targetRole,
    jobDescription,
  });
}
