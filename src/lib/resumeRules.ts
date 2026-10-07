import { StructuredResume } from "./resumeTypes";

export interface RuleResult {
  id: string;
  category: "Length" | "Contact" | "Summary" | "Education" | "Skills" | "Experience" | "Projects" | "Formatting" | "Privacy" | "Placeholders";
  status: "pass" | "warn" | "fail";
  pointsGained: number; // current points earned
  pointsPossible: number; // max points possible for this rule
  title: string;
  message: string;
  whyRecruitersCare: string;
  fixHint: string;
  fieldTarget?: string;
  exampleWeak?: string;
  exampleStrong?: string;
}

export interface RuleAuditSummary {
  rules: RuleResult[];
  totalScore: number; // out of 100
  potentialScore: number;
  pointsToGain: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  unfilledPlaceholders: string[];
}

const ACTION_VERBS = new Set([
  "accelerated", "achieved", "analyzed", "architected", "automated", "built",
  "centralized", "collaborated", "constructed", "created", "debugged", "decreased",
  "delivered", "deployed", "designed", "developed", "devised", "documented",
  "drove", "eliminated", "engineered", "enhanced", "established", "executed",
  "expanded", "expedited", "formulated", "generated", "implemented", "improved",
  "increased", "initiated", "innovated", "installed", "integrated", "launched",
  "lead", "led", "managed", "maximized", "mentored", "minimized", "modernized",
  "optimized", "orchestrated", "overhauled", "performed", "pioneered", "planned",
  "programmed", "reduced", "refactored", "resolved", "restructured", "revamped",
  "scaled", "secured", "simplified", "spearheaded", "standardized", "streamlined",
  "strengthened", "surpassed", "tested", "trained", "transformed", "upgraded"
]);

const WEAK_OPENERS = [
  "responsible for",
  "helped with",
  "helped in",
  "worked on",
  "assisted in",
  "assisted with",
  "involved in",
  "tasked with",
  "handled"
];

const CLICHES = [
  "hardworking",
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
  "out-of-the-box thinker"
];

