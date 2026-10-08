export const ACTION_VERBS = new Set([
  // Core listed in spec
  "fixed",
  "added",
  "wrote",
  "contributed",
  "organized",
  "led",
  // Engineering & Construction
  "built",
  "developed",
  "designed",
  "implemented",
  "optimized",
  "automated",
  "architected",
  "engineered",
  "created",
  "deployed",
  "constructed",
  "configured",
  "maintained",
  "refactored",
  "integrated",
  "streamlined",
  "accelerated",
  "achieved",
  "analyzed",
  "centralized",
  "collaborated",
  "debugged",
  "decreased",
  "delivered",
  "devised",
  "documented",
  "drove",
  "eliminated",
  "enhanced",
  "established",
  "executed",
  "formulated",
  "generated",
  "guided",
  "identified",
  "initiated",
  "installed",
  "instituted",
  "launched",
  "managed",
  "mentored",
  "migrated",
  "modernized",
  "monitored",
  "negotiated",
  "operated",
  "overhauled",
  "partnered",
  "performed",
  "pioneered",
  "planned",
  "prepared",
  "presented",
  "produced",
  "programmed",
  "published",
  "redesigned",
  "reduced",
  "resolved",
  "restructured",
  "revamped",
  "reviewed",
  "saved",
  "scaled",
  "secured",
  "selected",
  "simplified",
  "spearheaded",
  "standardized",
  "strengthened",
  "trained",
  "transformed",
  "upgraded",
  "validated",
  "verified",
  "authored",
  "customized",
  "benchmarked",
  "compiled",
  "diagnosed",
  "profiled",
  "orchestrated",
  "provisioned",
  "containerized",
  "tested",
  "audited",
  "modeled",
  "calculated",
  "extracted",
  "visualized",
  "forecasted",
  "mined",
  "queried",
]);

/**
 * Extracts first word of a sentence or bullet point
 */
export function getFirstWord(text: string): string {
  const clean = text
    .trim()
    .replace(/^[-*•–—\d.)\s]+/, "")
    .trim();
  const match = clean.match(/^[a-zA-Z]+/);
  return match ? match[0].toLowerCase() : "";
}

/**
 * Checks if a bullet starts with a strong action verb
 */
export function hasActionVerb(text: string): boolean {
  const firstWord = getFirstWord(text);
  if (!firstWord) return false;
  return ACTION_VERBS.has(firstWord);
}

/**
 * Result detection:
 * A number OR an outcome in words (for example "so students can filter jobs by city").
 * Metrics are NEVER mandatory. Years like 2023 or Class 10/12 are excluded.
 */
export function hasResultOrOutcome(text: string): { hasResult: boolean; type?: "number" | "words"; match?: string } {
  const trimmed = text.trim();
  if (!trimmed) return { hasResult: false };

  // 1. Outcome in words (causal / outcome phrases)
  const outcomePhraseRegex = /\b(so\s+that\s+[a-z]+|so\s+[a-z]+\s+can|in\s+order\s+to|resulting\s+in|which\s+(reduced|improved|increased|enabled|prevented|helped)|enabling\s+[a-z]+|allowing\s+[a-z]+|helping\s+(the\s+)?team|to\s+ensure\b|leading\s+to|yielding|facilitating|delivering|achieving)\b/i;
  const outcomeMatch = trimmed.match(outcomePhraseRegex);
  if (outcomeMatch) {
    return { hasResult: true, type: "words", match: outcomeMatch[0] };
  }

  // 2. Quantified numbers / metrics (excluding isolated years 1990-2035 and school standards Class 10/12)
  // Check for percentage, multipliers, units, or plain numbers
  const tokens = trimmed.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i].replace(/[(),:;]/g, "");

    // % or percent
    if (/\b\d+(\.\d+)?%\b/.test(raw) || /\b\d+(\.\d+)?\s*percent\b/i.test(trimmed)) {
      return { hasResult: true, type: "number", match: raw };
    }

    // multiplier (e.g. 2x, 10x, 3.5x)
    if (/\b\d+(\.\d+)?x\b/i.test(raw)) {
      return { hasResult: true, type: "number", match: raw };
    }

    // Number with + or metric suffix (e.g. 100+, 10k, 5M, 20ms)
    if (/\b\d+([kmb]|ms|s|sec|fps|\+)\b/i.test(raw)) {
      return { hasResult: true, type: "number", match: raw };
    }

    // Number followed by a quantifiable noun
    const numMatch = raw.match(/^\d+$/);
    if (numMatch) {
      const val = parseInt(numMatch[0], 10);
      // Skip calendar years
      if (val >= 1990 && val <= 2035) continue;
      // Skip Class 10 / Class 12
      const prevWord = i > 0 ? tokens[i - 1].toLowerCase().replace(/[^a-z]/g, "") : "";
      if (prevWord === "class" || prevWord === "grade") continue;

      const nextWord = i + 1 < tokens.length ? tokens[i + 1].toLowerCase().replace(/[^a-z]/g, "") : "";
      const metricNouns = new Set([
        "users", "clients", "customers", "requests", "queries", "records", "rows",
        "students", "participants", "teams", "teammates", "members", "engineers",
        "bugs", "issues", "tickets", "features", "endpoints", "pages", "screens",
        "components", "tests", "stars", "forks", "downloads", "hours", "days", "weeks",
        "months", "percent", "percentage", "reduction", "increase", "speedup", "latency"
      ]);
      if (metricNouns.has(nextWord) || val >= 5) {
        return { hasResult: true, type: "number", match: `${raw} ${nextWord}`.trim() };
      }
    }
  }

  return { hasResult: false };
}

/**
 * Tools and Technology detection:
 * Checks if a bullet mentions a recognizable technology, programming language, tool, or framework.
 */
const COMMON_TECH_TOOLS = new Set([
  "react", "next.js", "nextjs", "vue", "angular", "svelte", "html", "html5", "css", "css3",
  "tailwind", "bootstrap", "sass", "javascript", "typescript", "node", "node.js", "express",
  "python", "django", "flask", "fastapi", "java", "spring", "springboot", "c++", "c#", ".net",
  "php", "laravel", "ruby", "rails", "sql", "mysql", "postgresql", "postgres", "sqlite",
  "mongodb", "redis", "firebase", "supabase", "prisma", "docker", "kubernetes", "aws", "gcp",
  "azure", "git", "github", "gitlab", "jira", "figma", "postman", "jest", "cypress", "selenium",
  "playwright", "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn", "tableau", "power bi",
  "excel", "rest", "restful", "api", "apis", "graphql", "redux", "zustand", "webpack", "vite",
  "linux", "bash", "ci/cd", "ci", "cd", "kafka", "rabbitmq"
]);

export function mentionsToolOrTech(text: string, contextualSkills: string[] = []): boolean {
  const lower = text.toLowerCase();

  // Check against common tech tools
  for (const tool of COMMON_TECH_TOOLS) {
    const escaped = tool.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lower)) return true;
  }

  // Check against candidate's contextual skills
  for (const skill of contextualSkills) {
    const s = skill.trim().toLowerCase();
    if (s.length >= 2) {
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(lower)) return true;
    }
  }

  return false;
}
