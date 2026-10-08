import { StructuredResume } from "../resumeTypes";
import { findRoleDefinition, isTechRole } from "../../config/roles";
import {
  AtsScoringResult,
  AtsCategoryScore,
  AtsCheckpointResult,
  ComputeAtsOptions,
  AtsGrade,
} from "./types";
import { hasActionVerb, hasResultOrOutcome, mentionsToolOrTech } from "./actionVerbs";

const SENSITIVE_DATA_PATTERNS = [
  { label: "Date of Birth / DOB", regex: /\b(date\s+of\s+birth|d\.?o\.?b\.?|birth\s*date)\b/i },
  { label: "Marital Status", regex: /\b(marital\s+status|married|unmarried|single)\b/i },
  { label: "Father's Name", regex: /\b(father'?s?\s+name|father\s*:)\b/i },
  { label: "Gender", regex: /\b(gender\s*:|sex\s*:|male|female)\b/i },
  { label: "Religion / Caste", regex: /\b(religion|caste|hindu|muslim|christian|sikh)\b/i },
  { label: "Aadhaar Card", regex: /\b(aadhaar|aadhar|uidai|\d{4}\s\d{4}\s\d{4})\b/i },
  { label: "PAN Card", regex: /\b(pan\s+card|pan\s+no\.?|[a-z]{5}[0-9]{4}[a-z]{1})\b/i },
  { label: "Passport Number", regex: /\b(passport\s+(number|no\.?)|[a-z]{1}[0-9]{7})\b/i },
];

const BUZZWORDS = [
  "hardworking",
  "hard worker",
  "team player",
  "passionate",
  "go-getter",
  "self-starter",
  "results-driven",
  "detail-oriented",
  "think outside the box",
  "synergy",
  "dynamic",
  "motivated",
  "fast learner",
  "people person",
];

export function computeAtsScore(
  resume: StructuredResume,
  options: ComputeAtsOptions = {}
): AtsScoringResult {
  const { experienceLevel = "Fresher", targetRole = "", jobDescription = "", fileMeta } = options;

  const isFresher =
    experienceLevel.toLowerCase().includes("fresher") ||
    experienceLevel.toLowerCase().includes("0-2");
  const techRole = isTechRole(targetRole);
  const roleDef = findRoleDefinition(targetRole);

  const checkpoints: AtsCheckpointResult[] = [];

  // ==========================================
  // CATEGORY A: ATS Format and Parsing (30 pts)
  // ==========================================

  // A1. Single column, no tables, text boxes, icons, skill bars or photo (8 pts)
  let a1Earned = 8;
  let a1Status: "pass" | "fail" | "warn" = "pass";
  let a1Message = "Clean single-column layout without tables, text boxes, or photos.";
  let a1Partial = 1;

  if (fileMeta) {
    if (fileMeta.hasTables || fileMeta.hasImagesOrPhotos || fileMeta.hasTextBoxes || fileMeta.hasIconsOrBars) {
      a1Earned = 0;
      a1Status = "fail";
      a1Message = "Uploaded document contains tables, images, or text boxes that break ATS text extraction.";
      a1Partial = 0;
    } else if (fileMeta.isSingleColumn === false) {
      a1Earned = 2;
      a1Status = "fail";
      a1Message = "Multi-column layout detected. ATS software reads across columns, scrambling content.";
      a1Partial = 0.25;
    } else if (fileMeta.isSingleColumn === undefined && !fileMeta.isPdf) {
      // Not verified uploaded file
      a1Earned = 4;
      a1Status = "warn";
      a1Message = "Layout not fully verified from uploaded file. Half credit assigned.";
      a1Partial = 0.5;
    }
  }

  checkpoints.push({
    id: "format_single_column",
    category: "ATS format and parsing",
    points: 8,
    earned: a1Earned,
    status: a1Status,
    severity: a1Status === "pass" ? "good" : "must-fix",
    title: "Single Column & No Graphics",
    message: a1Message,
    whyRecruitersCare: "ATS parsers read left-to-right across lines; multi-column tables, text boxes, and photos cause garbled or dropped text.",
    fixHint: "Stick to single-column text flow. Our editor and PDF export guarantee this automatically.",
    targetField: "layout",
    partialRatio: a1Partial,
  });

  // A2. Standard section headings (6 pts)
  // Required standard headings: Summary, Education, Skills, Projects, Experience (or Certifications if fresher)
  const standardHeadingsFound: string[] = [];
  if (resume.summary?.trim()) standardHeadingsFound.push("Summary");
  if (resume.education && resume.education.length > 0) standardHeadingsFound.push("Education");
  if (resume.skills && resume.skills.length > 0) standardHeadingsFound.push("Skills");
  if (resume.projects && resume.projects.length > 0) standardHeadingsFound.push("Projects");
  if (resume.experience && resume.experience.length > 0) standardHeadingsFound.push("Experience");
  if (resume.certifications && resume.certifications.length > 0) standardHeadingsFound.push("Certifications");

  const coreHeadingsCount = standardHeadingsFound.length;
  const targetHeadings = isFresher ? 4 : 5; // fresher needs 4 (Summary, Edu, Skills, Projects)
  const a2Partial = Math.min(1, coreHeadingsCount / targetHeadings);
  const a2Earned = Math.round(a2Partial * 6 * 100) / 100;
  const a2Status: "pass" | "fail" | "warn" =
    a2Earned >= 6 ? "pass" : a2Earned >= 3 ? "warn" : "fail";

  checkpoints.push({
    id: "format_standard_headings",
    category: "ATS format and parsing",
    points: 6,
    earned: a2Earned,
    status: a2Status,
    severity: a2Status === "pass" ? "good" : a2Status === "warn" ? "improve" : "must-fix",
    title: "Standard Section Headings",
    message:
      a2Earned >= 6
        ? "Standard ATS headings used throughout."
        : `Found ${coreHeadingsCount} of ${targetHeadings} recommended standard headings (${standardHeadingsFound.join(", ")}).`,
    whyRecruitersCare: "ATS parsers look for exact standard headings (Education, Skills, Projects, Experience) to file information correctly.",
    fixHint: "Use standard headings: Professional Summary, Education, Technical Skills, Projects, Work Experience.",
    targetField: "sectionOrder",
    partialRatio: a2Partial,
  });

  // A3. Contact details in page body, plain text email & phone (6 pts)
  const hasPlainEmail = Boolean(resume.contact?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.contact.email.trim()));
  const hasPlainPhone = Boolean(resume.contact?.phone && resume.contact.phone.replace(/[^0-9]/g, "").length >= 10);
  const contactPartsPresent = (hasPlainEmail ? 1 : 0) + (hasPlainPhone ? 1 : 0);
  const a3Partial = contactPartsPresent / 2;
  const a3Earned = a3Partial * 6;
  const a3Status: "pass" | "fail" | "warn" = a3Earned === 6 ? "pass" : a3Earned > 0 ? "warn" : "fail";

  checkpoints.push({
    id: "format_contact_in_body",
    category: "ATS format and parsing",
    points: 6,
    earned: a3Earned,
    status: a3Status,
    severity: a3Status === "pass" ? "good" : "must-fix",
    title: "Plain-Text Contact Information",
    message:
      a3Earned === 6
        ? "Email and phone are clearly formatted and machine-readable in body text."
        : "Missing plain-text email or valid 10-digit phone number in page body.",
    whyRecruitersCare: "Contact info placed inside header/footer bands or formatted as images gets stripped by ATS parsers.",
    fixHint: "Add your email address and 10-digit mobile number directly at the top of your document body.",
    targetField: "contact.email",
    partialRatio: a3Partial,
  });

  // A4. One consistent date format (3 pts)
  // Gather all dates from education and experience
  const rawDates: string[] = [];
  (resume.education || []).forEach((e) => {
    if (e.startYear) rawDates.push(e.startYear.trim());
    if (e.endYear) rawDates.push(e.endYear.trim());
  });
  (resume.experience || []).forEach((e) => {
    if (e.startDate) rawDates.push(e.startDate.trim());
    if (e.endDate) rawDates.push(e.endDate.trim());
  });

  let a4Earned = 3;
  let a4Status: "pass" | "fail" | "warn" = "pass";
  let a4Message = "Dates follow a consistent chronological format.";
  let a4Partial = 1;

  if (rawDates.length > 1) {
    const isMonthYear = rawDates.filter((d) => /^[a-zA-Z]{3,9}\s+\d{4}$/.test(d)).length;
    const isYearOnly = rawDates.filter((d) => /^\d{4}$/.test(d)).length;
    const isSlashDate = rawDates.filter((d) => /^\d{1,2}\/\d{2,4}$/.test(d)).length;

    const maxConsistent = Math.max(isMonthYear, isYearOnly, isSlashDate);
    const consistencyRatio = maxConsistent / rawDates.length;

    if (consistencyRatio >= 0.75) {
      a4Earned = 3;
      a4Status = "pass";
      a4Partial = 1;
    } else if (consistencyRatio >= 0.5) {
      a4Earned = 1.5;
      a4Status = "warn";
      a4Partial = 0.5;
      a4Message = "Mixed date formats detected (e.g. some '2024', some 'Jan 2024').";
    } else {
      a4Earned = 0;
      a4Status = "fail";
      a4Partial = 0;
      a4Message = "Inconsistent date formats make work timelines difficult for ATS to calculate.";
    }
  }

  checkpoints.push({
    id: "format_consistent_dates",
    category: "ATS format and parsing",
    points: 3,
    earned: a4Earned,
    status: a4Status,
    severity: a4Status === "pass" ? "good" : "improve",
    title: "Consistent Date Formatting",
    message: a4Message,
    whyRecruitersCare: "ATS parsers calculate total experience months using date strings; uniform formatting avoids calculation errors.",
    fixHint: "Standardize all dates to 'MMM YYYY' (e.g. 'Jan 2024 - Present') or 'YYYY' (e.g. '2020 - 2024').",
    targetField: "experience.0.dates",
    partialRatio: a4Partial,
  });

  // A5. Text-based PDF with selectable text, readable font (Calibri/Arial, 10-11 pt) (4 pts)
  let a5Earned = 4;
  let a5Status: "pass" | "fail" | "warn" = "pass";
  let a5Message = "Clean text-based vector format with standard 10-11pt typography.";
  let a5Partial = 1;

  if (fileMeta) {
    if (fileMeta.hasSelectableText === false) {
      a5Earned = 0;
      a5Status = "fail";
      a5Message = "Scanned/image-only PDF detected. ATS software cannot read scanned text.";
      a5Partial = 0;
    }
  }

  checkpoints.push({
    id: "format_text_pdf",
    category: "ATS format and parsing",
    points: 4,
    earned: a5Earned,
    status: a5Status,
    severity: a5Status === "pass" ? "good" : "must-fix",
    title: "Selectable Text & Readable Typography",
    message: a5Message,
    whyRecruitersCare: "Recruiters and automated systems require searchable, selectable text rendered in standard web-safe fonts.",
    fixHint: "Always export text-based PDFs rather than scans or image conversions.",
    targetField: "layout",
    partialRatio: a5Partial,
  });

  // A6. Length fits (fresher and 0-2 yrs: 1 page; 2-5 yrs: up to 2 pages) (3 pts)
  let a6Earned = 3;
  let a6Status: "pass" | "fail" | "warn" = "pass";
  let a6Message = "Resume length perfectly fits single-page standard for freshers.";
  let a6Partial = 1;

  // Approximate word count to check page fit
  const totalTextLength =
    (resume.summary || "").length +
    (resume.education || []).map((e) => `${e.degree} ${e.institution}`).join(" ").length +
    (resume.projects || []).map((p) => `${p.name} ${(p.bullets || []).join(" ")}`).join(" ").length +
    (resume.experience || []).map((e) => `${e.role} ${(e.bullets || []).join(" ")}`).join(" ").length;

  const totalWords = totalTextLength > 0 ? totalTextLength / 6 : 0;

  if (isFresher && totalWords > 650) {
    a6Earned = 1.5;
    a6Status = "warn";
    a6Message = "Resume content exceeds 1 page (~650 words). Freshers should keep it to exactly 1 page.";
    a6Partial = 0.5;
  }

  checkpoints.push({
    id: "format_length_fits",
    category: "ATS format and parsing",
    points: 3,
    earned: a6Earned,
    status: a6Status,
    severity: a6Status === "pass" ? "good" : "improve",
    title: "Optimal Page Length",
    message: a6Message,
    whyRecruitersCare: "Recruiters spend 6-10 seconds on an initial scan. Multi-page fresher resumes dilute key strengths.",
    fixHint: "Keep fresher resumes strictly within 1 page (350 - 600 words).",
    targetField: "layout",
    partialRatio: a6Partial,
  });

  // ==========================================
  // CATEGORY B: Content Completeness (25 pts)
  // ==========================================

  // B1. Contact completeness: name, email, phone, city/state, LinkedIn + GitHub/portfolio for tech (8 pts)
  let b1Score = 0;
  const hasName = Boolean(resume.contact?.fullName?.trim());
  const hasEmail = Boolean(resume.contact?.email?.trim());
  const hasPhone = Boolean(resume.contact?.phone?.trim());
  const hasCity = Boolean(resume.contact?.city?.trim());
  const hasLinkedIn = Boolean(resume.contact?.linkedin?.trim());
  const hasCodeOrPort = Boolean(resume.contact?.github?.trim() || resume.contact?.portfolio?.trim());

  if (techRole) {
    if (hasName) b1Score += 1.5;
    if (hasEmail) b1Score += 1.5;
    if (hasPhone) b1Score += 1.5;
    if (hasCity) b1Score += 1.5;
    if (hasLinkedIn) b1Score += 1.0;
    if (hasCodeOrPort) b1Score += 1.0;
  } else {
    // Non-tech: re-weight GitHub point to LinkedIn and City
    if (hasName) b1Score += 1.5;
    if (hasEmail) b1Score += 1.5;
    if (hasPhone) b1Score += 1.5;
    if (hasCity) b1Score += 1.75;
    if (hasLinkedIn) b1Score += 1.75;
  }

  const b1Earned = Math.round(b1Score * 100) / 100;
  const b1Partial = Math.min(1, b1Earned / 8);
  const b1Status: "pass" | "fail" | "warn" = b1Earned >= 8 ? "pass" : b1Earned >= 5 ? "warn" : "fail";

  checkpoints.push({
    id: "content_contact",
    category: "Content completeness",
    points: 8,
    earned: b1Earned,
    status: b1Status,
    severity: b1Status === "pass" ? "good" : "must-fix",
    title: "Complete Contact Information & Links",
    message:
      b1Earned >= 8
        ? "All essential contact details and profile links are complete."
        : `Contact info missing: ${[
            !hasName && "Full Name",
            !hasEmail && "Email",
            !hasPhone && "Phone",
            !hasCity && "City/Location",
            !hasLinkedIn && "LinkedIn",
            techRole && !hasCodeOrPort && "GitHub / Portfolio",
          ]
            .filter(Boolean)
            .join(", ")}.`,
    whyRecruitersCare: "Incomplete contact details or missing professional links make it difficult to verify projects or schedule interviews.",
    fixHint: `Include your full name, email, phone, city, LinkedIn URL${techRole ? ", and GitHub/Portfolio link" : ""}.`,
    targetField: "contact.email",
    partialRatio: b1Partial,
  });

  // B2. Summary of 25 to 85 words that names the target role (5 pts)
  const summaryText = resume.summary?.trim() || "";
  const summaryWords = summaryText ? summaryText.split(/\s+/).filter(Boolean).length : 0;
  let b2Earned = 0;
  let b2Message = "Summary is missing.";

  if (summaryWords >= 25 && summaryWords <= 85) {
    b2Earned += 3;
  } else if (summaryWords >= 15 && summaryWords < 25) {
    b2Earned += 1.5; // partial credit for concise summary
  } else if (summaryWords > 85) {
    b2Earned += 2; // too long
  }

  // Names target role?
  const roleName = (targetRole || resume.headline || "").toLowerCase().trim();
  const mentionsRole =
    Boolean(roleName) &&
    (summaryText.toLowerCase().includes(roleName) ||
      roleName.split(/\s+/).some((w) => w.length >= 4 && summaryText.toLowerCase().includes(w)));

  if (mentionsRole) {
    b2Earned += 2;
  } else if (summaryWords >= 25) {
    b2Earned += 0.5; // partial
  }

  const b2Partial = Math.min(1, b2Earned / 5);
  const b2Status: "pass" | "fail" | "warn" = b2Earned >= 4.5 ? "pass" : b2Earned >= 2.5 ? "warn" : "fail";
  if (summaryWords >= 25 && summaryWords <= 85 && mentionsRole) {
    b2Message = "Summary is role-focused and in the ideal 25-85 word range.";
  } else if (!summaryText) {
    b2Message = "No professional summary found.";
  } else if (!mentionsRole) {
    b2Message = `Summary does not explicitly mention your target role (${targetRole || "e.g. Software Engineer"}).`;
  } else {
    b2Message = `Summary is ${summaryWords} words (ideal range: 25-85 words).`;
  }

  checkpoints.push({
    id: "content_summary",
    category: "Content completeness",
    points: 5,
    earned: b2Earned,
    status: b2Status,
    severity: b2Status === "pass" ? "good" : "improve",
    title: "Role-Aligned Professional Summary",
    message: b2Message,
    whyRecruitersCare: "A concise 2-3 sentence summary immediately frames your qualifications for the specific open role.",
    fixHint: `Write a 25-85 word summary stating your background, top 2-3 technical skills, and target role: "${targetRole || "your role"}".`,
    targetField: "summary",
    partialRatio: b2Partial,
  });

  // B3. Education: degree, college, years, CGPA or percentage (5 pts)
  let b3Score = 0;
  const edus = resume.education || [];
  if (edus.length > 0) {
    const primary = edus[0];
    if (primary.degree?.trim()) b3Score += 1.5;
    if (primary.institution?.trim()) b3Score += 1.5;
    if (primary.startYear?.trim() || primary.endYear?.trim()) b3Score += 1.0;
    if (primary.grade?.trim()) b3Score += 1.0;
  }
  const b3Earned = Math.round(b3Score * 100) / 100;
  const b3Partial = Math.min(1, b3Earned / 5);
  const b3Status: "pass" | "fail" | "warn" = b3Earned >= 5 ? "pass" : b3Earned >= 3 ? "warn" : "fail";

  checkpoints.push({
    id: "content_education",
    category: "Content completeness",
    points: 5,
    earned: b3Earned,
    status: b3Status,
    severity: b3Status === "pass" ? "good" : "must-fix",
    title: "Complete Education Details",
    message:
      b3Earned >= 5
        ? "Degree, college name, graduation year, and CGPA/grade are present."
        : "Missing degree, institution name, graduation year, or CGPA/percentage.",
    whyRecruitersCare: "Campus recruiters filter freshers by college degree, branch, passing year, and academic cutoffs (CGPA / %).",
    fixHint: "List your degree (e.g. B.Tech in CSE), college name, graduation year (e.g. 2024), and CGPA or percentage.",
    targetField: "education.0.degree",
    partialRatio: b3Partial,
  });

  // B4. Skills: 8 to 20 skills, grouped (4 pts)
  const allSkills = (resume.skills || []).flatMap((s) => s.items || []);
  const skillCount = allSkills.length;
  let b4Earned = 0;

  if (skillCount >= 8 && skillCount <= 25) {
    b4Earned += 2;
  } else if (skillCount >= 4) {
    b4Earned += 1;
  }

  const isGrouped = (resume.skills || []).length >= 2;
  if (isGrouped && skillCount >= 6) {
    b4Earned += 2;
  } else if ((resume.skills || []).length >= 1 && skillCount >= 4) {
    b4Earned += 1;
  }

  const b4Partial = Math.min(1, b4Earned / 4);
  const b4Status: "pass" | "fail" | "warn" = b4Earned >= 4 ? "pass" : b4Earned >= 2 ? "warn" : "fail";

  checkpoints.push({
    id: "content_skills",
    category: "Content completeness",
    points: 4,
    earned: b4Earned,
    status: b4Status,
    severity: b4Status === "pass" ? "good" : "improve",
    title: "Categorized Technical Skills (8-20 skills)",
    message:
      b4Earned >= 4
        ? `Solid skills inventory with ${skillCount} grouped skills.`
        : `Found ${skillCount} skills (target: 8-20 skills grouped by category e.g. Frontend, Backend, Tools).`,
    whyRecruitersCare: "Categorized skills help both ATS keyword parsers and engineering hiring managers evaluate your technical stack at a glance.",
    fixHint: "Group your skills into categories (e.g. Languages: Python, Java; Frameworks: React, Node; Tools: Git, Docker).",
    targetField: "skills.0.items",
    partialRatio: b4Partial,
  });

  // B5. At least 2 projects, or 1 project plus 1 internship or job (3 pts)
  const projCount = (resume.projects || []).length;
  const expCount = (resume.experience || []).length;
  let b5Earned = 0;

  if (projCount >= 2 || (projCount >= 1 && expCount >= 1)) {
    b5Earned = 3;
  } else if (projCount === 1) {
    b5Earned = 1.5;
  }

  const b5Partial = b5Earned / 3;
  const b5Status: "pass" | "fail" | "warn" = b5Earned === 3 ? "pass" : "fail";

  checkpoints.push({
    id: "content_projects_experience",
    category: "Content completeness",
    points: 3,
    earned: b5Earned,
    status: b5Status,
    severity: b5Status === "pass" ? "good" : "must-fix",
    title: "Demonstrated Projects & Experience",
    message:
      b5Earned === 3
        ? "Sufficient hands-on work demonstrated (at least 2 projects or 1 project + 1 internship)."
        : `Only found ${projCount} project(s) and ${expCount} work experience. Freshers need at least 2 strong projects.`,
    whyRecruitersCare: "Projects and internships are the #1 evidence of your practical coding ability when you have limited full-time experience.",
    fixHint: "Add at least 2 significant projects with clear technical descriptions and outcomes.",
    targetField: "projects.0.name",
    partialRatio: b5Partial,
  });

  // ==========================================
  // CATEGORY C: Bullet Quality (25 pts)
  // ==========================================
  // Collect all non-blank bullets from projects and experience
  const allBullets: { text: string; path: string }[] = [];
  (resume.projects || []).forEach((p, pIdx) => {
    (p.bullets || []).forEach((b, bIdx) => {
      if (b.trim()) allBullets.push({ text: b.trim(), path: `projects.${pIdx}.bullets.${bIdx}` });
    });
  });
  (resume.experience || []).forEach((e, eIdx) => {
    (e.bullets || []).forEach((b, bIdx) => {
      if (b.trim()) allBullets.push({ text: b.trim(), path: `experience.${eIdx}.bullets.${bIdx}` });
    });
  });

  const totalBullets = allBullets.length;
  let bulletsWithVerb = 0;
  let bulletsWithTool = 0;
  let bulletsWithResult = 0;
  let bulletsWithOptimalLength = 0;

  const candidateSkillsList = allSkills;

  allBullets.forEach((b) => {
    if (hasActionVerb(b.text)) bulletsWithVerb++;
    if (mentionsToolOrTech(b.text, candidateSkillsList)) bulletsWithTool++;
    if (hasResultOrOutcome(b.text).hasResult) bulletsWithResult++;
    const words = b.text.split(/\s+/).filter(Boolean).length;
    if (words >= 8 && words <= 30) bulletsWithOptimalLength++;
  });

  // C1. Starts with a strong action verb (8 pts)
  const c1Partial = totalBullets > 0 ? bulletsWithVerb / totalBullets : 0;
  const c1Earned = Math.round(c1Partial * 8 * 100) / 100;
  const c1Status: "pass" | "fail" | "warn" = c1Earned >= 6 ? "pass" : c1Earned >= 3 ? "warn" : "fail";

  checkpoints.push({
    id: "bullets_action_verbs",
    category: "Bullet quality",
    points: 8,
    earned: c1Earned,
    status: c1Status,
    severity: c1Status === "pass" ? "good" : "must-fix",
    title: "Strong Action Verbs in Bullets",
    message:
      totalBullets === 0
        ? "No bullet points found."
        : `${bulletsWithVerb} of ${totalBullets} bullets start with a recognized strong action verb.`,
    whyRecruitersCare: "Weak openings ('Worked on', 'Responsible for') hide your contribution. Action verbs show initiative and ownership.",
    fixHint: "Begin every bullet with a power verb like Built, Developed, Designed, Optimized, Automated, or Led.",
    targetField: "projects.0.bullets.0",
    sampleWeak: "Worked on developing the website features and helped team with bugs.",
    sampleStrong: "Engineered responsive frontend modules using React, resolving 15+ UI defects.",
    partialRatio: c1Partial,
  });

  // C2. Names the tool or technology used (6 pts)
  const c2Partial = totalBullets > 0 ? bulletsWithTool / totalBullets : 0;
  const c2Earned = Math.round(c2Partial * 6 * 100) / 100;
  const c2Status: "pass" | "fail" | "warn" = c2Earned >= 4.5 ? "pass" : c2Earned >= 2.5 ? "warn" : "fail";

  checkpoints.push({
    id: "bullets_tools_tech",
    category: "Bullet quality",
    points: 6,
    earned: c2Earned,
    status: c2Status,
    severity: c2Status === "pass" ? "good" : "improve",
    title: "Tools & Technologies Named in Context",
    message:
      totalBullets === 0
        ? "No bullet points found."
        : `${bulletsWithTool} of ${totalBullets} bullets name the specific tools, libraries, or technologies used.`,
    whyRecruitersCare: "Mentioning tools in context proves you actually used the technologies listed in your skills section.",
    fixHint: "Explicitly mention the technologies used (e.g. 'using React and Node.js', 'with PostgreSQL and Docker').",
    targetField: "projects.0.bullets.0",
    sampleWeak: "Created an authentication system for the application.",
    sampleStrong: "Architected secure JWT authentication workflows using Node.js, Express, and Redis.",
    partialRatio: c2Partial,
  });

  // C3. Shows a result: a number OR an outcome in words (6 pts)
  // Metrics are NEVER mandatory. Outcomes in words qualify fully!
  const c3Partial = totalBullets > 0 ? bulletsWithResult / totalBullets : 0;
  const c3Earned = Math.round(c3Partial * 6 * 100) / 100;
  const c3Status: "pass" | "fail" | "warn" = c3Earned >= 4.5 ? "pass" : c3Earned >= 2.5 ? "warn" : "fail";

  checkpoints.push({
    id: "bullets_results",
    category: "Bullet quality",
    points: 6,
    earned: c3Earned,
    status: c3Status,
    severity: c3Status === "pass" ? "good" : "improve",
    title: "Measurable Results or Outcomes",
    message:
      totalBullets === 0
        ? "No bullet points found."
        : `${bulletsWithResult} of ${totalBullets} bullets show a tangible result (a metric OR an outcome in words).`,
    whyRecruitersCare: "Bullets that show impact prove business or user value rather than just a list of daily duties.",
    fixHint: "Add a metric (e.g. 'slashing query latency by 35%') OR explain the outcome in words (e.g. 'so students can filter jobs by city').",
    targetField: "projects.0.bullets.0",
    sampleWeak: "Built a weather dashboard with search and location.",
    sampleStrong: "Built a weather dashboard using OpenWeather API, enabling 2,000+ students to track forecasts in real time.",
    partialRatio: c3Partial,
  });

  // C4. Length of 8 to 30 words (5 pts)
  const c4Partial = totalBullets > 0 ? bulletsWithOptimalLength / totalBullets : 0;
  const c4Earned = Math.round(c4Partial * 5 * 100) / 100;
  const c4Status: "pass" | "fail" | "warn" = c4Earned >= 3.75 ? "pass" : c4Earned >= 2 ? "warn" : "fail";

  checkpoints.push({
    id: "bullets_length",
    category: "Bullet quality",
    points: 5,
    earned: c4Earned,
    status: c4Status,
    severity: c4Status === "pass" ? "good" : "improve",
    title: "Concise Bullet Length (8-30 words)",
    message:
      totalBullets === 0
        ? "No bullet points found."
        : `${bulletsWithOptimalLength} of ${totalBullets} bullets fall in the 8-30 word recruiter sweet spot.`,
    whyRecruitersCare: "Bullets under 8 words lack detail; bullets over 30 words turn into dense paragraphs that recruiters skip.",
    fixHint: "Aim for 1-2 lines per bullet (8 to 30 words). If a bullet is too long, split it into two focused points.",
    targetField: "projects.0.bullets.0",
    partialRatio: c4Partial,
  });

  // ==========================================
  // CATEGORY D: Keyword Relevance (12 pts)
  // ==========================================
  // Role keywords from config/roles.ts or from pasted job description
  let targetKeywords: string[] = [];
  if (roleDef) {
    targetKeywords = [...roleDef.coreKeywords, ...roleDef.toolsAndTech];
  } else if (jobDescription?.trim()) {
    // Extract common tech words from JD
    const jdTokens = jobDescription
      .toLowerCase()
      .split(/[^a-zA-Z0-9+#.]+/)
      .filter((w) => w.length >= 3);
    targetKeywords = Array.from(new Set(jdTokens)).slice(0, 15);
  } else {
    // Default general software keywords
    targetKeywords = ["React", "JavaScript", "TypeScript", "Node.js", "SQL", "Git", "REST API", "Database", "Python", "HTML", "CSS", "Docker"];
  }

  // Check matching in context (skills AND bullets / text)
  const fullTextToSearch = [
    resume.summary || "",
    ...allSkills,
    ...allBullets.map((b) => b.text),
    ...(resume.projects || []).map((p) => p.techStack || ""),
  ]
    .join(" ")
    .toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetKeywords.forEach((kw) => {
    const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(fullTextToSearch)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // 6 or more keywords matched gives full 12 points (capped to avoid keyword stuffing)
  const targetMatches = 6;
  const dPartial = Math.min(1, matchedKeywords.length / targetMatches);
  const dEarned = Math.round(dPartial * 12 * 100) / 100;
  const dStatus: "pass" | "fail" | "warn" = dEarned >= 10 ? "pass" : dEarned >= 6 ? "warn" : "fail";

  checkpoints.push({
    id: "keywords_relevance",
    category: "Keyword relevance",
    points: 12,
    earned: dEarned,
    status: dStatus,
    severity: dStatus === "pass" ? "good" : "improve",
    title: `Role Keywords Relevance (${targetRole || "Software Engineering"})`,
    message:
      dEarned >= 10
        ? `Strong keyword match: found ${matchedKeywords.length} core keywords in context.`
        : `Found ${matchedKeywords.length} of ${targetMatches} target role keywords in context (${matchedKeywords.slice(0, 4).join(", ")}).`,
    whyRecruitersCare: "ATS filters match resumes against required skills and technologies specified in the recruiter job requisition.",
    fixHint: `Include relevant keywords you actually possess from: ${missingKeywords.slice(0, 6).join(", ")}.`,
    targetField: "skills.0.items",
    partialRatio: dPartial,
    details: { matchedKeywords, missingKeywords: missingKeywords.slice(0, 8) },
  });

  // ==========================================
  // CATEGORY E: Clean and Safe (8 pts)
  // ==========================================

  // E1. No unfilled [placeholders] (3 pts)
  const entireResumeJson = JSON.stringify(resume);
  const placeholderMatches = entireResumeJson.match(/\[([A-Z0-9%_\s-]+)\]/g) || [];
  let e1Earned = 3;
  let e1Status: "pass" | "fail" | "warn" = "pass";
  let e1Message = "No template placeholders found.";
  let e1Partial = 1;

  if (placeholderMatches.length > 0) {
    e1Earned = Math.max(0, 3 - placeholderMatches.length * 1.5);
    e1Status = "fail";
    e1Message = `Found ${placeholderMatches.length} unfilled placeholder(s) like ${placeholderMatches.slice(0, 2).join(", ")}.`;
    e1Partial = e1Earned / 3;
  }

  checkpoints.push({
    id: "clean_placeholders",
    category: "Clean and safe",
    points: 3,
    earned: e1Earned,
    status: e1Status,
    severity: e1Status === "pass" ? "good" : "must-fix",
    title: "No Unfilled Placeholders",
    message: e1Message,
    whyRecruitersCare: "Leaving [X%] or [Company Name] template brackets looks careless and leads to instant rejection.",
    fixHint: "Fill in or delete all bracketed placeholders like [X%] or [Tool Name].",
    targetField: "projects.0.bullets.0",
    partialRatio: e1Partial,
  });

  // E2. No sensitive personal data (photo, DOB, marital status, Aadhaar, PAN) (3 pts)
  const sensitiveFound: string[] = [];
  SENSITIVE_DATA_PATTERNS.forEach(({ label, regex }) => {
    if (regex.test(entireResumeJson)) {
      sensitiveFound.push(label);
    }
  });

  let e2Earned = 3;
  let e2Status: "pass" | "fail" | "warn" = "pass";
  let e2Message = "Resume is free of sensitive personal data.";
  let e2Partial = 1;

  if (sensitiveFound.length > 0) {
    e2Earned = Math.max(0, 3 - sensitiveFound.length * 1.5);
    e2Status = "fail";
    e2Message = `Found sensitive personal data: ${sensitiveFound.join(", ")}.`;
    e2Partial = e2Earned / 3;
  }

  checkpoints.push({
    id: "clean_sensitive_data",
    category: "Clean and safe",
    points: 3,
    earned: e2Earned,
    status: e2Status,
    severity: e2Status === "pass" ? "good" : "must-fix",
    title: "Clean of Sensitive Personal Data",
    message: e2Message,
    whyRecruitersCare: "Indian and international hiring standards discourage photos, date of birth, marital status, or Aadhaar/PAN to prevent bias and identity theft.",
    fixHint: "Remove photos, DOB, marital status, religion, father's name, or ID card numbers.",
    targetField: "contact.email",
    partialRatio: e2Partial,
  });

  // E3. No empty buzzwords (2 pts)
  const buzzwordsFound: string[] = [];
  BUZZWORDS.forEach((bw) => {
    const regex = new RegExp(`\\b${bw}\\b`, "i");
    if (regex.test(entireResumeJson)) {
      buzzwordsFound.push(bw);
    }
  });

  let e3Earned = 2;
  let e3Status: "pass" | "fail" | "warn" = "pass";
  let e3Message = "Free of empty buzzwords.";
  let e3Partial = 1;

  if (buzzwordsFound.length > 0) {
    e3Earned = Math.max(0, 2 - buzzwordsFound.length * 1.0);
    e3Status = "warn";
    e3Message = `Found generic buzzwords: "${buzzwordsFound.slice(0, 3).join('", "')}".`;
    e3Partial = e3Earned / 2;
  }

  checkpoints.push({
    id: "clean_buzzwords",
    category: "Clean and safe",
    points: 2,
    earned: e3Earned,
    status: e3Status,
    severity: e3Status === "pass" ? "good" : "improve",
    title: "No Empty Buzzwords",
    message: e3Message,
    whyRecruitersCare: "Claims like 'hardworking' and 'team player' carry zero weight without concrete project evidence.",
    fixHint: "Replace generic buzzwords with specific deliverables and technical accomplishments.",
    targetField: "summary",
    partialRatio: e3Partial,
  });

  // ==========================================
  // AGGREGATE SCORES & CATEGORIES
  // ==========================================
  const categoryNames: AtsCategoryScore["name"][] = [
    "ATS format and parsing",
    "Content completeness",
    "Bullet quality",
    "Keyword relevance",
    "Clean and safe",
  ];

  const categories: AtsCategoryScore[] = categoryNames.map((catName) => {
    const cps = checkpoints.filter((c) => c.category === catName);
    const maxScore = cps.reduce((sum, c) => sum + c.points, 0);
    const score = Math.round(cps.reduce((sum, c) => sum + c.earned, 0) * 10) / 10;
    return {
      name: catName,
      score,
      maxScore,
      weight: maxScore,
      checkpoints: cps,
    };
  });

  const rawTotal = checkpoints.reduce((sum, c) => sum + c.earned, 0);
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  // Grades: 0-49 Needs work, 50-69 Average, 70-84 Good, 85-100 ATS-ready
  let grade: AtsGrade = "Needs work";
  if (totalScore >= 85) grade = "ATS-ready";
  else if (totalScore >= 70) grade = "Good";
  else if (totalScore >= 50) grade = "Average";

  const redIssuesCount = checkpoints.filter((c) => c.severity === "must-fix" && c.status === "fail").length;
  const amberIssuesCount = checkpoints.filter((c) => c.status === "warn").length;

  let summary = "";
  if (grade === "ATS-ready") {
    summary = "Your resume meets top recruiter and automated ATS standards. It is clean, role-aligned, and ready for applications.";
  } else if (grade === "Good") {
    summary = "Solid resume! A few quick fixes to your bullet points and contact links will elevate you into the shortlist-ready tier.";
  } else if (grade === "Average") {
    summary = "Good foundation, but several key areas (action verbs, quantifiable results, or missing links) need attention.";
  } else {
    summary = "Your resume needs important structural improvements to pass automated ATS filters and recruiter screening.";
  }

  return {
    score: totalScore,
    grade,
    categories,
    checkpoints,
    version: "ats-v1",
    summary,
    redIssuesCount,
    amberIssuesCount,
    disclaimer: "Our standard ATS Readiness Score. Real ATS systems differ, so this is a reliable guide, not a guarantee.",
    bulletStats: {
      total: totalBullets,
      withVerb: bulletsWithVerb,
      withTool: bulletsWithTool,
      withResult: bulletsWithResult,
      optimalLength: bulletsWithOptimalLength,
    },
    matchedKeywords,
    missingKeywords,
  };
}