const SENSITIVE_INFO_PATTERNS = [
  { label: "Date of Birth", regex: /\b(dob|date of birth|d\.o\.b)\b/i },
  { label: "Marital Status", regex: /\b(marital status|married|single|unmarried)\b/i },
  { label: "Gender", regex: /\b(gender|male|female)\b/i },
  { label: "Religion / Caste", regex: /\b(religion|caste|hindu|muslim|christian|sikh)\b/i },
  { label: "Father's Name", regex: /\b(father's name|father name)\b/i },
  { label: "Aadhaar / PAN", regex: /\b(aadhaar|aadhar|pan card|pan number)\b/i },
  { label: "Permanent Address", regex: /\b(permanent address|h\.no|house no|flat no|street)\b/i },
];

export function auditResume(resume: StructuredResume, targetRole?: string): RuleAuditSummary {
  const rules: RuleResult[] = [];

  // Helper to extract all text
  const allBullets: { text: string; path: string; name: string }[] = [];
  resume.experience.forEach((exp, eIdx) => {
    exp.bullets.forEach((b, bIdx) => {
      allBullets.push({
        text: b,
        path: `experience.${eIdx}.bullets.${bIdx}`,
        name: `${exp.role || "Experience"} bullet ${bIdx + 1}`,
      });
    });
  });
  resume.projects.forEach((proj, pIdx) => {
    proj.bullets.forEach((b, bIdx) => {
      allBullets.push({
        text: b,
        path: `projects.${pIdx}.bullets.${bIdx}`,
        name: `${proj.name || "Project"} bullet ${bIdx + 1}`,
      });
    });
  });

  const fullText = [
    resume.contact.fullName,
    resume.headline,
    resume.summary,
    ...resume.education.map((e) => `${e.degree} ${e.institution} ${e.grade}`),
    ...resume.skills.flatMap((s) => s.items),
    ...allBullets.map((b) => b.text),
    ...resume.certifications.map((c) => `${c.name} ${c.issuer}`),
    ...resume.achievements,
  ].join(" ");

  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;

  // 1. PLACEHOLDERS CHECK (Crucial for recruiter readiness)
  const placeholderRegex = /\[(?:X|x|X%|x%|\d+x|\d+X|number|\.\.\.|____)\]|\[[^\]]{1,20}\]/g;
  const placeholderMatches = fullText.match(placeholderRegex) || [];
  const unfilledPlaceholders = Array.from(new Set(placeholderMatches));

  if (unfilledPlaceholders.length > 0) {
    rules.push({
      id: "placeholders-unfilled",
      category: "Placeholders",
      status: "fail",
      pointsGained: 0,
      pointsPossible: 8,
      title: "Unfilled Placeholders Found",
      message: `You have ${unfilledPlaceholders.length} placeholder(s) like ${unfilledPlaceholders.slice(0, 2).join(", ")}.`,
      whyRecruitersCare: "Sending a resume with [X%] or [number] looks careless and instantly rejects your application.",
      fixHint: "Click each highlighted yellow placeholder in the editor and type the real number or real detail.",
      fieldTarget: "summary",
      exampleWeak: "Increased website performance by [X%].",
      exampleStrong: "Increased website performance by 35%.",
    });
  } else {
    rules.push({
      id: "placeholders-unfilled",
      category: "Placeholders",
      status: "pass",
      pointsGained: 8,
      pointsPossible: 8,
      title: "Zero Unfilled Placeholders",
      message: "Great job! All brackets and placeholder tags have been replaced with real facts.",
      whyRecruitersCare: "Clean text proves attention to detail and readiness for client or engineering work.",
      fixHint: "Keep your numbers genuine and verified.",
    });
  }

  // 2. LENGTH RULE
  if (wordCount < 180) {
    rules.push({
      id: "resume-length",
      category: "Length",
      status: "fail",
      pointsGained: 2,
      pointsPossible: 8,
      title: "Resume is Too Short",
      message: `Your resume has only ${wordCount} words (aim for 300 to 500 words for a solid 1-page resume).`,
      whyRecruitersCare: "Very short resumes look incomplete or suggest a lack of hands-on project work.",
      fixHint: "Add details to your projects: describe what technologies you used, what features you built, and what results you got.",
      fieldTarget: "projects",
      exampleWeak: "Built a calculator app.",
      exampleStrong: "Built a responsive financial calculator using React, helping 200+ college peers calculate semester grades with 100% accuracy.",
    });
  } else if (wordCount > 650) {
    rules.push({
      id: "resume-length",
      category: "Length",
      status: "warn",
      pointsGained: 5,
      pointsPossible: 8,
      title: "Resume Might Spill Onto Page 2",
      message: `Your resume has ${wordCount} words. Freshers should fit cleanly onto exactly 1 page.`,
      whyRecruitersCare: "Indian recruiters spend 6 to 10 seconds per resume. A messy second page with 3 lines gets ignored.",
      fixHint: "Trim wordy bullets down to under 25 words each, and keep only your top 2-3 strongest projects.",
      fieldTarget: "experience",
    });
  } else {
    rules.push({
      id: "resume-length",
      category: "Length",
      status: "pass",
      pointsGained: 8,
      pointsPossible: 8,
      title: "Ideal 1-Page Length",
      message: `Your resume is ${wordCount} words, which fits cleanly on 1 page.`,
      whyRecruitersCare: "Concise 1-page resumes let recruiters see all your achievements at a single glance.",
      fixHint: "Maintain this concise balance.",
    });
  }

  // 3. CONTACT: EMAIL
  const email = resume.contact.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isSuspiciousEmail = /\d{4,}/.test(email) || /(cool|rock|king|hacker|dude|killer|sweet)/i.test(email);

  if (!email || !emailRegex.test(email)) {
    rules.push({
      id: "contact-email",
      category: "Contact",
      status: "fail",
      pointsGained: 0,
      pointsPossible: 4,
      title: "Valid Email Missing",
      message: "Please add a working email address where companies can send interview calls.",
      whyRecruitersCare: "Email is the #1 way companies send interview invitations and online assessment links.",
      fixHint: "Use firstname.lastname@gmail.com or similar.",
      fieldTarget: "contact.email",
    });
  } else if (isSuspiciousEmail) {
    rules.push({
      id: "contact-email",
      category: "Contact",
      status: "warn",
      pointsGained: 2,
      pointsPossible: 4,
      title: "Email Address Looks Casual",
      message: `"${email}" contains nicknames or many digits.`,
      whyRecruitersCare: "Professional emails create an immediate positive first impression with corporate recruiters.",
      fixHint: "Create a clean email like rahul.sharma@gmail.com or r.sharma.tech@gmail.com.",
      fieldTarget: "contact.email",
      exampleWeak: "coolrahul998877@gmail.com",
      exampleStrong: "rahul.sharma.dev@gmail.com",
    });
  } else {
    rules.push({
      id: "contact-email",
      category: "Contact",
      status: "pass",
      pointsGained: 4,
      pointsPossible: 4,
      title: "Professional Email Present",
      message: `Clean professional email: ${email}`,
      whyRecruitersCare: "Shows maturity and readiness for corporate correspondence.",
      fixHint: "Keep checking this inbox for interview links.",
    });
  }

  // 4. CONTACT: PHONE (Indian 10-digit)
  const cleanPhone = resume.contact.phone.replace(/\D/g, "");
  const isValidPhone = cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone);
  if (!isValidPhone) {
    rules.push({
      id: "contact-phone",
      category: "Contact",
      status: "fail",
      pointsGained: 0,
      pointsPossible: 4,
      title: "Indian Phone Number Needs Fix",
      message: "Enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.",
      whyRecruitersCare: "Recruiters and HR teams call or WhatsApp you directly to schedule first-round discussions.",
      fixHint: "Example: 9876543210 (10 digits, no country code needed here).",
      fieldTarget: "contact.phone",
    });
  } else {
    rules.push({
      id: "contact-phone",
      category: "Contact",
      status: "pass",
      pointsGained: 4,
      pointsPossible: 4,
      title: "Valid 10-Digit Mobile Number",
      message: `Mobile number is valid (+91 ${cleanPhone}).`,
      whyRecruitersCare: "Direct contact enables fast telephonic screening.",
      fixHint: "Ensure this SIM is active with incoming calls enabled.",
    });
  }

  // 5. CONTACT: LINKEDIN & GITHUB
  const hasLinkedIn = resume.contact.linkedin.toLowerCase().includes("linkedin.com");
  const hasGitHub = resume.contact.github.toLowerCase().includes("github.com") || resume.contact.portfolio.length > 5;

  if (!hasLinkedIn) {
    rules.push({
      id: "contact-linkedin",
      category: "Contact",
      status: "warn",
      pointsGained: 1,
      pointsPossible: 4,
      title: "Missing LinkedIn Profile Link",
      message: "Add your LinkedIn profile link under your contact section.",
      whyRecruitersCare: "Over 85% of tech recruiters check your LinkedIn to verify your background and network.",
      fixHint: "Include linkedin.com/in/yourname.",
      fieldTarget: "contact.linkedin",
    });
  } else {
    rules.push({
      id: "contact-linkedin",
      category: "Contact",
      status: "pass",
      pointsGained: 4,
      pointsPossible: 4,
      title: "LinkedIn Profile Linked",
      message: "Your LinkedIn profile is linked and ready for recruiters to view.",
      whyRecruitersCare: "Validates your education, projects, and professional presence.",
      fixHint: "Make sure your LinkedIn headline matches your resume target role.",
    });
  }

  if (!hasGitHub) {
    rules.push({
      id: "contact-github",
      category: "Contact",
      status: "warn",
      pointsGained: 1,
      pointsPossible: 4,
      title: "Missing GitHub or Portfolio Link",
      message: "Add your GitHub profile or live portfolio link.",
      whyRecruitersCare: "Engineering managers want to inspect your real code and git commits before inviting you for a technical round.",
      fixHint: "Include github.com/yourhandle or your deployed portfolio URL.",
      fieldTarget: "contact.github",
    });
  } else {
    rules.push({
      id: "contact-github",
      category: "Contact",
      status: "pass",
      pointsGained: 4,
      pointsPossible: 4,
      title: "GitHub / Portfolio Present",
      message: "Recruiters can immediately inspect your code repositories.",
      whyRecruitersCare: "Separates real developers from candidates who only know theory.",
      fixHint: "Pin your top 2 best repositories on your GitHub profile.",
    });
  }

  // 6. SENSITIVE INFO TO REMOVE (Private-Sector Norm)
  const detectedSensitive: string[] = [];
  SENSITIVE_INFO_PATTERNS.forEach((p) => {
    if (p.regex.test(fullText)) {
      detectedSensitive.push(p.label);
    }
  });

  if (detectedSensitive.length > 0) {
    rules.push({
      id: "privacy-sensitive-info",
      category: "Privacy",
      status: "warn",
      pointsGained: 1,
      pointsPossible: 4,
      title: "Remove Private Personal Details",
      message: `Detected: ${detectedSensitive.join(", ")}. In India's private tech sector, these are not needed.`,
      whyRecruitersCare: "Modern companies follow fair hiring and don't need personal details. They waste valuable resume space.",
      fixHint: "Remove photos, DOB, father's name, and marital status. (Note: only government or PSU jobs still request them).",
      fieldTarget: "contact.city",
      exampleWeak: "Father: Ramesh Sharma | DOB: 12/04/2002 | Single",
      exampleStrong: "Bengaluru, Karnataka | Open to relocation",
    });
  } else {
    rules.push({
      id: "privacy-sensitive-info",
      category: "Privacy",
      status: "pass",
      pointsGained: 4,
      pointsPossible: 4,
      title: "Private-Sector Ready (No Extraneous Personal Details)",
      message: "No photo, DOB, father's name or Aadhaar clutter detected.",
      whyRecruitersCare: "Follows modern standard ATS privacy practices.",
      fixHint: "Keep only professional contact details.",
    });
  }

  // 7. SUMMARY CHECKS
  const summaryWords = resume.summary.trim().split(/\s+/).filter(Boolean);
  const summaryWordCount = summaryWords.length;
  const hasFirstPersonInSummary = /\b(i|me|my|we|our)\b/i.test(resume.summary);
  const detectedCliches = CLICHES.filter((c) => new RegExp(`\\b${c}\\b`, "i").test(resume.summary));

  if (summaryWordCount === 0) {
    rules.push({
      id: "summary-presence",
      category: "Summary",
      status: "fail",
      pointsGained: 0,
      pointsPossible: 8,
      title: "Summary Section is Missing",
      message: "Add a 2 to 3-sentence summary at the top.",
      whyRecruitersCare: "A sharp summary tells the recruiter in 3 seconds who you are and what job you are targeting.",
      fixHint: "Formula: Target Role + Top 3 Skills + 1 Proof Point (e.g. Built 3 full-stack projects).",
      fieldTarget: "summary",
      exampleWeak: "I want a job in a good company where I can learn.",
      exampleStrong: "Motivated Full Stack Developer proficient in React, Node.js, and TypeScript. Built 3 production-grade applications with 100% test coverage.",
    });
  } else if (summaryWordCount < 20 || summaryWordCount > 70) {
    rules.push({
      id: "summary-length",
      category: "Summary",
      status: "warn",
      pointsGained: 3,
      pointsPossible: 8,
      title: summaryWordCount < 20 ? "Summary is Too Short" : "Summary is Too Long",
      message: `Your summary is ${summaryWordCount} words (ideal length is 30 to 60 words).`,
      whyRecruitersCare: "A long summary turns into a block of text that recruiters skip. A short one lacks proof.",
      fixHint: "Keep it to 2-3 crisp lines that mention your target role and top skills.",
      fieldTarget: "summary",
    });
  } else if (hasFirstPersonInSummary) {
    rules.push({
      id: "summary-first-person",
      category: "Summary",
      status: "warn",
      pointsGained: 4,
      pointsPossible: 8,
      title: "Avoid 'I' or 'My' in Summary",
      message: "Write in standard resume third-person style without using 'I', 'me', or 'my'.",
      whyRecruitersCare: "Standard resume convention avoids first-person pronouns for a crisp, objective tone.",
      fixHint: "Start with your role or adjective: 'Detail-oriented Frontend Developer...' instead of 'I am a frontend developer...'",
      fieldTarget: "summary",
      exampleWeak: "I am looking for a software job to apply my skills.",
      exampleStrong: "Software Engineer with hands-on proficiency in React and Python REST APIs.",
    });
  } else if (detectedCliches.length > 0) {
    rules.push({
      id: "summary-cliches",
      category: "Summary",
      status: "warn",
      pointsGained: 5,
      pointsPossible: 8,
      title: "Generic Buzzwords Detected",
      message: `Found phrases like "${detectedCliches.slice(0, 2).join('", "')}".`,
      whyRecruitersCare: "Every student writes 'hardworking' and 'team player'. Recruiters ignore these and look for real tools and projects.",
      fixHint: "Replace buzzwords with tools you actually know (e.g., Next.js, SQL, Docker).",
      fieldTarget: "summary",
    });
  } else {
    rules.push({
      id: "summary-strength",
      category: "Summary",
      status: "pass",
      pointsGained: 8,
      pointsPossible: 8,
      title: "Strong, Role-Focused Summary",
      message: `Your summary is crisp (${summaryWordCount} words) and highlights your core technical focus.`,
      whyRecruitersCare: "Gives recruiters an immediate reason to read your projects.",
      fixHint: "Ensure your summary directly targets the role you are applying for.",
    });
  }

  // 8. EDUCATION CHECKS
  if (resume.education.length === 0) {
    rules.push({
      id: "education-present",
      category: "Education",
      status: "fail",
      pointsGained: 0,
      pointsPossible: 8,
      title: "Education Section Missing",
      message: "Please add your degree, college name, and passing year.",
      whyRecruitersCare: "Campus and fresher recruiters filter candidates by graduation year, degree, and branch.",
      fixHint: "Include B.Tech/Degree name, College name, Graduation year, and CGPA or percentage.",
      fieldTarget: "education.0",
    });
  } else {
    const firstEdu = resume.education[0];
    const hasGrade = Boolean(firstEdu.grade && firstEdu.grade.trim().length > 0);
    const hasYear = Boolean(firstEdu.endYear && firstEdu.endYear.trim().length > 0);

    if (!hasYear) {
      rules.push({
        id: "education-year",
        category: "Education",
        status: "warn",
        pointsGained: 5,
        pointsPossible: 8,
        title: "Graduation Year Missing",
        message: "Add your completion or expected graduation year (e.g. 2024 or 2025).",
        whyRecruitersCare: "Recruiters must verify which hiring batch (e.g. 2024 batch) you belong to.",
        fixHint: "Enter graduation year under Education.",
        fieldTarget: "education.0.endYear",
      });
    } else {
      rules.push({
        id: "education-details",
        category: "Education",
        status: "pass",
        pointsGained: 8,
        pointsPossible: 8,
        title: "Education Properly Formatted",
        message: `${firstEdu.degree || "Degree"} at ${firstEdu.institution || "College"} (${firstEdu.endYear || "Year"}).`,
        whyRecruitersCare: "Clear academic details make batch screening fast and accurate.",
        fixHint: hasGrade ? "CGPA/grade is visible." : "Consider adding your CGPA if it is above 7.0 or 70%.",
      });
    }
  }

  // 9. SKILLS GROUPING & COUNT
  const totalSkills = resume.skills.flatMap((s) => s.items).filter(Boolean);
  const hasGrouping = resume.skills.length >= 2;

  if (totalSkills.length < 5) {
    rules.push({
      id: "skills-count",
      category: "Skills",
      status: "fail",
      pointsGained: 2,
      pointsPossible: 10,
      title: "Too Few Skills Listed",
      message: `You have only ${totalSkills.length} skills listed. Aim for 8 to 18 specific technical skills.`,
      whyRecruitersCare: "ATS filters match candidate resumes against exact skill keywords from the job description.",
      fixHint: "Add languages, frameworks, databases, and developer tools you have used.",
      fieldTarget: "skills.0",
      exampleWeak: "Skills: Coding, Computers",
      exampleStrong: "Languages: Python, JavaScript | Tools: Git, Postman, VS Code",
    });
  } else if (!hasGrouping) {
    rules.push({
      id: "skills-grouping",
      category: "Skills",
      status: "warn",
      pointsGained: 5,
      pointsPossible: 10,
      title: "Group Your Skills Into Buckets",
      message: "Group your skills into categories like Languages, Frameworks, and Tools.",
      whyRecruitersCare: "Recruiters can't read a single long list of 20 unorganized words in a 6-second scan.",
      fixHint: "Use categories: 'Languages', 'Frameworks & Libraries', 'Databases', 'Tools'.",
      fieldTarget: "skills.0.group",
    });
  } else if (totalSkills.length > 25) {
    rules.push({
      id: "skills-overflow",
      category: "Skills",
      status: "warn",
      pointsGained: 6,
      pointsPossible: 10,
      title: "Too Many Skills (Over 25)",
      message: `You listed ${totalSkills.length} skills. Don't add skills you cannot answer interview questions about.`,
      whyRecruitersCare: "Listing every technology ever invented raises suspicion in technical rounds.",
      fixHint: "Keep your top 12 to 18 strongest skills that you can comfortably code in.",
      fieldTarget: "skills.0",
    });
  } else {
    rules.push({
      id: "skills-solid",
      category: "Skills",
      status: "pass",
      pointsGained: 10,
      pointsPossible: 10,
      title: "Skills Well Grouped and Scaled",
      message: `${totalSkills.length} skills organized across ${resume.skills.length} categories.`,
      whyRecruitersCare: "ATS parsers index categorized skills with high confidence.",
      fixHint: "Ensure every skill listed is backed up in your project bullets.",
    });
  }

  // 10. PROJECTS: PRESENCE & DETAILS
  if (resume.projects.length === 0) {
    rules.push({
      id: "projects-count",
      category: "Projects",
      status: "fail",
      pointsGained: 0,
      pointsPossible: 12,
      title: "Projects Section is Empty",
      message: "Add at least 2 hands-on technical or capstone projects.",
      whyRecruitersCare: "For students and freshers, projects are your #1 proof of practical coding ability.",
      fixHint: "Click '+ Add Project' and include the project name, tech stack, and 2-3 bullet points.",
      fieldTarget: "projects.0",
    });
  } else {
    const projectsWithTech = resume.projects.filter((p) => p.techStack && p.techStack.trim().length > 0);
    const projectsWithBullets = resume.projects.filter((p) => p.bullets && p.bullets.length >= 2);

    if (projectsWithTech.length < resume.projects.length) {
      rules.push({
        id: "projects-tech-stack",
        category: "Projects",
        status: "warn",
        pointsGained: 6,
        pointsPossible: 12,
        title: "Specify Tech Stack for Each Project",
        message: "Add the exact tools used (e.g. React, Node.js, SQLite) next to each project title.",
        whyRecruitersCare: "Recruiters need to know immediately whether you built it in HTML or a modern tech stack.",
        fixHint: "Fill in the 'Tech Stack' box for each project.",
        fieldTarget: "projects.0.techStack",
      });
    } else if (projectsWithBullets.length < resume.projects.length) {
      rules.push({
        id: "projects-bullets",
        category: "Projects",
        status: "warn",
        pointsGained: 8,
        pointsPossible: 12,
        title: "Add 2 to 3 Bullets Per Project",
        message: "Each project needs at least 2 descriptive bullet points explaining what you built and the outcome.",
        whyRecruitersCare: "One-line project descriptions leave hiring managers guessing what your contribution was.",
        fixHint: "Write 2-3 bullets per project detailing features, architecture, and results.",
        fieldTarget: "projects.0",
      });
    } else {
      rules.push({
        id: "projects-solid",
        category: "Projects",
        status: "pass",
        pointsGained: 12,
        pointsPossible: 12,
        title: "Strong Project Showcase",
        message: `${resume.projects.length} projects detailed with tech stacks and structured bullets.`,
        whyRecruitersCare: "Demonstrates practical engineering capability beyond textbook theory.",
        fixHint: "Add live demo links (e.g. Vercel/Netlify) if available.",
      });
    }
  }

  // 11. BULLET POINTS CHECKS (Action verbs, metrics, weak openers, length)
  if (allBullets.length === 0) {
    rules.push({
      id: "bullets-presence",
      category: "Experience",
      status: "fail",
      pointsGained: 0,
      pointsPossible: 20,
      title: "No Bullet Points Found",
      message: "Add bullet points to your projects or work experience to describe what you did.",
      whyRecruitersCare: "Recruiters cannot evaluate your impact without bullet points.",
      fixHint: "Add bullets under projects or internships.",
      fieldTarget: "projects.0.bullets.0",
    });
  } else {
    let weakOpenerCount = 0;
    let actionVerbCount = 0;
    let metricsCount = 0;
    let longBulletCount = 0;
    const openingVerbs: string[] = [];

    allBullets.forEach((b) => {
      const text = b.text.trim();
      const words = text.split(/\s+/).filter(Boolean);
      const firstWord = (words[0] || "").toLowerCase().replace(/[^a-z]/g, "");

      openingVerbs.push(firstWord);

      // Check weak openers
      if (WEAK_OPENERS.some((wo) => text.toLowerCase().startsWith(wo))) {
        weakOpenerCount++;
      }

      // Check action verbs
      if (ACTION_VERBS.has(firstWord)) {
        actionVerbCount++;
      }

      // Check metrics (numbers, percentages, metrics)
      if (/\d+%|\b\d+\b|\b(hundred|thousand|million|k)\b/i.test(text)) {
        metricsCount++;
      }

      // Check length
      if (words.length > 25) {
        longBulletCount++;
      }
    });

    const metricPercentage = Math.round((metricsCount / allBullets.length) * 100);
    const actionVerbPercentage = Math.round((actionVerbCount / allBullets.length) * 100);

    // Rule 11a: Action verbs vs weak openers
    if (weakOpenerCount > 0) {
      rules.push({
        id: "bullets-weak-openers",
        category: "Experience",
        status: "fail",
        pointsGained: 3,
        pointsPossible: 10,
        title: "Avoid Passive Phrases Like 'Responsible For'",
        message: `${weakOpenerCount} bullet(s) start with passive phrases like 'Responsible for' or 'Worked on'.`,
        whyRecruitersCare: "Passive phrases sound like job descriptions, not personal achievements.",
        fixHint: "Replace with strong past-tense action verbs: Engineered, Developed, Built, Automated, Designed.",
        fieldTarget: allBullets[0]?.path,
        exampleWeak: "Responsible for fixing bugs and developing web pages.",
        exampleStrong: "Engineered 12 React components and resolved 25+ sprint bugs with zero regressions.",
      });
    } else if (actionVerbPercentage < 60) {
      rules.push({
        id: "bullets-action-verbs",
        category: "Experience",
        status: "warn",
        pointsGained: 6,
        pointsPossible: 10,
        title: "Start More Bullets With Action Verbs",
        message: `Only ${actionVerbPercentage}% of bullets start with a recognized action verb.`,
        whyRecruitersCare: "Action verbs make your contributions sound confident and proactive.",
        fixHint: "Start every single bullet with words like Architected, Optimized, Streamlined, Deployed.",
        fieldTarget: allBullets[0]?.path,
      });
    } else {
      rules.push({
        id: "bullets-action-verbs",
        category: "Experience",
        status: "pass",
        pointsGained: 10,
        pointsPossible: 10,
        title: "Excellent Action-Verb Openers",
        message: `${actionVerbPercentage}% of your bullets start with powerful action verbs.`,
        whyRecruitersCare: "Shows initiative, ownership, and clear technical contribution.",
        fixHint: "Keep every new bullet point aligned with this standard.",
      });
    }

    // Rule 11b: Measurable Impact & Metrics
    if (metricPercentage < 30) {
      rules.push({
        id: "bullets-metrics",
        category: "Experience",
        status: "warn",
        pointsGained: 3,
        pointsPossible: 10,
        title: "Add Numbers & Measurable Results",
        message: `Only ${metricPercentage}% of your bullets include numbers or metrics (aim for at least 50%).`,
        whyRecruitersCare: "Numbers prove how well you did the work. 'Made it faster' is vague; 'Cut load time by 30%' is proof.",
        fixHint: "Add realistic metrics: % speedup, count of users, test cases written, API endpoints created, or hours saved.",
        fieldTarget: allBullets[0]?.path,
        exampleWeak: "Built backend APIs for the mobile app.",
        exampleStrong: "Architected 8 REST API endpoints in Node.js, reducing query response times by 35% for 400+ users.",
      });
    } else {
      rules.push({
        id: "bullets-metrics",
        category: "Experience",
        status: "pass",
        pointsGained: 10,
        pointsPossible: 10,
        title: "Great Measurable Impact",
        message: `${metricPercentage}% of your bullets feature quantifiable metrics and outcomes.`,
        whyRecruitersCare: "Proves you understand real business and technical impact.",
        fixHint: "Ensure you can explain how you measured these numbers in an interview.",
      });
    }

    // Rule 11c: Bullet Length
    if (longBulletCount > 0) {
      rules.push({
        id: "bullets-length",
        category: "Formatting",
        status: "warn",
        pointsGained: 4,
        pointsPossible: 6,
        title: "Shorten Long Bullet Points",
        message: `${longBulletCount} bullet(s) exceed 25 words. Long bullets turn into walls of text.`,
        whyRecruitersCare: "Recruiters skim bullet points in 2-3 seconds each. Bullets over 2 lines rarely get read.",
        fixHint: "Split long sentences or trim filler words like 'in order to' and 'which was responsible for'.",
        fieldTarget: allBullets[0]?.path,
      });
    } else {
      rules.push({
        id: "bullets-length",
        category: "Formatting",
        status: "pass",
        pointsGained: 6,
        pointsPossible: 6,
        title: "Crisp, Skimmable Bullet Length",
        message: "All bullet points are under 25 words.",
        whyRecruitersCare: "Optimized for fast 6-second recruiter scanning.",
        fixHint: "Keep each bullet focused on a single key takeaway.",
      });
    }
  }

  // 12. SECTION ORDERING CHECK
  const expectedOrderFresher = ["summary", "education", "skills", "projects", "experience", "certifications", "achievements"];
  const currentOrder = resume.sectionOrder || [];
  const eduIndex = currentOrder.indexOf("education");
  const expIndex = currentOrder.indexOf("experience");

  // For a fresher with no experience, education should come before experience
  const hasWorkExp = resume.experience.length > 0 && resume.experience.some((e) => e.role.trim().length > 0);
  if (!hasWorkExp && expIndex !== -1 && eduIndex !== -1 && expIndex < eduIndex) {
    rules.push({
      id: "section-order",
      category: "Formatting",
      status: "warn",
      pointsGained: 1,
      pointsPossible: 4,
      title: "Place Education Above Experience for Freshers",
      message: "As a student or fresher, your Education and Projects should appear before empty work experience.",
      whyRecruitersCare: "Highlights your strongest qualifications first.",
      fixHint: "Reorder sections so Education and Projects are highlighted at the top.",
      fieldTarget: "education",
    });
  } else {
    rules.push({
      id: "section-order",
      category: "Formatting",
      status: "pass",
      pointsGained: 4,
      pointsPossible: 4,
      title: "Logical Section Hierarchy",
      message: "Sections follow recruiter-approved chronological flow.",
      whyRecruitersCare: "Allows standard ATS parsers to detect headings sequentially.",
      fixHint: "Keep headings standard (Education, Skills, Projects, Experience).",
    });
  }

  // Calculate totals
  let totalScore = 0;
  let potentialScore = 0;
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  rules.forEach((r) => {
    totalScore += r.pointsGained;
    potentialScore += r.pointsPossible;
    if (r.status === "pass") passCount++;
    if (r.status === "warn") warnCount++;
    if (r.status === "fail") failCount++;
  });

  // Normalize to 100 max
  const normalizedScore = potentialScore > 0 ? Math.round((totalScore / potentialScore) * 100) : 70;
  const pointsToGain = Math.max(0, 100 - normalizedScore);

  return {
    rules,
    totalScore: normalizedScore,
    potentialScore: 100,
    pointsToGain,
    passCount,
    warnCount,
    failCount,
    unfilledPlaceholders,
  };
}

