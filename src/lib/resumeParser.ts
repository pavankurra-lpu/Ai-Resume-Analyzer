import Anthropic from "@anthropic-ai/sdk";
import { StructuredResume, StructuredResumeSchema } from "./resumeTypes";

const PARSER_SYSTEM_PROMPT =
  "Convert the resume text into the given JSON structure. Do not add, infer or improve anything. Leave missing fields empty. Return only valid JSON.";

export function parseResumeHeuristic(text: string): StructuredResume {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Contact Extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+91[\-\s]?)?[6-9]\d{9}/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  // Extract portfolio / personal link (exclude linkedin, github)
  let portfolio = "";
  const allUrls = text.match(/(?:https?:\/\/|www\.)[a-zA-Z0-9_\-.]+(?:\/[^\s]*)?/gi) || [];
  for (const u of allUrls) {
    if (!u.includes("linkedin.com") && !u.includes("github.com")) {
      portfolio = u;
      break;
    }
  }

  // Extract candidate name: typically first non-empty line without emails/urls/digits
  let fullName = "";
  for (const line of lines.slice(0, 5)) {
    if (
      !line.includes("@") &&
      !line.includes("http") &&
      !line.includes(".com") &&
      !/\d/.test(line) &&
      line.length > 2 &&
      line.length < 40
    ) {
      fullName = line.replace(/^(name|resume|curriculum vitae)[:\s]*/i, "").trim();
      break;
    }
  }

  // Extract city
  const cityMatch = text.match(/\b(bengaluru|bangalore|hyderabad|pune|mumbai|delhi|noida|chennai|gurugram|gurgaon|kolkata|ahmedabad|kochi|jaipur|lucknow|chandigarh)\b/i);
  const city = cityMatch ? cityMatch[0] : "";

  // 2. Identify Sections
  const sectionHeaders: { type: string; lineIndex: number }[] = [];
  const headerPatterns = [
    { type: "summary", regex: /^(professional summary|summary|career objective|objective|about me)\b/i },
    { type: "education", regex: /^(education|academic background|academics|qualifications)\b/i },
    { type: "skills", regex: /^(skills|technical skills|technical competencies|core competencies|technologies)\b/i },
    { type: "projects", regex: /^(projects|academic projects|key projects|personal projects)\b/i },
    { type: "experience", regex: /^(work experience|experience|employment history|internships|professional experience)\b/i },
    { type: "certifications", regex: /^(certifications|licenses|certifications & courses|courses)\b/i },
    { type: "achievements", regex: /^(achievements|honors|awards|key achievements|extracurricular)\b/i },
  ];

  lines.forEach((line, idx) => {
    for (const hp of headerPatterns) {
      if (hp.regex.test(line) && line.length < 45) {
        sectionHeaders.push({ type: hp.type, lineIndex: idx });
        break;
      }
    }
  });

  // Helper to get text slice for a section
  function getSectionLines(type: string): string[] {
    const headerIdx = sectionHeaders.findIndex((h) => h.type === type);
    if (headerIdx === -1) return [];
    const start = sectionHeaders[headerIdx].lineIndex + 1;
    const end = headerIdx + 1 < sectionHeaders.length ? sectionHeaders[headerIdx + 1].lineIndex : lines.length;
    return lines.slice(start, end);
  }

  // 3. Parse Summary
  const summaryLines = getSectionLines("summary");
  const summary = summaryLines.join(" ").slice(0, 500);

  // 4. Parse Education
  const educationLines = getSectionLines("education");
  const education: StructuredResume["education"] = [];
  if (educationLines.length > 0) {
    const degreeMatch = educationLines.join(" ").match(/(b\.?tech|b\.?e|m\.?tech|m\.?s|bca|mca|b\.?sc|m\.?sc|diploma)[^,\n]*/i);
    const yearMatch = educationLines.join(" ").match(/\b(20\d\d)\b/);
    const gradeMatch = educationLines.join(" ").match(/\b(?:\d\.\d{1,2}(?:\s*\/\s*10)?|\d{2}(?:\.\d+)?%)\b/);

    education.push({
      id: "edu_1",
      degree: degreeMatch ? degreeMatch[0].trim() : (educationLines[0] || "Bachelor's Degree"),
      institution: educationLines.length > 1 ? educationLines[1] : (educationLines[0] || "University / College"),
      startYear: yearMatch ? String(Number(yearMatch[1]) - 4) : "",
      endYear: yearMatch ? yearMatch[1] : "",
      grade: gradeMatch ? gradeMatch[0] : "",
    });
  }

  // 5. Parse Skills
  const skillsLines = getSectionLines("skills");
  const skills: StructuredResume["skills"] = [];
  if (skillsLines.length > 0) {
    const skillsText = skillsLines.join(" ");
    const languages: string[] = [];
    const frameworks: string[] = [];
    const tools: string[] = [];

    const knownLangs = ["javascript", "typescript", "python", "java", "c++", "c", "c#", "sql", "html", "css", "go", "rust", "php", "ruby"];
    const knownFrameworks = ["react", "next.js", "node.js", "express", "django", "fastapi", "spring boot", "tailwind css", "vue", "angular", "flask"];
    const knownTools = ["git", "docker", "postman", "mongodb", "postgresql", "mysql", "redis", "aws", "linux", "jira", "figma"];

    const tokens = skillsText.toLowerCase().split(/[,|•\n/]+/).map((s) => s.trim()).filter(Boolean);

    tokens.forEach((t) => {
      if (knownLangs.includes(t)) languages.push(t.charAt(0).toUpperCase() + t.slice(1));
      else if (knownFrameworks.includes(t)) frameworks.push(t.charAt(0).toUpperCase() + t.slice(1));
      else if (knownTools.includes(t)) tools.push(t.charAt(0).toUpperCase() + t.slice(1));
    });

    if (languages.length > 0) {
      skills.push({ id: "sk_1", group: "Languages", items: languages });
    }
    if (frameworks.length > 0) {
      skills.push({ id: `sk_${skills.length + 1}`, group: "Frameworks & Libraries", items: frameworks });
    }
    if (tools.length > 0) {
      skills.push({ id: `sk_${skills.length + 1}`, group: "Tools & Databases", items: tools });
    }

    const categorized = [...languages, ...frameworks, ...tools].map((k) => k.toLowerCase());
    const uncategorized = tokens.filter((t) => !categorized.includes(t));
    if (uncategorized.length > 0 && skills.length === 0) {
      skills.push({
        id: "sk_1",
        group: "Technical Skills",
        items: uncategorized.map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
      });
    }
  }

  // 6. Parse Projects
  const projectLines = getSectionLines("projects");
  const projects: StructuredResume["projects"] = [];
  if (projectLines.length > 0) {
    let currentProj: StructuredResume["projects"][0] | null = null;
    projectLines.forEach((l) => {
      // Check if line is a bullet with an embedded project name (e.g. "- Portfolio App: Worked on...")
      const bulletWithColon = l.match(/^[-•*–—]\s*([^:]{3,40}):\s*(.*)$/);
      if (bulletWithColon) {
        if (currentProj) projects.push(currentProj);
        currentProj = {
          id: `proj_${projects.length + 1}`,
          name: bulletWithColon[1].trim(),
          techStack: "",
          link: "",
          bullets: bulletWithColon[2].trim() ? [bulletWithColon[2].trim()] : [],
        };
        return;
      }

      const isBullet = /^[-•*–—]\s*/.test(l);
      if (!isBullet && l.length < 65 && !currentProj) {
        currentProj = {
          id: `proj_${projects.length + 1}`,
          name: l.replace(/[:|].*$/, "").trim(),
          techStack: l.includes("|") ? l.split("|")[1].trim() : "",
          link: "",
          bullets: [],
        };
      } else if (isBullet && currentProj) {
        currentProj.bullets.push(l.replace(/^[-•*–—]\s*/, ""));
      } else if (!isBullet && l.length < 65 && currentProj && currentProj.bullets.length > 0) {
        projects.push(currentProj);
        currentProj = {
          id: `proj_${projects.length + 1}`,
          name: l.replace(/[:|].*$/, "").trim(),
          techStack: l.includes("|") ? l.split("|")[1].trim() : "",
          link: "",
          bullets: [],
        };
      } else if (currentProj) {
        currentProj.bullets.push(l.replace(/^[-•*–—]\s*/, ""));
      } else {
        // Fallback: standalone line under projects
        currentProj = {
          id: `proj_${projects.length + 1}`,
          name: l.replace(/^[-•*–—]\s*/, "").replace(/[:|].*$/, "").trim(),
          techStack: "",
          link: "",
          bullets: [],
        };
      }
    });
    if (currentProj) projects.push(currentProj);
  }

  // 7. Parse Experience
  const expLines = getSectionLines("experience");
  const experience: StructuredResume["experience"] = [];
  if (expLines.length > 0) {
    let currentExp: StructuredResume["experience"][0] | null = null;
    expLines.forEach((l) => {
      const isBullet = /^[-•*–—]\s*/.test(l);
      if (!isBullet && l.length < 65 && !currentExp) {
        currentExp = {
          id: `exp_${experience.length + 1}`,
          role: l.split("|")[0].trim() || "Software Engineer Intern",
          company: l.split("|")[1]?.trim() || "Company",
          location: city || "India",
          startDate: "Jan 2024",
          endDate: "Jun 2024",
          current: false,
          bullets: [],
        };
      } else if (isBullet && currentExp) {
        currentExp.bullets.push(l.replace(/^[-•*–—]\s*/, ""));
      } else if (currentExp) {
        currentExp.bullets.push(l.replace(/^[-•*–—]\s*/, ""));
      }
    });
    if (currentExp) experience.push(currentExp);
  }

  // 8. Parse Certifications & Achievements
  const certLines = getSectionLines("certifications");
  const certifications = certLines.slice(0, 3).map((c, i) => ({
    id: `cert_${i + 1}`,
    name: c.replace(/^[-•*–—]\s*/, ""),
    issuer: "Organization",
    year: "2024",
  }));

  const achLines = getSectionLines("achievements");
  const achievements = achLines.slice(0, 4).map((a) => a.replace(/^[-•*–—]\s*/, ""));

  return StructuredResumeSchema.parse({
    contact: {
      fullName: fullName || "Candidate Name",
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0].replace(/\D/g, "").slice(-10) : "",
      city: city ? `${city.charAt(0).toUpperCase() + city.slice(1)}, India` : "",
      linkedin: linkedinMatch ? linkedinMatch[0] : "",
      github: githubMatch ? githubMatch[0] : "",
      portfolio: portfolio || "",
    },
    headline: fullName ? "Software Engineer" : "",
    summary: summary || "",
    education,
    skills,
    projects,
    experience,
    certifications,
    achievements,
    sectionOrder: [
      "summary",
      "education",
      "skills",
      "projects",
      "experience",
      "certifications",
      "achievements",
    ],
  });
}

