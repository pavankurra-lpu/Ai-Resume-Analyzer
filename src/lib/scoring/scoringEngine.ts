import { StructuredResume } from "../resumeTypes";

export interface CheckpointResult {
  id: string;
  category:
    | "Contact & links"
    | "Summary"
    | "Education"
    | "Skills"
    | "Projects"
    | "Experience/Internships"
    | "Bullet quality"
    | "Length & layout"
    | "Clean & safe"
    | "Certifications & Achievements";
  points: number;
  earned: number;
  status: "pass" | "fail" | "warn";
  severity: "must-fix" | "improve" | "good";
  title: string;
  message: string;
  whyRecruitersCare: string;
  fixHint: string;
  targetField: string;
  sampleWeak?: string;
  sampleStrong?: string;
}

export interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  checkpoints: CheckpointResult[];
}

export interface ScoringResult {
  totalScore: number; // 0 to 100
  grade: "Needs Work" | "Average" | "Good" | "Excellent";
  summary: string;
  categories: CategoryScore[];
  checkpoints: CheckpointResult[];
  unfilledPlaceholders: { path: string; text: string; placeholder: string }[];
  clichesFound: { path: string; text: string; cliche: string }[];
  sensitiveFound: { path: string; text: string; label: string }[];
  redIssuesCount: number;
  amberIssuesCount: number;
  isFresherReweighted: boolean;
}

export interface ScoringOptions {
  experienceLevel?: string; // "Fresher" | "0-2 yrs" | "2-5 yrs" | "5+ yrs"
  targetRole?: string;
}

export const ACTION_VERBS = new Set([
  "accelerated", "achieved", "added", "analyzed", "architected", "automated", "authored", "built",
  "centralized", "collaborated", "constructed", "contributed", "created", "debugged", "decreased",
  "delivered", "deployed", "designed", "developed", "devised", "diagnosed", "documented",
  "drove", "eliminated", "engineered", "enhanced", "established", "executed",
  "expanded", "expedited", "fixed", "formulated", "generated", "implemented", "improved",
  "increased", "initiated", "innovated", "installed", "integrated", "launched",
  "lead", "led", "managed", "maximized", "mentored", "minimized", "modernized",
  "optimized", "orchestrated", "organized", "overhauled", "performed", "pioneered", "planned",
  "programmed", "reduced", "refactored", "resolved", "restructured", "revamped",
  "scaled", "secured", "simplified", "spearheaded", "standardized", "streamlined",
  "strengthened", "surpassed", "tested", "trained", "transformed", "upgraded", "wrote"
]);

export const CLICHES = [
  "hardworking",
  "hard working",
  "passionate",
  "seeking a challenging position",
  "seeking a challenging role",
  "team player",
  "result-oriented",
  "results-oriented",
  "go-getter",
  "detail-oriented",
  "self-motivated",
  "quick learner",
  "out-of-the-box thinker",
  "fast learner"
];

export const SENSITIVE_PATTERNS = [
  { label: "Date of Birth", regex: /\b(dob|date of birth|d\.o\.b)\b/i },
  { label: "Marital Status", regex: /\b(marital status|married|single|unmarried)\b/i },
  { label: "Gender", regex: /\b(gender|male|female)\b/i },
  { label: "Religion / Caste", regex: /\b(religion|caste|hindu|muslim|christian|sikh)\b/i },
  { label: "Father's Name", regex: /\b(father's name|father name)\b/i },
  { label: "Aadhaar / PAN", regex: /\b(aadhaar|aadhar|pan card|pan number)\b/i },
];

/**
 * Evaluates an individual bullet point for action verb and metrics.
 */
export function evaluateBulletPoint(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { hasVerb: false, hasMetric: false, wordCount: 0, firstWord: "" };
  }

  const words = trimmed.split(/\s+/);
  const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, "") || "";
  const hasVerb = ACTION_VERBS.has(firstWord);

  // Exclude 4-digit years like 2020-2029 and class grades like 10th, 12th
  const textWithoutYears = trimmed
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/\b(10th|12th)\b/gi, "");

  const hasMetric =
    /\b\d+(\.\d+)?%/.test(textWithoutYears) || // percentages
    /[₹$€£]\s*\d+/.test(textWithoutYears) || // currency
    /\b\d+([kKmMbB]|\+)\b/.test(textWithoutYears) || // numbers with scale like 500+, 10k
    /\b\d{2,}\b/.test(textWithoutYears) || // raw numbers 10+ (excluding years)
    /\b(reduced|increased|improved|decreased|cut|boosted|saved|scaled)\s+by\s+\d+/i.test(textWithoutYears) ||
    /\b\d+x\b/i.test(textWithoutYears) || // multipliers like 2x, 5x
    /\b(so that users can|so that students can|enabling the team to|enabling users to|resulting in|leading to|improved user experience|cutting production bugs)\b/i.test(trimmed);

  return {
    hasVerb,
    hasMetric,
    wordCount: words.length,
    firstWord,
  };
}

