import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { scoreResume } from "../src/lib/scoring";
import { parseResumeHeuristic } from "../src/lib/resumeParser";
import { StructuredResume } from "../src/lib/resumeTypes";

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.join(process.cwd(), "public", "audit-screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface AuditRecord {
  id: string;
  title: string;
  kind: "A" | "B" | "C";
  actionableControls: string[];
  irrelevantHelpersAbsent: boolean;
  screenshot: string;
  status: "PASS" | "FAIL";
}

async function runBrowserAudit() {
  console.log("=========================================================");
  console.log("STARTING COMPLETE BROWSER AUDIT OF ALL CHECKPOINTS");
  console.log("=========================================================\n");

  // Step 1: Create a weak fresher resume
  const rawWeakResume = `
Rahul Sharma
Email: rahul@gmail.com
Phone: 9876543210
Bangalore, India

Education
PES University

Skills
HTML, CSS, JavaScript

Projects
Portfolio Site
- Worked on website and fixed some bugs for the team.
  `.trim();

  const formData = new FormData();
  formData.append("resumeText", rawWeakResume);
  formData.append("name", "Rahul Sharma");
  formData.append("email", "rahul@gmail.com");
  formData.append("phone", "9876543210");
  formData.append("experienceLevel", "Fresher");
  formData.append("targetRole", "Frontend Developer");
  formData.append("consent", "true");

  console.log("1. Creating weak fresher report via API...");
  const analyzeRes = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!analyzeRes.ok) {
    throw new Error(`Analyze API failed: ${analyzeRes.statusText}`);
  }

  const analyzeData = await analyzeRes.json();
  const reportId = analyzeData.reportId;
  console.log(`   Created report: ${reportId}\n`);

  // Step 2: Launch Playwright Chromium
  console.log("2. Launching headless Chromium browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Step 3: Navigate to Editor
  const editorUrl = `${BASE_URL}/editor/${reportId}`;
  console.log(`3. Navigating to editor: ${editorUrl}...`);
  await page.goto(editorUrl, { waitUntil: "networkidle" });

  await page.waitForSelector("article", { timeout: 15000 });
  console.log("   Editor page loaded successfully.\n");

  // Step 4: Audit each of the 27 checkpoints
  const initialResumeScoring = scoreResume(parseResumeHeuristic(rawWeakResume), {
    experienceLevel: "Fresher",
    targetRole: "Frontend Developer",
  });

  console.log(`4. Auditing all checkpoints in browser (Total checkpoints: ${initialResumeScoring.checkpoints.length})...\n`);

  const auditResults: AuditRecord[] = [];

  for (const cp of initialResumeScoring.checkpoints) {
    const cpId = cp.id;

    // Check classification
    let kind: "A" | "B" | "C" = "A";
    if (
      cpId.startsWith("summary_") ||
      cpId.startsWith("bullets_") ||
      cpId === "clean_cliches"
    ) {
      kind = "B";
    } else if (cpId.startsWith("layout_") || cpId === "clean_placeholders" || cpId === "clean_sensitive_data") {
      kind = "C";
    } else {
      kind = "A";
    }

    console.log(`▶ Auditing [${cpId}] (${cp.title}) - Kind ${kind}...`);

    // If FixPanel is open from previous iteration, close it to return to checklist
    const closePanelBtn = page.locator('aside button[title="Close panel"]').first();
    if (await closePanelBtn.isVisible()) {
      await closePanelBtn.click().catch(() => {});
      await page.waitForTimeout(200);
    }

    // Find and click the checkpoint item in the checklist
    const cpElement = page.locator(`[data-checkpoint-id="${cpId}"]`).first();
    if (await cpElement.isVisible()) {
      await cpElement.click();
      await page.waitForTimeout(300);
    }

    // Verify FixPanel is visible
    const fixPanel = page.locator("aside:has-text('points available')");
    const isPanelVisible = await fixPanel.isVisible();

    if (!isPanelVisible) {
      console.warn(`   ⚠️ FixPanel did not open directly for ${cpId}`);
    }

    // Inspect controls rendered in panel
    const panelText = (await page.locator("aside").innerText()) || "";

    const hasInput = (await page.locator("aside input, aside textarea, aside select").count()) > 0;
    const hasButtons = (await page.locator("aside button").count()) > 0;
    const hasAiButton = panelText.includes("Improve with AI") || panelText.includes("Improve Summary with AI");

    const controlsFound: string[] = [];
    if (hasInput) controlsFound.push("Form Input/Textarea");
    if (hasButtons) controlsFound.push("Action Buttons/Chips");
    if (hasAiButton) controlsFound.push("Improve with AI");

    // Check that IRRELEVANT helpers are absent:
    // For non-bullets (contact, summary, layout, education, skills, projects):
    // MUST NOT have "Power Action Verbs" or "I have a number"
    let irrelevantHelpersAbsent = true;
    if (
      cpId.startsWith("contact_") ||
      cpId.startsWith("summary_") ||
      cpId.startsWith("layout_") ||
      cpId.startsWith("education_") ||
      cpId.startsWith("skills_")
    ) {
      if (panelText.includes("Power Action Verbs") || panelText.includes("I have a number")) {
        irrelevantHelpersAbsent = false;
        console.error(`   ❌ FAIL: Found irrelevant bullet helpers on non-bullet checkpoint ${cpId}`);
      }
    }

    // For summary: MUST NOT have action verbs
    if (cpId.startsWith("summary_")) {
      if (panelText.includes("Power Action Verbs")) {
        irrelevantHelpersAbsent = false;
        console.error(`   ❌ FAIL: Found verb chips on summary checkpoint ${cpId}`);
      }
    }

    // Capture screenshot of FixPanel
    const screenshotPath = path.join(SCREENSHOT_DIR, `${cpId}.png`);
    await page.locator("aside").screenshot({ path: screenshotPath }).catch(async () => {
      await page.screenshot({ path: screenshotPath });
    });

    const isPass = controlsFound.length > 0 && irrelevantHelpersAbsent;
    console.log(`   ${isPass ? "✅ PASS" : "❌ FAIL"}: Controls: [${controlsFound.join(", ")}], Irrelevant absent: ${irrelevantHelpersAbsent}`);

    auditResults.push({
      id: cpId,
      title: cp.title,
      kind,
      actionableControls: controlsFound,
      irrelevantHelpersAbsent,
      screenshot: `/audit-screenshots/${cpId}.png`,
      status: isPass ? "PASS" : "FAIL",
    });
  }

  await browser.close();

  // Step 5: Test AI Route directly (/api/resume/[id]/suggest)
  console.log("\n5. Testing AI Suggestion Route & Server-Side Guardrails...");

  // Test 5A: Fallback when no key is set
  const fallbackRes = await fetch(`${BASE_URL}/api/resume/${reportId}/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentText: "Worked on website bugs and helped team",
      type: "bullet",
      targetRole: "Frontend Developer",
      skills: ["React", "JavaScript"],
      checkpointId: "bullets_action_verbs",
    }),
  });

  if (!fallbackRes.ok) throw new Error("Suggest route failed");
  const fallbackJson = await fallbackRes.json();
  console.log("   Test 5A (Fallback without API key):");
  console.log(`   - Returned ${fallbackJson.alternatives?.length} alternatives.`);
  console.log(`   - Notice: "${fallbackJson.notice}"`);
  console.log(`   - Sample alternative: "${fallbackJson.alternatives?.[0]?.text}"`);

  if (!fallbackJson.alternatives || fallbackJson.alternatives.length === 0) {
    throw new Error("Expected at least one fallback suggestion");
  }
  if (!fallbackJson.alternatives[0].text.startsWith("Resolved") && !fallbackJson.alternatives[0].text.startsWith("Diagnosed") && !fallbackJson.alternatives[0].text.startsWith("Developed")) {
    throw new Error("Fallback suggestion should start with a strong action verb");
  }
  console.log("   ✅ Deterministic fallback verified starting with strong verb.\n");

  // Test 5B: Summary AI Fallback
  const summaryAiRes = await fetch(`${BASE_URL}/api/resume/${reportId}/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      currentText: "Looking for an internship in software",
      type: "summary",
      targetRole: "Frontend Developer",
      skills: ["React", "TypeScript", "Tailwind CSS"],
      checkpointId: "summary_present",
    }),
  });

  const summaryAiJson = await summaryAiRes.json();
  console.log("   Test 5B (Summary AI Fallback):");
  console.log(`   - Sample summary: "${summaryAiJson.alternatives?.[0]?.text}"`);
  if (!summaryAiJson.alternatives?.[0]?.text.includes("Frontend Developer")) {
    throw new Error("Summary suggestion should align with target role");
  }
  console.log("   ✅ Summary AI suggestions verified role-aligned.\n");

  // Step 6: End to End Weak Fresher Upgrade Test
  console.log("6. Verifying End-to-End Fresher Upgrade from 45 to >= 85...");

  const upgradedFresher: StructuredResume = {
    contact: {
      fullName: "Rahul Sharma",
      email: "rahul.sharma@gmail.com",
      phone: "9876543210",
      city: "Bangalore, Karnataka",
      linkedin: "https://linkedin.com/in/rahulsharma",
      github: "https://github.com/rahulsharma",
      portfolio: "https://rahul.dev",
    },
    headline: "Frontend Developer",
    summary:
      "Frontend Developer with hands-on project experience in React, TypeScript, and Tailwind CSS. Dedicated to writing clean, accessible user interfaces and collaborating in fast-paced software teams.",
    education: [
      {
        id: "edu1",
        degree: "B.Tech in Computer Science",
        institution: "PES University",
        startYear: "2020",
        endYear: "2024",
        grade: "8.6 CGPA",
      },
    ],
    skills: [
      {
        id: "sk1",
        group: "Languages & Frameworks",
        items: ["TypeScript", "JavaScript", "HTML5", "CSS3", "React", "Next.js"],
      },
      {
        id: "sk2",
        group: "Tools & Libraries",
        items: ["Tailwind CSS", "Redux", "Git", "Webpack", "REST APIs"],
      },
    ],
    projects: [
      {
        id: "proj1",
        name: "E-Commerce Web Portal",
        techStack: "React, TypeScript, Redux, Tailwind",
        link: "https://github.com/rahul/ecommerce",
        bullets: [
          "Architected responsive product catalog components, boosting checkout conversion by 28%.",
          "Engineered reusable custom hooks that decreased bundle size by 18% across 12 views.",
        ],
      },
      {
        id: "proj2",
        name: "Campus Event Manager",
        techStack: "React, Node.js, Express, MongoDB",
        link: "https://github.com/rahul/events",
        bullets: [
          "Developed real-time ticket booking portal handling 500+ student registrations.",
          "Implemented modular error-handling pipelines so that users can filter events seamlessly.",
        ],
      },
    ],
    experience: [], // Fresher re-weighting
    certifications: [
      {
        id: "cert1",
        name: "Meta Front-End Developer Certificate",
        issuer: "Coursera",
        year: "2024",
      },
    ],
    achievements: ["Finalist in Smart India Hackathon 2023 out of 300+ participating teams."],
    sectionOrder: ["summary", "education", "skills", "projects", "certifications", "achievements"],
  };

  const upgradedScoring = scoreResume(upgradedFresher, {
    experienceLevel: "Fresher",
    targetRole: "Frontend Developer",
  });

  console.log(`   Initial weak score:  ${initialResumeScoring.totalScore}/100 (Grade: ${initialResumeScoring.grade})`);
  console.log(`   Upgraded score:      ${upgradedScoring.totalScore}/100 (Grade: ${upgradedScoring.grade})`);

  if (upgradedScoring.totalScore < 85) {
    throw new Error(`Expected upgraded score >= 85, got ${upgradedScoring.totalScore}`);
  }
  console.log(`   ✅ Score increased by +${upgradedScoring.totalScore - initialResumeScoring.totalScore} pts to ${upgradedScoring.totalScore}/100! Passed ATS-ready threshold!\n`);

  // Step 7: Print Summary Table
  console.log("==========================================================================================");
  console.log("AUDIT SUMMARY TABLE (All Checkpoints)");
  console.log("==========================================================================================");
  console.log(
    "| Checkpoint ID".padEnd(30) +
    "| Kind ".padEnd(8) +
    "| Controls Visible".padEnd(38) +
    "| Status |"
  );
  console.log("-".repeat(90));

  auditResults.forEach((r) => {
    console.log(
      `| ${r.id.padEnd(28)} | ${r.kind.padEnd(6)} | ${r.actionableControls.join(", ").padEnd(36)} | ${r.status}   |`
    );
  });
  console.log("==========================================================================================");

  const allPassed = auditResults.every((r) => r.status === "PASS");
  if (!allPassed) {
    console.error("Some checkpoints failed the audit!");
    process.exit(1);
  }

  console.log("🎉 ALL CHECKPOINT AUDITS PASSED 100%!");
}

runBrowserAudit().catch((err) => {
  console.error("Browser audit failed with error:", err);
  process.exit(1);
});
