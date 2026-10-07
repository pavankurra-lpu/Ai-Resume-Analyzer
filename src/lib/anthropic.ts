import Anthropic from "@anthropic-ai/sdk";
import { LEARNERS_TRACK_COURSES } from "@/config/courses";
import { AnalysisResult } from "./schema";
import { generateMockAnalysis } from "./mockAnalysis";
import { parseResumeHeuristic } from "./resumeParser";
import { scoreResume, convertScoringToReport } from "./scoring";

export async function analyzeResumeWithAI(params: {
  resumeText: string;
  targetRole?: string;
  jobDescription?: string;
  experienceLevel?: string;
}): Promise<{ result: AnalysisResult; isDemo: boolean }> {
  const { resumeText, targetRole, jobDescription, experienceLevel } = params;
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  // Deterministic scoring engine is the SINGLE SOURCE OF TRUTH for all numbers
  const structured = parseResumeHeuristic(resumeText);
  if (targetRole && !structured.headline) {
    structured.headline = targetRole;
  }
  const scoring = scoreResume(structured, {
    experienceLevel: experienceLevel || "Fresher",
    targetRole,
  });
  const baseResult = convertScoringToReport(scoring, structured, {
    targetRole,
    jobDescription,
  });

  // If no API key provided, immediately return deterministic report
  if (!apiKey) {
    return {
      result: baseResult,
      isDemo: true,
    };
  }

  // With API key, AI is ONLY used for qualitative phrasing suggestions
  // AI NEVER assigns numbers or changes category scores
  try {
    const model = process.env.AI_MODEL || "claude-3-5-sonnet-20241022";
    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are a resume writing coach. The candidate's resume has been evaluated deterministically.
Provide 3 specific bullet point rewrite suggestions for weak lines in this resume text.
Do not assign scores or numbers. Never invent facts; use [X] placeholders for metrics.

Resume text:
${resumeText.slice(0, 8000)}

Return ONLY a JSON array of 3 objects with keys "original_text", "problem", "fix", "rewrite", "priority" ("High" | "Medium").`;

    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      temperature: 0.2,
      system: "Return only valid JSON with no markdown formatting.",
      messages: [{ role: "user", content: prompt }],
    });

    const contentBlock = response.content[0];
    if (contentBlock && contentBlock.type === "text") {
      let jsonText = contentBlock.text.trim();
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) jsonText = codeBlockMatch[1].trim();

      const aiIssues = JSON.parse(jsonText);
      if (Array.isArray(aiIssues) && aiIssues.length > 0) {
        // Merge AI qualitative suggestions into the first category with issues
        const targetCat = baseResult.categories.find((c) => c.issues.length > 0) || baseResult.categories[0];
        if (targetCat) {
          targetCat.issues = [...aiIssues.slice(0, 3), ...targetCat.issues];
        }
      }
    }
  } catch (err) {
    console.warn("AI qualitative enhancement skipped:", err);
  }

  return {
    result: baseResult,
    isDemo: false,
  };
}