/**
 * Pure deterministic scoring function. Single source of truth.
 * Scores sum to exactly 100 points.
 */
export function scoreResume(
  resume: StructuredResume,
  options?: ScoringOptions
): ScoringResult {
  const expLevel = options?.experienceLevel || "Fresher";
  const isFresher = expLevel === "Fresher";
  const hasExperience = resume.experience && resume.experience.length > 0;
  const isFresherReweighted = isFresher && !hasExperience;

  const checkpoints: CheckpointResult[] = [];

  // Collect all text for global scanning
  const allBullets: { text: string; path: string }[] = [];
  (resume.experience || []).forEach((e, eIdx) => {
    (e.bullets || []).forEach((b, bIdx) => {
      allBullets.push({ text: b, path: `experience.${eIdx}.bullets.${bIdx}` });
    });
  });
  (resume.projects || []).forEach((p, pIdx) => {
    (p.bullets || []).forEach((b, bIdx) => {
      allBullets.push({ text: b, path: `projects.${pIdx}.bullets.${bIdx}` });
    });
  });

  const fullText = [
    resume.contact.fullName,
    resume.contact.email,
    resume.contact.phone,
    resume.contact.city,
    resume.contact.linkedin,
    resume.contact.github,
    resume.contact.portfolio,
    resume.headline,
    resume.summary,
    ...(resume.education || []).map((e) => `${e.degree} ${e.institution} ${e.grade}`),
    ...(resume.skills || []).flatMap((s) => [s.group, ...s.items]),
    ...(resume.projects || []).flatMap((p) => [p.name, p.techStack, ...p.bullets]),
    ...(resume.experience || []).flatMap((e) => [e.company, e.role, ...e.bullets]),
    ...(resume.certifications || []).map((c) => `${c.name} ${c.issuer}`),
    ...(resume.achievements || []),
  ].join(" ");

  const totalWords = fullText.split(/\s+/).filter(Boolean).length;

  // Global Check: Unfilled Placeholders
  const unfilledPlaceholders: { path: string; text: string; placeholder: string }[] = [];
  const placeholderRegex = /\[([^\]]+)\]/g;
  allBullets.forEach((item) => {
    const matches = item.text.match(placeholderRegex);
    if (matches) {
      matches.forEach((m) => {
        unfilledPlaceholders.push({ path: item.path, text: item.text, placeholder: m });
      });
    }
  });

  // Global Check: Clichés
  const clichesFound: { path: string; text: string; cliche: string }[] = [];
  CLICHES.forEach((c) => {
    const reg = new RegExp(`\\b${c}\\b`, "i");
    if (resume.summary && reg.test(resume.summary)) {
      clichesFound.push({ path: "summary", text: resume.summary, cliche: c });
    }
    allBullets.forEach((b) => {
      if (reg.test(b.text)) {
        clichesFound.push({ path: b.path, text: b.text, cliche: c });
      }
    });
  });

  // Global Check: Sensitive Personal Data
  const sensitiveFound: { path: string; text: string; label: string }[] = [];
  SENSITIVE_PATTERNS.forEach(({ label, regex }) => {
    if (regex.test(fullText)) {
      sensitiveFound.push({ path: "contact", text: label, label });
    }
  });

  // -------------------------------------------------------------
  // 1. Contact & links (12 points)
  // -------------------------------------------------------------
  // 1.1 Email (3 pts)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.contact?.email?.trim() || "");
  checkpoints.push({
    id: "contact_email",
    category: "Contact & links",
    points: 3,
    earned: emailValid ? 3 : 0,
    status: emailValid ? "pass" : "fail",
    severity: "must-fix",
    title: "Professional Email Address",
    message: emailValid
      ? "Professional email address is verified."
      : "Missing or invalid email address.",
    whyRecruitersCare: "Recruiters cannot send interview invites without a clear, valid email address.",
    fixHint: "Add a clean professional email address (e.g., name.surname@gmail.com).",
    targetField: "contact.email",
  });

  // 1.2 Phone (3 pts)
  const phoneDigits = (resume.contact?.phone || "").replace(/\D/g, "");
  const phoneValid = phoneDigits.length >= 10;
  checkpoints.push({
    id: "contact_phone",
    category: "Contact & links",
    points: 3,
    earned: phoneValid ? 3 : 0,
    status: phoneValid ? "pass" : "fail",
    severity: "must-fix",
    title: "Direct Phone Number",
    message: phoneValid
      ? "Mobile contact number is provided."
      : "Missing valid 10-digit phone number.",
    whyRecruitersCare: "Counsellors and HR recruiters in India call or WhatsApp qualified candidates first.",
    fixHint: "Add your active 10-digit mobile number with +91 country code.",
    targetField: "contact.phone",
  });

  // 1.3 Location (2 pts)
  const locationValid = Boolean(resume.contact?.city && resume.contact.city.trim().length >= 2);
  checkpoints.push({
    id: "contact_location",
    category: "Contact & links",
    points: 2,
    earned: locationValid ? 2 : 0,
    status: locationValid ? "pass" : "fail",
    severity: "improve",
    title: "Location / City",
    message: locationValid
      ? "Location is clearly noted."
      : "Missing city or location in header.",
    whyRecruitersCare: "Recruiters filter candidates by job location, city or willingness to relocate.",
    fixHint: "Specify your current city and state (e.g. Bangalore, India).",
    targetField: "contact.city",
  });

  // 1.4 LinkedIn (2 pts)
  const linkedinValid = Boolean(
    resume.contact?.linkedin &&
      (resume.contact.linkedin.includes("linkedin.com") || resume.contact.linkedin.trim().length > 5)
  );
  checkpoints.push({
    id: "contact_linkedin",
    category: "Contact & links",
    points: 2,
    earned: linkedinValid ? 2 : 0,
    status: linkedinValid ? "pass" : "fail",
    severity: "improve",
    title: "LinkedIn Profile Link",
    message: linkedinValid
      ? "LinkedIn profile link included."
      : "Missing clickable LinkedIn profile link.",
    whyRecruitersCare: "Over 85% of recruiters review LinkedIn to verify education, recommendations, and mutual connections.",
    fixHint: "Add your custom LinkedIn URL (e.g. linkedin.com/in/yourname).",
    targetField: "contact.linkedin",
  });

  // 1.5 GitHub or Portfolio (2 pts)
  const linksValid = Boolean(
    (resume.contact?.github && resume.contact.github.trim().length > 3) ||
      (resume.contact?.portfolio && resume.contact.portfolio.trim().length > 3)
  );
  checkpoints.push({
    id: "contact_links",
    category: "Contact & links",
    points: 2,
    earned: linksValid ? 2 : 0,
    status: linksValid ? "pass" : "fail",
    severity: "improve",
    title: "GitHub / Portfolio Link",
    message: linksValid
      ? "Code repository or portfolio link is present."
      : "Missing GitHub or online portfolio link.",
    whyRecruitersCare: "Engineering and design hiring managers verify real code samples and project repositories.",
    fixHint: "Include your GitHub profile or live portfolio website link.",
    targetField: "contact.github",
  });

  // -------------------------------------------------------------
  // 2. Summary (8 points)
  // -------------------------------------------------------------
  const summaryWords = (resume.summary || "").trim().split(/\s+/).filter(Boolean).length;
  const summaryPresent = summaryWords >= 10;
  const summaryOptimal = summaryWords >= 25 && summaryWords <= 85;

  const targetRole = options?.targetRole?.toLowerCase() || resume.headline?.toLowerCase() || "";
  const summaryTextLower = (resume.summary || "").toLowerCase();
  const roleAligned = Boolean(
    summaryPresent &&
      (targetRole
        ? summaryTextLower.includes(targetRole) || targetRole.split(/\s+/).some((w) => w.length > 3 && summaryTextLower.includes(w))
        : summaryWords >= 20)
  );

  checkpoints.push({
    id: "summary_present",
    category: "Summary",
    points: 3,
    earned: summaryPresent ? 3 : 0,
    status: summaryPresent ? "pass" : "fail",
    severity: "must-fix",
    title: "Professional Summary Present",
    message: summaryPresent
      ? "Summary section is present."
      : "Missing professional summary or career objective.",
    whyRecruitersCare: "The top summary gives recruiters an immediate 5-second snapshot of your career identity.",
    fixHint: "Add a 2-4 sentence executive summary highlighting your role, tech stack, and strongest achievement.",
    targetField: "summary",
  });

  checkpoints.push({
    id: "summary_length",
    category: "Summary",
    points: 3,
    earned: summaryOptimal ? 3 : 0,
    status: summaryOptimal ? "pass" : "warn",
    severity: "improve",
    title: "Optimal Summary Length (25-85 words)",
    message: summaryOptimal
      ? `Summary length is ideal (${summaryWords} words).`
      : summaryWords < 25
      ? `Summary is too short (${summaryWords} words; aim for 30-60 words).`
      : `Summary is too long (${summaryWords} words; keep it under 85 words).`,
    whyRecruitersCare: "Short 2-word summaries lack substance, while dense paragraphs get skipped entirely.",
    fixHint: "Keep your summary between 30 and 70 words focusing on impact.",
    targetField: "summary",
  });

  checkpoints.push({
    id: "summary_role_aligned",
    category: "Summary",
    points: 2,
    earned: roleAligned ? 2 : 0,
    status: roleAligned ? "pass" : "warn",
    severity: "improve",
    title: "Target Role Alignment in Summary",
    message: roleAligned
      ? "Summary clearly specifies your target role or technical domain."
      : "Summary does not mention your target job title or specialization.",
    whyRecruitersCare: "Recruiters immediately scan the summary to see if the candidate matches the specific open job opening.",
    fixHint: "Explicitly state your target designation (e.g. 'Frontend Developer with experience in React and TypeScript').",
    targetField: "summary",
  });

  // -------------------------------------------------------------
  // 3. Education (8 points)
  // -------------------------------------------------------------
  const eduList = resume.education || [];
  const eduPresent = eduList.length > 0 && Boolean(eduList[0]?.institution && eduList[0]?.degree);
  const eduDetails = eduList.length > 0 && Boolean(eduList[0]?.endYear && (eduList[0]?.grade || eduList[0]?.startYear));

  checkpoints.push({
    id: "education_present",
    category: "Education",
    points: 4,
    earned: eduPresent ? 4 : 0,
    status: eduPresent ? "pass" : "fail",
    severity: "must-fix",
    title: "Degree & College Listed",
    message: eduPresent
      ? "Degree and college institution are clearly specified."
      : "Missing complete education entry.",
    whyRecruitersCare: "Indian recruiters and automated campus/ATS filters require degree name and university credentials.",
    fixHint: "Add your degree (e.g., B.Tech in CSE) and college/university name.",
    targetField: "education.0.degree",
  });

  checkpoints.push({
    id: "education_details",
    category: "Education",
    points: 4,
    earned: eduDetails ? 4 : 0,
    status: eduDetails ? "pass" : "warn",
    severity: "improve",
    title: "Graduation Year & CGPA/Grade",
    message: eduDetails
      ? "Graduation year and academic performance are documented."
      : "Missing graduation year or CGPA/percentage.",
    whyRecruitersCare: "Recruiters use graduation year to determine eligibility for fresher or lateral hiring drives.",
    fixHint: "Include your graduation year (e.g. 2024) and CGPA or percentage.",
    targetField: "education.0.endYear",
  });

  // -------------------------------------------------------------
  // 4. Skills (10 pts standard, 14 pts if fresher re-weighted)
  // -------------------------------------------------------------
  const skillGroups = resume.skills || [];
  const totalSkillsCount = skillGroups.reduce((acc, g) => acc + (g.items || []).length, 0);
  const skillsCountValid = totalSkillsCount >= 5;
  const skillsCategorized = skillGroups.length >= 2 && skillGroups.every((g) => (g.items || []).length > 0);

  const skillsCountPts = isFresherReweighted ? 7 : 5;
  const skillsCatPts = isFresherReweighted ? 7 : 5;

  checkpoints.push({
    id: "skills_count",
    category: "Skills",
    points: skillsCountPts,
    earned: skillsCountValid ? skillsCountPts : 0,
    status: skillsCountValid ? "pass" : "fail",
    severity: "must-fix",
    title: "Technical Skills Count (at least 5)",
    message: skillsCountValid
      ? `${totalSkillsCount} technical skills listed.`
      : `Only ${totalSkillsCount} skills found (recommend at least 5-10 core skills).`,
    whyRecruitersCare: "ATS keyword filters match candidate resumes directly against the required job description skills.",
    fixHint: "List your core languages, frameworks, libraries, and tools.",
    targetField: "skills.0",
  });

  checkpoints.push({
    id: "skills_categorized",
    category: "Skills",
    points: skillsCatPts,
    earned: skillsCategorized ? skillsCatPts : 0,
    status: skillsCategorized ? "pass" : "warn",
    severity: "improve",
    title: "Categorized Skill Groups",
    message: skillsCategorized
      ? `Skills are categorized into ${skillGroups.length} organized groups.`
      : "Skills should be organized into clear categories (e.g., Languages, Frameworks, Developer Tools).",
    whyRecruitersCare: "Categorized skills help recruiters assess technical breadth in 2 seconds instead of parsing an unorganized list.",
    fixHint: "Group your skills into 'Languages', 'Frameworks & Libraries', and 'Tools & Databases'.",
    targetField: "skills.0",
  });

  // -------------------------------------------------------------
  // 5. Projects (14 pts standard, 22 pts if fresher re-weighted)
  // -------------------------------------------------------------
  const projList = resume.projects || [];
  const projCountValid = projList.length >= 2;
  const projTechValid = projList.length >= 1 && projList.every((p) => Boolean(p.techStack && p.techStack.trim().length > 2));
  const projBulletsValid = projList.length >= 1 && projList.every((p) => (p.bullets || []).length >= 1);

  const projCountPts = isFresherReweighted ? 10 : 6;
  const projTechPts = isFresherReweighted ? 6 : 4;
  const projBulletsPts = isFresherReweighted ? 6 : 4;

  checkpoints.push({
    id: "projects_count",
    category: "Projects",
    points: projCountPts,
    earned: projCountValid ? projCountPts : 0,
    status: projCountValid ? "pass" : "fail",
    severity: "must-fix",
    title: "At Least 2 Significant Projects",
    message: projCountValid
      ? `${projList.length} projects documented.`
      : `Found ${projList.length} projects (minimum 2 recommended to showcase breadth).`,
    whyRecruitersCare: "Projects are the primary proof of hands-on ability for candidates.",
    fixHint: "Add at least 2 complete, working projects with live demo or GitHub links.",
    targetField: "projects.0.name",
  });

  checkpoints.push({
    id: "projects_tech_stack",
    category: "Projects",
    points: projTechPts,
    earned: projTechValid ? projTechPts : 0,
    status: projTechValid ? "pass" : "warn",
    severity: "improve",
    title: "Project Tech Stacks Specified",
    message: projTechValid
      ? "Technologies and frameworks specified for each project."
      : "Some projects are missing their technology stack / tools.",
    whyRecruitersCare: "Interviewers check which technologies you used and whether you built full-stack workflows.",
    fixHint: "Explicitly list the tools used (e.g., 'React, Node.js, Express, MongoDB, Tailwind').",
    targetField: "projects.0.techStack",
  });

  checkpoints.push({
    id: "projects_bullets",
    category: "Projects",
    points: projBulletsPts,
    earned: projBulletsValid ? projBulletsPts : 0,
    status: projBulletsValid ? "pass" : "fail",
    severity: "must-fix",
    title: "Descriptive Project Outcome Bullets",
    message: projBulletsValid
      ? "Projects contain descriptive bullet points."
      : "Projects lack descriptive bullet points explaining what you built.",
    whyRecruitersCare: "A project name with no explanation tells recruiters nothing about your personal contribution.",
    fixHint: "Add 2-3 bullet points per project explaining the problem, architecture, and results.",
    targetField: "projects.0.bullets.0",
  });

  // -------------------------------------------------------------
  // 6. Experience / Internships (14 pts standard, 0 pts if fresher re-weighted)
  // -------------------------------------------------------------
  if (!isFresherReweighted) {
    const expList = resume.experience || [];
    const expPresent = expList.length >= 1 && Boolean(expList[0]?.company && expList[0]?.role);
    const expBullets = expList.length >= 1 && (expList[0]?.bullets || []).length >= 2;
    const expDates = expList.length >= 1 && Boolean(expList[0]?.startDate && (expList[0]?.endDate || expList[0]?.current));

    checkpoints.push({
      id: "experience_present",
      category: "Experience/Internships",
      points: 6,
      earned: expPresent ? 6 : 0,
      status: expPresent ? "pass" : "fail",
      severity: "must-fix",
      title: "Work Experience / Internship Listed",
      message: expPresent
        ? "Work experience or internship role is specified."
        : "Missing company name or job title.",
      whyRecruitersCare: "Prior practical experience proves you can collaborate in a real production team.",
      fixHint: "Add your job title, employer/company name, and dates of engagement.",
      targetField: "experience.0.role",
    });

    checkpoints.push({
      id: "experience_bullets",
      category: "Experience/Internships",
      points: 5,
      earned: expBullets ? 5 : 0,
      status: expBullets ? "pass" : "warn",
      severity: "improve",
      title: "Multiple Experience Bullets (at least 2)",
      message: expBullets
        ? "Role contains detailed bullet points."
        : "Add at least 2 detailed bullet points describing your deliverables.",
      whyRecruitersCare: "Recruiters want to see specific responsibilities and technical accomplishments.",
      fixHint: "Write at least 2-4 bullet points highlighting what you delivered and optimized.",
      targetField: "experience.0.bullets.0",
    });

    checkpoints.push({
      id: "experience_dates",
      category: "Experience/Internships",
      points: 3,
      earned: expDates ? 3 : 0,
      status: expDates ? "pass" : "warn",
      severity: "improve",
      title: "Experience Employment Dates",
      message: expDates
        ? "Start and end dates are documented."
        : "Missing employment dates (month/year).",
      whyRecruitersCare: "Timeline gaps or missing dates raise red flags during background verification.",
      fixHint: "Add start and end dates (e.g. 'Jan 2023 - Present' or 'Jun 2023 - Dec 2023').",
      targetField: "experience.0.startDate",
    });
  } else {
    // Fresher Re-weighting: 2 points for Certifications or Academic Achievements
    const hasCertOrAchieve =
      (resume.certifications && resume.certifications.length > 0) ||
      (resume.achievements && resume.achievements.length > 0);

    checkpoints.push({
      id: "certifications_achievements",
      category: "Certifications & Achievements",
      points: 2,
      earned: hasCertOrAchieve ? 2 : 0,
      status: hasCertOrAchieve ? "pass" : "warn",
      severity: "improve",
      title: "Certifications or Achievements (Fresher Boost)",
      message: hasCertOrAchieve
        ? "Certifications or academic achievements included."
        : "Add at least one technical certification or competition/hackathon achievement.",
      whyRecruitersCare: "For freshers without formal work experience, verified certifications validate technical dedication.",
      fixHint: "Add a relevant certification (e.g. AWS Certified, HackerRank, Learners Track Course) or hackathon award.",
      targetField: "certifications.0.name",
    });
  }

  // -------------------------------------------------------------
  // 7. Bullet quality (20 points)
  // -------------------------------------------------------------
  const evaluatedBullets = allBullets.map((b) => ({
    ...b,
    ...evaluateBulletPoint(b.text),
  }));

  const totalBulletCount = evaluatedBullets.length;
  const verbBullets = evaluatedBullets.filter((b) => b.hasVerb).length;
  const metricBullets = evaluatedBullets.filter((b) => b.hasMetric).length;
  const optimalLengthBullets = evaluatedBullets.filter((b) => b.wordCount >= 8 && b.wordCount <= 35).length;

  const verbRatio = totalBulletCount > 0 ? verbBullets / totalBulletCount : 0;
  const metricRatio = totalBulletCount > 0 ? metricBullets / totalBulletCount : 0;
  const lengthRatio = totalBulletCount > 0 ? optimalLengthBullets / totalBulletCount : 0;

  const verbsPass = totalBulletCount > 0 && verbRatio >= 0.6;
  const metricsPass = totalBulletCount > 0 && metricRatio >= 0.35;
  const lengthPass = totalBulletCount > 0 && lengthRatio >= 0.6;

  const verbsEarned = totalBulletCount > 0
    ? (verbsPass ? 8 : Math.round((verbBullets / totalBulletCount) * 8 * 10) / 10)
    : 0;
  const metricsEarned = totalBulletCount > 0
    ? (metricsPass ? 8 : Math.round((metricBullets / totalBulletCount) * 8 * 10) / 10)
    : 0;
  const lengthEarned = totalBulletCount > 0
    ? (lengthPass ? 4 : Math.round((optimalLengthBullets / totalBulletCount) * 4 * 10) / 10)
    : 0;

  // Identify first weak bullet for direct targeting
  const weakVerbBullet = evaluatedBullets.find((b) => !b.hasVerb);
  const weakMetricBullet = evaluatedBullets.find((b) => !b.hasMetric);
  const weakLengthBullet = evaluatedBullets.find((b) => b.wordCount < 8 || b.wordCount > 35);

  checkpoints.push({
    id: "bullets_action_verbs",
    category: "Bullet quality",
    points: 8,
    earned: verbsEarned,
    status: verbsPass ? "pass" : verbBullets > 0 ? "warn" : "fail",
    severity: "must-fix",
    title: "Strong Action Verbs (60%+ of bullets)",
    message: verbsPass
      ? `${Math.round(verbRatio * 100)}% of bullets start with strong action verbs.`
      : `Only ${Math.round(verbRatio * 100)}% of bullets start with action verbs (target: 60%+).`,
    whyRecruitersCare: "Passive phrases like 'Responsible for' or 'Helped with' make candidates sound like passive bystanders rather than owners.",
    fixHint: "Begin every bullet with an active past-tense verb like 'Architected', 'Engineered', 'Optimized', or 'Automated'.",
    targetField: weakVerbBullet ? weakVerbBullet.path : (allBullets[0]?.path || "projects.0.bullets.0"),
    sampleWeak: "Worked on website bugs and helped team.",
    sampleStrong: "Resolved 40+ high-priority software bugs, boosting checkout conversion by 14%.",
  });

  checkpoints.push({
    id: "bullets_metrics",
    category: "Bullet quality",
    points: 8,
    earned: metricsEarned,
    status: metricsPass ? "pass" : metricBullets > 0 ? "warn" : "fail",
    severity: "improve",
    title: "Measurable Results & Metrics (35%+ of bullets)",
    message: metricsPass
      ? `${Math.round(metricRatio * 100)}% of bullets contain quantified metrics.`
      : `Only ${Math.round(metricRatio * 100)}% of bullets have numbers or metrics (target: 35%+).`,
    whyRecruitersCare: "Quantified results prove tangible business impact and distinguish top engineers from average ones.",
    fixHint: "Quantify your impact using percentages, latency reductions, user scale, or cost savings (e.g. 'reduced latency by 35%').",
    targetField: weakMetricBullet ? weakMetricBullet.path : (allBullets[0]?.path || "projects.0.bullets.0"),
    sampleWeak: "Improved database query performance.",
    sampleStrong: "Optimized indexing on PostgreSQL tables, slashing query latency by 45%.",
  });

  checkpoints.push({
    id: "bullets_length",
    category: "Bullet quality",
    points: 4,
    earned: lengthEarned,
    status: lengthPass ? "pass" : optimalLengthBullets > 0 ? "warn" : "fail",
    severity: "improve",
    title: "Concise Bullet Length (8-35 words)",
    message: lengthPass
      ? "Bullets are concise and readable."
      : "Some bullets are either 1-line fragments or dense blocks of text.",
    whyRecruitersCare: "Recruiters spend only 6 seconds scanning; bullets exceeding 40 words get skipped.",
    fixHint: "Keep each bullet point between 10 and 25 words.",
    targetField: weakLengthBullet ? weakLengthBullet.path : (allBullets[0]?.path || "projects.0.bullets.0"),
  });

  // -------------------------------------------------------------
  // 8. Length & layout (6 points)
  // -------------------------------------------------------------
  let minWords = 180;
  let maxWords = 550;
  if (expLevel === "2-5 yrs") {
    minWords = 250;
    maxWords = 750;
  } else if (expLevel === "5+ yrs") {
    minWords = 350;
    maxWords = 1100;
  }

  const lengthValid = totalWords >= minWords && totalWords <= maxWords;
  const layoutComplete = Boolean(
    resume.contact?.fullName &&
      resume.education &&
      resume.education.length > 0 &&
      resume.skills &&
      resume.skills.length > 0 &&
      resume.projects &&
      resume.projects.length > 0
  );

  checkpoints.push({
    id: "layout_length",
    category: "Length & layout",
    points: 4,
    earned: lengthValid ? 4 : 0,
    status: lengthValid ? "pass" : "warn",
    severity: "improve",
    title: "Ideal Length for Experience Level",
    message: lengthValid
      ? `Word count (${totalWords} words) fits the 1-page standard for ${expLevel}.`
      : totalWords < minWords
      ? `Resume is too sparse (${totalWords} words; recommend at least ${minWords} words).`
      : `Resume exceeds recommended length (${totalWords} words; keep within ${maxWords} words).`,
    whyRecruitersCare: "Freshers and junior engineers must fit their credentials on a crisp 1-page document.",
    fixHint: `Tune your content to the 1-page sweet spot (${minWords} - ${maxWords} words).`,
    targetField: "summary",
  });

  checkpoints.push({
    id: "layout_completeness",
    category: "Length & layout",
    points: 2,
    earned: layoutComplete ? 2 : 0,
    status: layoutComplete ? "pass" : "fail",
    severity: "must-fix",
    title: "Core Structural Sections Present",
    message: layoutComplete
      ? "All mandatory sections (Contact, Education, Skills, Projects) are present."
      : "One or more core sections are missing or empty.",
    whyRecruitersCare: "ATS parsers look for standard headings to categorize candidate qualifications.",
    fixHint: "Ensure Contact, Summary, Education, Skills, and Projects sections are complete.",
    targetField: "education",
  });

  // -------------------------------------------------------------
  // 9. Clean & safe (8 points)
  // -------------------------------------------------------------
  const placeholdersClean = unfilledPlaceholders.length === 0;
  const sensitiveClean = sensitiveFound.length === 0;
  const clichesClean = clichesFound.length === 0;

  checkpoints.push({
    id: "clean_placeholders",
    category: "Clean & safe",
    points: 3,
    earned: placeholdersClean ? 3 : 0,
    status: placeholdersClean ? "pass" : "fail",
    severity: "must-fix",
    title: "No Unfilled Bracket Placeholders",
    message: placeholdersClean
      ? "Zero unfilled placeholders detected."
      : `Found ${unfilledPlaceholders.length} unfilled placeholder(s) like ${unfilledPlaceholders[0]?.placeholder}.`,
    whyRecruitersCare: "Submitting [X%] or [Company Name] to an employer signals carelessness and results in instant rejection.",
    fixHint: "Fill in or remove any placeholder brackets with real verified metrics.",
    targetField: unfilledPlaceholders[0]?.path || "projects.0.bullets.0",
  });

  checkpoints.push({
    id: "clean_sensitive_data",
    category: "Clean & safe",
    points: 3,
    earned: sensitiveClean ? 3 : 0,
    status: sensitiveClean ? "pass" : "fail",
    severity: "must-fix",
    title: "No Sensitive Personal Data",
    message: sensitiveClean
      ? "Resume is free of discriminatory personal disclosures."
      : `Sensitive personal data detected: ${sensitiveFound.map((s) => s.label).join(", ")}.`,
    whyRecruitersCare: "Modern Indian and international tech recruiters explicitly discard resumes containing DOB, marital status, caste, or Aadhaar numbers to avoid bias and data privacy liabilities.",
    fixHint: "Remove Date of Birth, Marital Status, Religion, Father's Name, and Aadhaar numbers.",
    targetField: sensitiveFound[0]?.path || "contact",
  });

  checkpoints.push({
    id: "clean_cliches",
    category: "Clean & safe",
    points: 2,
    earned: clichesClean ? 2 : 0,
    status: clichesClean ? "pass" : "warn",
    severity: "improve",
    title: "No Empty Buzzwords & Clichés",
    message: clichesClean
      ? "Zero empty buzzwords detected."
      : `Found cliché buzzword(s): "${clichesFound.map((c) => c.cliche).slice(0, 3).join('", "')}".`,
    whyRecruitersCare: "Buzzwords like 'hardworking team player' occupy valuable space without showing concrete skills.",
    fixHint: "Replace buzzwords with specific deliverables and technical competencies.",
    targetField: clichesFound[0]?.path || "summary",
  });

  // -------------------------------------------------------------
  // Calculate Totals & Group Categories
  // -------------------------------------------------------------
  const categoryNames: CheckpointResult["category"][] = [
    "Contact & links",
    "Summary",
    "Education",
    "Skills",
    "Projects",
    ...(isFresherReweighted ? (["Certifications & Achievements"] as const) : (["Experience/Internships"] as const)),
    "Bullet quality",
    "Length & layout",
    "Clean & safe",
  ];

  const categories: CategoryScore[] = categoryNames.map((catName) => {
    const catCheckpoints = checkpoints.filter((c) => c.category === catName);
    const score = catCheckpoints.reduce((acc, c) => acc + c.earned, 0);
    const maxScore = catCheckpoints.reduce((acc, c) => acc + c.points, 0);
    return {
      name: catName,
      score,
      maxScore,
      weight: maxScore,
      checkpoints: catCheckpoints,
    };
  });

  const totalScore = checkpoints.reduce((acc, c) => acc + c.earned, 0);

  let grade: ScoringResult["grade"] = "Needs Work";
  if (totalScore >= 85) grade = "Excellent";
  else if (totalScore >= 70) grade = "Good";
  else if (totalScore >= 50) grade = "Average";

  let summary = "";
  if (totalScore >= 85) {
    summary = "Recruiter-ready! Excellent quantification, strong action verbs, and ATS-optimized formatting.";
  } else if (totalScore >= 70) {
    summary = "Solid resume foundation. Fixing a few key bullet metrics and missing links will make it top-tier.";
  } else if (totalScore >= 50) {
    summary = "Average structure. Needs stronger action verbs, quantified results, and removal of weak phrases.";
  } else {
    summary = "Needs work. Missing vital contact links, project details, or active measurable bullets.";
  }

  const redIssuesCount = checkpoints.filter((c) => c.status === "fail" && c.severity === "must-fix").length;
  const amberIssuesCount = checkpoints.filter((c) => c.status !== "pass" && c.severity === "improve").length;

  return {
    totalScore,
    grade,
    summary,
    categories,
    checkpoints,
    unfilledPlaceholders,
    clichesFound,
    sensitiveFound,
    redIssuesCount,
    amberIssuesCount,
    isFresherReweighted,
  };
}
