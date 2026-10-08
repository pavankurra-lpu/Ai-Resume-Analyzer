import { computeAtsScore } from "../src/lib/ats";
import { StructuredResume } from "../src/lib/resumeTypes";

function createValidBaseResume(): StructuredResume {
  return {
    contact: {
      fullName: "Arun Kumar",
      email: "arun.kumar@example.com",
      phone: "9876543210",
      city: "Bangalore, Karnataka",
      linkedin: "https://linkedin.com/in/arunkumar",
      github: "https://github.com/arunkumar",
      portfolio: "https://arun.dev",
    },
    headline: "Frontend Developer",
    summary:
      "Frontend Developer with hands-on experience designing responsive, accessible web applications using React and TypeScript. Proven ability to optimize web performance and collaborate effectively in fast-paced product teams.",
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
        items: ["Tailwind CSS", "Redux", "Git", "Webpack", "Vite", "Figma"],
      },
    ],
    projects: [
      {
        id: "p1",
        name: "E-Commerce Web Portal",
        techStack: "React, TypeScript, Redux",
        link: "https://github.com/arunkumar/ecommerce",
        bullets: [
          "Architected responsive product catalog components using React, boosting checkout conversion by 24%.",
          "Engineered reusable custom hooks with TypeScript that decreased bundle size by 18% across 12 views.",
        ],
      },
      {
        id: "p2",
        name: "Developer Analytics Dashboard",
        techStack: "Next.js, Tailwind, Chart.js",
        link: "https://github.com/arunkumar/dashboard",
        bullets: [
          "Developed real-time metrics telemetry visualizer handling 5,000+ daily events with Next.js.",
          "Optimized client rendering cycles so students can filter jobs by city with sub-second latency.",
        ],
      },
    ],
    experience: [],
    certifications: [
      {
        id: "cert1",
        name: "Meta Front-End Developer Professional Certificate",
        issuer: "Coursera",
        year: "2024",
      },
    ],
    achievements: ["Finalist in Smart India Hackathon 2023"],
    sectionOrder: ["summary", "education", "skills", "projects", "certifications"],
  };
}