export async function parseResumeWithAI(
  text: string
): Promise<{ resume: StructuredResume; isDemo: boolean }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    return {
      resume: parseResumeHeuristic(text),
      isDemo: true,
    };
  }

  const model = process.env.AI_MODEL || "claude-3-7-sonnet-20250219";
  const anthropic = new Anthropic({ apiKey });

  const prompt = `
Resume text:
"""
${text.slice(0, 15000)}
"""

Extract and structure into JSON strictly matching this schema:
{
  "contact": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "city": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "headline": "string",
  "summary": "string",
  "education": [
    {
      "id": "string",
      "degree": "string",
      "institution": "string",
      "startYear": "string",
      "endYear": "string",
      "grade": "string"
    }
  ],
  "skills": [
    {
      "id": "string",
      "group": "string",
      "items": ["string"]
    }
  ],
  "projects": [
    {
      "id": "string",
      "name": "string",
      "techStack": "string",
      "link": "string",
      "bullets": ["string"]
    }
  ],
  "experience": [
    {
      "id": "string",
      "role": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "bullets": ["string"]
    }
  ],
  "certifications": [
    {
      "id": "string",
      "name": "string",
      "issuer": "string",
      "year": "string"
    }
  ],
  "achievements": ["string"],
  "sectionOrder": ["string"]
}
`;

  try {
    const res = await anthropic.messages.create({
      model,
      max_tokens: 3500,
      system: PARSER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const block = res.content[0];
    if (block.type === "text") {
      let t = block.text.trim();
      if (t.startsWith("```json")) t = t.replace(/^```json/, "").replace(/```$/, "").trim();
      else if (t.startsWith("```")) t = t.replace(/^```/, "").replace(/```$/, "").trim();

      const parsed = JSON.parse(t);
      const validated = StructuredResumeSchema.parse(parsed);
      return { resume: validated, isDemo: false };
    }
    throw new Error("No text content returned");
  } catch (err) {
    console.warn("AI resume parsing failed, using heuristic fallback parser:", err);
    return {
      resume: parseResumeHeuristic(text),
      isDemo: true,
    };
  }
}