export function evaluateBulletPoint(bullet: string): {
  startsWithActionVerb: boolean;
  hasMetric: boolean;
  wordCount: number;
  isTooLong: boolean;
  hasWeakOpener: boolean;
  feedbackChips: { label: string; type: "good" | "warn" | "tip" }[];
} {
  const text = bullet.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const firstWord = (words[0] || "").toLowerCase().replace(/[^a-z]/g, "");

  const startsWithActionVerb = ACTION_VERBS.has(firstWord);
  const hasMetric = /\d+%|\b\d+\b|\b(hundred|thousand|million|k)\b/i.test(text);
  const wordCount = words.length;
  const isTooLong = wordCount > 25;
  const hasWeakOpener = WEAK_OPENERS.some((wo) => text.toLowerCase().startsWith(wo));

  const feedbackChips: { label: string; type: "good" | "warn" | "tip" }[] = [];

  if (hasWeakOpener) {
    feedbackChips.push({ label: "Avoid 'Responsible for' / 'Worked on'", type: "warn" });
  } else if (startsWithActionVerb) {
    feedbackChips.push({ label: "Starts with action verb ✓", type: "good" });
  } else if (text.length > 0) {
    feedbackChips.push({ label: "Start with action verb (e.g. Built, Optimized)", type: "tip" });
  }

  if (hasMetric) {
    feedbackChips.push({ label: "Includes metric / result ✓", type: "good" });
  } else if (text.length > 0) {
    feedbackChips.push({ label: "Add numbers or result (e.g. 30%, 500+ users)", type: "tip" });
  }

  if (isTooLong) {
    feedbackChips.push({ label: `Too long: ${wordCount} words (aim for <25)`, type: "warn" });
  } else if (wordCount >= 10 && wordCount <= 25) {
    feedbackChips.push({ label: `${wordCount} words (ideal length) ✓`, type: "good" });
  }

  return {
    startsWithActionVerb,
    hasMetric,
    wordCount,
    isTooLong,
    hasWeakOpener,
    feedbackChips,
  };
}