async function runTests() {
  console.log("=========================================================");
  console.log("RUNNING UNIVERSAL ATS READINESS SCORE TEST SUITE");
  console.log("=========================================================\n");

  const base = createValidBaseResume();
  const baseResult = computeAtsScore(base, { targetRole: "Frontend Developer", experienceLevel: "Fresher" });

  console.log(`Base valid resume score: ${baseResult.score}/100 (Grade: ${baseResult.grade})`);
  if (baseResult.score < 95) {
    throw new Error(`Expected baseline resume to score >= 95, got ${baseResult.score}`);
  }
  console.log("✅ Baseline resume verified ATS-ready.\n");

  // 1. Checkpoint: format_single_column
  console.log("Testing format_single_column (8 pts)...");
  const failedLayout = computeAtsScore(base, {
    targetRole: "Frontend Developer",
    fileMeta: { hasTables: true },
  });
  const fixedLayout = computeAtsScore(base, {
    targetRole: "Frontend Developer",
    fileMeta: { isSingleColumn: true, hasTables: false },
  });
  const layoutDiff = fixedLayout.score - failedLayout.score;
  console.log(`   Layout diff: +${layoutDiff} pts (Failed: ${failedLayout.score}, Fixed: ${fixedLayout.score})`);
  if (layoutDiff !== 8) throw new Error(`format_single_column expected +8 pts, got +${layoutDiff}`);
  console.log("   ✅ format_single_column verified (+8 pts)\n");

  // 2. Checkpoint: format_contact_in_body (email & phone readable plain text)
  console.log("Testing format_contact_in_body (6 pts)...");
  const noContact = JSON.parse(JSON.stringify(base));
  noContact.contact.email = "";
  noContact.contact.phone = "";
  const noContactRes = computeAtsScore(noContact, { targetRole: "Frontend Developer" });
  const hasContactRes = computeAtsScore(base, { targetRole: "Frontend Developer" });
  const contactDiff = hasContactRes.score - noContactRes.score;
  console.log(`   Contact in body diff: +${contactDiff} pts`);
  if (contactDiff < 5.5) throw new Error(`format_contact_in_body expected +6 pts, got +${contactDiff}`);
  console.log("   ✅ format_contact_in_body verified (+6 pts)\n");

  // 3. Checkpoint: bullets_action_verbs with proportional credit
  console.log("Testing bullets_action_verbs (8 pts) with proportional credit...");
  const weakVerbs = JSON.parse(JSON.stringify(base));
  // 4 bullets: make 0 start with strong verb
  weakVerbs.projects[0].bullets = [
    "Worked on product catalog components using React.",
    "Responsible for custom hooks with TypeScript.",
  ];
  weakVerbs.projects[1].bullets = [
    "Helped with real-time metrics telemetry visualizer handling 5,000+ events.",
    "Assisted in client rendering cycles so students can filter jobs.",
  ];
  const zeroVerbsRes = computeAtsScore(weakVerbs, { targetRole: "Frontend Developer" });
  const cpZero = zeroVerbsRes.checkpoints.find((c) => c.id === "bullets_action_verbs");
  if (cpZero?.earned !== 0) throw new Error(`Expected 0 earned for weak verbs, got ${cpZero?.earned}`);

  // Now fix 2 of 4 bullets -> should earn exactly 4 pts (proportional!)
  const halfVerbs = JSON.parse(JSON.stringify(weakVerbs));
  halfVerbs.projects[0].bullets[0] = "Architected responsive product catalog components using React.";
  halfVerbs.projects[0].bullets[1] = "Engineered custom hooks with TypeScript.";
  const halfVerbsRes = computeAtsScore(halfVerbs, { targetRole: "Frontend Developer" });
  const cpHalf = halfVerbsRes.checkpoints.find((c) => c.id === "bullets_action_verbs");
  console.log(`   Half verbs (2 of 4): earned ${cpHalf?.earned}/8 pts`);
  if (cpHalf?.earned !== 4) throw new Error(`Expected 4 earned for 2/4 verbs, got ${cpHalf?.earned}`);

  // Full 4 of 4 bullets fixed -> earns 8 pts
  const fullVerbsRes = computeAtsScore(base, { targetRole: "Frontend Developer" });
  const cpFull = fullVerbsRes.checkpoints.find((c) => c.id === "bullets_action_verbs");
  console.log(`   Full verbs (4 of 4): earned ${cpFull?.earned}/8 pts`);
  if (cpFull?.earned !== 8) throw new Error(`Expected 8 earned for 4/4 verbs, got ${cpFull?.earned}`);
  console.log("   ✅ bullets_action_verbs proportional credit verified\n");

  // 4. Checkpoint: bullets_results (number OR outcome in words)
  console.log("Testing bullets_results (6 pts) - word outcomes count as results...");
  const noResults = JSON.parse(JSON.stringify(base));
  noResults.projects[0].bullets = [
    "Architected responsive product catalog components using React.",
    "Engineered reusable custom hooks with TypeScript.",
  ];
  noResults.projects[1].bullets = [
    "Developed real-time metrics telemetry visualizer with Next.js.",
    "Optimized client rendering cycles with web workers.",
  ];
  const noResultRes = computeAtsScore(noResults, { targetRole: "Frontend Developer" });
  const cpNoResult = noResultRes.checkpoints.find((c) => c.id === "bullets_results");
  console.log(`   No results earned: ${cpNoResult?.earned}/6 pts`);
  if (cpNoResult?.earned !== 0) throw new Error(`Expected 0 for no results, got ${cpNoResult?.earned}`);

  // Test word outcome "so students can filter jobs by city"
  const wordOutcomeResume = JSON.parse(JSON.stringify(noResults));
  wordOutcomeResume.projects[1].bullets[1] = "Optimized client rendering cycles so students can filter jobs by city with instant feedback.";
  const wordRes = computeAtsScore(wordOutcomeResume, { targetRole: "Frontend Developer" });
  const cpWord = wordRes.checkpoints.find((c) => c.id === "bullets_results");
  console.log(`   1 of 4 with outcome words: earned ${cpWord?.earned}/6 pts (ratio: ${cpWord?.partialRatio})`);
  if (cpWord?.earned !== 1.5) throw new Error(`Expected 1.5 earned for 1/4 result, got ${cpWord?.earned}`);
  console.log("   ✅ bullets_results verified (outcome words count properly)\n");

  // 5. Checkpoint: content_contact with Non-Tech Re-weighting
  console.log("Testing non-tech role re-weighting for contact (no GitHub required)...");
  const nonTechResume = JSON.parse(JSON.stringify(base));
  nonTechResume.contact.github = ""; // No GitHub!
  nonTechResume.contact.portfolio = "";
  const nonTechRes = computeAtsScore(nonTechResume, { targetRole: "Product Manager" });
  const cpContactNonTech = nonTechRes.checkpoints.find((c) => c.id === "content_contact");
  console.log(`   Non-tech contact without GitHub: ${cpContactNonTech?.earned}/8 pts`);
  if (cpContactNonTech?.earned !== 8) {
    throw new Error(`Expected 8 pts for non-tech without GitHub, got ${cpContactNonTech?.earned}`);
  }
  console.log("   ✅ Non-tech role re-weighting verified (+8/8 pts without GitHub)\n");

  // 6. Checkpoint: Clean & Safe (no placeholders, sensitive data, or buzzwords)
  console.log("Testing Clean & Safe category (8 pts total)...");
  const dirtyResume = JSON.parse(JSON.stringify(base));
  dirtyResume.summary = "Passionate and hardworking team player. Date of birth: 15/08/2002. Aadhaar: 1234 5678 9012.";
  dirtyResume.projects[0].bullets[0] = "Architected [X%] faster responsive catalog for [Company Name].";
  const dirtyRes = computeAtsScore(dirtyResume, { targetRole: "Frontend Developer" });

  const cpPlaceholder = dirtyRes.checkpoints.find((c) => c.id === "clean_placeholders");
  const cpSensitive = dirtyRes.checkpoints.find((c) => c.id === "clean_sensitive_data");
  const cpBuzzwords = dirtyRes.checkpoints.find((c) => c.id === "clean_buzzwords");

  if (cpPlaceholder?.status !== "fail") throw new Error("Expected clean_placeholders to fail");
  if (cpSensitive?.status !== "fail") throw new Error("Expected clean_sensitive_data to fail");
  if (cpBuzzwords?.status !== "warn") throw new Error("Expected clean_buzzwords to warn");
  console.log("   ✅ Clean & Safe checks verified\n");

  console.log("=========================================================");
  console.log("🎉 ALL UNIVERSAL ATS SCORING TESTS PASSED WITH 100% SUCCESS!");
  console.log("=========================================================");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
