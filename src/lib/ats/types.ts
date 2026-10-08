import { StructuredResume } from "../resumeTypes";

export type AtsGrade = "Needs work" | "Average" | "Good" | "ATS-ready";

export interface AtsCheckpointResult {
  id: string;
  category:
    | "ATS format and parsing"
    | "Content completeness"
    | "Bullet quality"
    | "Keyword relevance"
    | "Clean and safe";
  points: number; // Max points for this checkpoint
  earned: number; // Actual points earned (supports proportional partial credit)
  status: "pass" | "fail" | "warn";
  severity: "must-fix" | "improve" | "good";
  title: string;
  message: string;
  whyRecruitersCare: string;
  fixHint: string;
  targetField: string;
  sampleWeak?: string;
  sampleStrong?: string;
  partialRatio?: number; // e.g. 0.5 for 2 of 4 bullets passing
  details?: Record<string, unknown>;
}

export interface AtsCategoryScore {
  name:
    | "ATS format and parsing"
    | "Content completeness"
    | "Bullet quality"
    | "Keyword relevance"
    | "Clean and safe";
  score: number;
  maxScore: number;
  weight: number;
  checkpoints: AtsCheckpointResult[];
}

export interface FileMeta {
  isPdf?: boolean;
  hasSelectableText?: boolean;
  fontFamilies?: string[];
  fontSizePt?: number;
  isSingleColumn?: boolean;
  hasTables?: boolean;
  hasImagesOrPhotos?: boolean;
  hasIconsOrBars?: boolean;
  hasTextBoxes?: boolean;
  pageCount?: number;
}

export interface ComputeAtsOptions {
  experienceLevel?: string; // "Fresher" | "0-2 yrs" | "2-5 yrs" | "5+ yrs"
  targetRole?: string;
  jobDescription?: string;
  fileMeta?: FileMeta;
}

export interface AtsScoringResult {
  score: number; // 0 to 100 (rounded)
  grade: AtsGrade;
  categories: AtsCategoryScore[];
  checkpoints: AtsCheckpointResult[];
  version: "ats-v1";
  summary: string;
  redIssuesCount: number;
  amberIssuesCount: number;
  disclaimer: string;
  bulletStats: {
    total: number;
    withVerb: number;
    withTool: number;
    withResult: number;
    optimalLength: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
}
