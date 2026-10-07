import { z } from "zod";

export const LeadSchema = z.object({
  name: z.string().max(100).optional().default(""),
  phone: z.string().trim().optional().default(""),
  email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
  collegeOrCompany: z.string().max(150).optional().default(""),
  experienceLevel: z.enum(["Fresher", "0-2 yrs", "2-5 yrs", "5+ yrs"], {
    errorMap: () => ({ message: "Please select your experience level" }),
  }).default("Fresher"),
  targetRole: z.string().max(100).optional().default(""),
  jobDescription: z.string().max(10000).optional().default(""),
  consent: z.boolean().default(true),
});

export type LeadInput = z.infer<typeof LeadSchema>;

export const IssueSchema = z.object({
  original_text: z.string(),
  problem: z.string(),
  fix: z.string(),
  rewrite: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
});

export const CategorySchema = z.object({
  name: z.string(),
  score: z.number().min(0),
  max_score: z.number().min(1),
  strengths: z.array(z.string()),
  issues: z.array(IssueSchema),
});

export const JdMatchSchema = z
  .object({
    percentage: z.number().min(0).max(100),
    matched_keywords: z.array(z.string()),
    missing_keywords: z.array(z.string()),
    advice: z.string(),
  })
  .nullable();

export const AtsCheckSchema = z.object({
  check: z.string(),
  passed: z.boolean(),
  note: z.string(),
});

export const SuggestedCourseSchema = z.object({
  name: z.string(),
  reason: z.string(),
});

export const AnalysisResultSchema = z.object({
  overall_score: z.number().min(0).max(100),
  grade: z.enum(["Needs Work", "Average", "Good", "Excellent"]),
  summary: z.string(),
  categories: z.array(CategorySchema),
  top_quick_wins: z.array(z.string()).min(1),
  jd_match: JdMatchSchema,
  ats_checks: z.array(AtsCheckSchema),
  suggested_courses: z.array(SuggestedCourseSchema),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type CategoryResult = z.infer<typeof CategorySchema>;
export type IssueResult = z.infer<typeof IssueSchema>;
export type AtsCheckResult = z.infer<typeof AtsCheckSchema>;
export type SuggestedCourseResult = z.infer<typeof SuggestedCourseSchema>;

export function calculateGrade(score: number): "Needs Work" | "Average" | "Good" | "Excellent" {
  if (score < 50) return "Needs Work";
  if (score < 70) return "Average";
  if (score < 85) return "Good";
  return "Excellent";
}

export function getScoreColor(score: number): {
  color: string;
  bg: string;
  border: string;
  text: string;
} {
  if (score < 50) {
    return { color: "#EF4444", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" };
  }
  if (score < 70) {
    return { color: "#F59E0B", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" };
  }
  if (score < 85) {
    return { color: "#14B8A6", bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" };
  }
  return { color: "#22C55E", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" };
}
