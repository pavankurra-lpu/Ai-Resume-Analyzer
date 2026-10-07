import { scoreResume } from "../src/lib/scoring";
import { StructuredResume } from "../src/lib/resumeTypes";

function createValidBaseResume(): StructuredResume {
  return {
    contact: {
      fullName: "Arun Kumar",
      email: "arun.kumar@example.com",
      phone: "9876543210",
      city: "Bangalore, India",
      linkedin: "https://linkedin.com/in/arunkumar",
      github: "https://github.com/arunkumar",
      portfolio: "https://arun.dev",
    },
    headline: "Frontend Developer",
    summary:
      "Frontend Developer with 2 years of experience designing high-performance React web applications. Proven track record of improving user engagement and collaborating in agile product teams to ship accessible UI components.",
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
        group: "Languages",
        items: ["TypeScript", "JavaScript", "HTML", "CSS"],
      },
      {
        id: "sk2",
        group: "Frameworks & Tools",
        items: ["React", "Next.js", "Tailwind CSS", "Git"],
      },
    ],
    projects: [
      {
        id: "p1",
        name: "E-Commerce Web Portal",
        techStack: "React, TypeScript, Redux",
        link: "https://github.com/arunkumar/ecommerce",
        bullets: [
          "Architected responsive product catalog components, boosting checkout conversion by 24%.",
          "Engineered reusable custom hooks that decreased bundle size by 18% across 12 views.",
        ],
      },
      {
        id: "p2",
        name: "Developer Analytics Dashboard",
        techStack: "Next.js, Tailwind, Chart.js",
        link: "https://github.com/arunkumar/dashboard",
        bullets: [
          "Developed real-time metrics telemetry visualizer handling 5,000+ daily events.",
          "Optimized client rendering cycles, slashing perceived page latency by 35%.",
        ],
      },
    ],
    experience: [
      {
        id: "e1",
        company: "Tech Solutions Pvt Ltd",
        role: "Software Engineering Intern",
        location: "Bangalore",
        startDate: "Jan 2024",
        endDate: "Jun 2024",
        current: false,
        bullets: [
          "Built customer-facing dashboard features using React and REST APIs with 99.9% uptime.",
          "Streamlined automated unit tests, increasing pipeline test coverage from 60% to 85%.",
        ],
      },
    ],
    certifications: [
      {
        id: "c1",
        name: "Meta Front-End Developer Certificate",
        issuer: "Coursera",
        year: "2023",
      },
    ],
    achievements: ["Finalist in Smart India Hackathon 2023 out of 500+ participating teams."],
    sectionOrder: [
      "summary",
      "education",
      "skills",
      "projects",
      "experience",
      "certifications",
      "achievements",
    ],
  };
}

interface TestCase {
  id: string;
  name: string;
  expectedPoints: number;
  options?: { experienceLevel?: string; targetRole?: string };
  failingSetup: (r: StructuredResume) => void;
  fixedSetup: (r: StructuredResume) => void;
}

const testCases: TestCase[] = [
  // 1. Contact & links (12 pts)
  {
    id: "contact_email",
    name: "Contact Email",
    expectedPoints: 3,
    failingSetup: (r) => {
      r.contact.email = "";
    },
    fixedSetup: (r) => {
      r.contact.email = "arun.kumar@example.com";
    },
  },
  {
    id: "contact_phone",
    name: "Contact Phone Number",
    expectedPoints: 3,
    failingSetup: (r) => {
      r.contact.phone = "";
    },
    fixedSetup: (r) => {
      r.contact.phone = "9876543210";
    },
  },
  {
    id: "contact_location",
    name: "Contact Location / City",
    expectedPoints: 2,
    failingSetup: (r) => {
      r.contact.city = "";
    },
    fixedSetup: (r) => {
      r.contact.city = "Bangalore, India";
    },
  },
  {
    id: "contact_linkedin",
    name: "LinkedIn Link",
    expectedPoints: 2,
    failingSetup: (r) => {
      r.contact.linkedin = "";
    },
    fixedSetup: (r) => {
      r.contact.linkedin = "https://linkedin.com/in/arunkumar";
    },
  },
  {
    id: "contact_links",
    name: "GitHub / Portfolio Link",
    expectedPoints: 2,
    failingSetup: (r) => {
      r.contact.github = "";
      r.contact.portfolio = "";
    },
    fixedSetup: (r) => {
      r.contact.github = "https://github.com/arunkumar";
      r.contact.portfolio = "";
    },
  },

  // 2. Summary (8 pts)
  {
    id: "summary_present",
    name: "Summary Present",
    expectedPoints: 3,
    failingSetup: (r) => {
      r.summary = "";
    },
    fixedSetup: (r) => {
      // 12 words: satisfies present (>=10 words), but fails length (< 25 words)
      r.summary = "A dedicated professional with experience developing web applications for various commercial clients.";
    },
  },
  {
    id: "summary_length",
    name: "Summary Optimal Length",
    expectedPoints: 3,
    failingSetup: (r) => {
      // 12 words: satisfies present and role aligned, but fails optimal length (< 25 words)
      r.summary = "Frontend Developer creating responsive web applications with React and TypeScript for global clients.";
    },
    fixedSetup: (r) => {
      r.summary =
        "Frontend Developer with 2 years of experience designing high-performance React web applications. Proven track record of improving user engagement and collaborating in agile product teams to ship accessible UI components.";
    },
  },
  {
    id: "summary_role_aligned",
    name: "Summary Role Alignment",
    expectedPoints: 2,
    options: { targetRole: "Data Scientist" },
    failingSetup: (r) => {
      r.summary =
        "Dedicated professional with experience leading complex organizational workflows and collaborating across departments on technical projects with positive business returns for clients.";
    },
    fixedSetup: (r) => {
      r.summary =
        "Dedicated Data Scientist with hands-on experience in machine learning pipelines, predictive modeling, and analyzing high-volume datasets to drive measurable business returns.";
    },
  },

  // 3. Education (8 pts)
  {
    id: "education_present",
    name: "Education Present",
    expectedPoints: 4,
    failingSetup: (r) => {
      r.education[0].degree = "";
      r.education[0].institution = "";
    },
    fixedSetup: (r) => {
      r.education[0].degree = "B.Tech in Computer Science";
      r.education[0].institution = "PES University";
    },
  },
  {
    id: "education_details",
    name: "Education Details (Year & Grade)",
    expectedPoints: 4,
    failingSetup: (r) => {
      r.education[0].endYear = "";
      r.education[0].grade = "";
      r.education[0].startYear = "";
    },
    fixedSetup: (r) => {
      r.education[0].endYear = "2024";
      r.education[0].grade = "8.6 CGPA";
    },
  },

  // 4. Skills (10 pts standard)
  {
    id: "skills_count",
    name: "Skills Count (at least 5)",
    expectedPoints: 5,
    failingSetup: (r) => {
      r.skills = [
        { id: "sk1", group: "Languages", items: ["Python", "Java"] },
        { id: "sk2", group: "Tools", items: ["Git"] },
      ];
    },
    fixedSetup: (r) => {
      r.skills = [
        { id: "sk1", group: "Languages", items: ["Python", "Java", "SQL"] },
        { id: "sk2", group: "Tools", items: ["Git", "Docker", "Linux"] },
      ];
    },
  },
  {
    id: "skills_categorized",
    name: "Skills Categorized Groups",
    expectedPoints: 5,
    failingSetup: (r) => {
      r.skills = [
        {
          id: "sk1",
          group: "All Skills",
          items: ["TypeScript", "React", "Node.js", "Docker", "Git", "Python"],
        },
      ];
    },
    fixedSetup: (r) => {
      r.skills = [
        { id: "sk1", group: "Languages", items: ["TypeScript", "Python"] },
        { id: "sk2", group: "Frameworks & Tools", items: ["React", "Node.js", "Docker", "Git"] },
      ];
    },
  },

  // 5. Projects (14 pts standard)
  {
    id: "projects_count",
    name: "Projects Count (at least 2)",
    expectedPoints: 6,
    failingSetup: (r) => {
      r.projects = [r.projects[0]];
    },
    fixedSetup: (r) => {
      r.projects = createValidBaseResume().projects;
    },
  },
  {
    id: "projects_tech_stack",
    name: "Projects Tech Stack Specified",
    expectedPoints: 4,
    failingSetup: (r) => {
      r.projects.forEach((p) => {
        p.techStack = "";
      });
    },
    fixedSetup: (r) => {
      r.projects[0].techStack = "React, TypeScript";
      r.projects[1].techStack = "Next.js, Tailwind";
    },
  },
  {
    id: "projects_bullets",
    name: "Projects Descriptive Bullets",
    expectedPoints: 4,
    failingSetup: (r) => {
      r.projects.forEach((p) => {
        p.bullets = [];
      });
    },
    fixedSetup: (r) => {
      r.projects = createValidBaseResume().projects;
    },
  },

  // 6. Experience (14 pts standard)
  {
    id: "experience_present",
    name: "Experience Role Present",
    expectedPoints: 6,
    options: { experienceLevel: "0-2 yrs" },
    failingSetup: (r) => {
      r.experience[0].company = "";
      r.experience[0].role = "";
    },
    fixedSetup: (r) => {
      r.experience[0].company = "Tech Solutions Pvt Ltd";
      r.experience[0].role = "Software Engineering Intern";
    },
  },
  {
    id: "experience_bullets",
    name: "Experience Multiple Bullets",
    expectedPoints: 5,
    options: { experienceLevel: "0-2 yrs" },
    failingSetup: (r) => {
      r.experience[0].bullets = [r.experience[0].bullets[0]];
    },
    fixedSetup: (r) => {
      r.experience[0].bullets = createValidBaseResume().experience[0].bullets;
    },
  },
  {
    id: "experience_dates",
    name: "Experience Employment Dates",
    expectedPoints: 3,
    options: { experienceLevel: "0-2 yrs" },
    failingSetup: (r) => {
      r.experience[0].startDate = "";
      r.experience[0].endDate = "";
      r.experience[0].current = false;
    },
    fixedSetup: (r) => {
      r.experience[0].startDate = "Jan 2024";
      r.experience[0].endDate = "Jun 2024";
    },
  },

  // 7. Bullet Quality (20 pts)
  {
    id: "bullets_action_verbs",
    name: "Action Verbs in Bullets",
    expectedPoints: 8,
    options: { experienceLevel: "0-2 yrs" },
    failingSetup: (r) => {
      r.projects.forEach((p) => {
        p.bullets = p.bullets.map((b) => b.replace(/^(Architected|Engineered|Developed|Optimized)/, "Worked on"));
      });
      r.experience.forEach((e) => {
        e.bullets = e.bullets.map((b) => b.replace(/^(Built|Streamlined)/, "Helped with"));
      });
    },
    fixedSetup: (r) => {
      r.projects = createValidBaseResume().projects;
      r.experience = createValidBaseResume().experience;
    },
  },
  {
    id: "bullets_metrics",
    name: "Metrics in Bullets",
    expectedPoints: 8,
    options: { experienceLevel: "0-2 yrs" },
    failingSetup: (r) => {
      r.projects.forEach((p) => {
        p.bullets = p.bullets.map((b) => b.replace(/\b\d+(%|\+)?\b/g, "several").replace(/by several/g, "greatly"));
      });
      r.experience.forEach((e) => {
        e.bullets = e.bullets.map((b) => b.replace(/\b\d+(%|\+)?\b/g, "several").replace(/from several to several/g, "substantially"));
      });
    },
    fixedSetup: (r) => {
      r.projects = createValidBaseResume().projects;
      r.experience = createValidBaseResume().experience;
    },
  },
  {
    id: "bullets_length",
    name: "Optimal Bullet Length",
    expectedPoints: 4,
    options: { experienceLevel: "0-2 yrs" },
    failingSetup: (r) => {
      // 4-word bullets with verbs and metrics: keeps verbs (100%) and metrics (100%), but fails length (< 8 words)
      r.projects[0].bullets = [
        "Architected 25% faster portal.",
        "Engineered 18% smaller bundle.",
      ];
      r.projects[1].bullets = [
        "Developed 5000+ daily events.",
        "Optimized 35% latency drop.",
      ];
      r.experience[0].bullets = [
        "Built 99.9% uptime dashboard.",
        "Streamlined 85% test coverage.",
      ];
    },
    fixedSetup: (r) => {
      r.projects = createValidBaseResume().projects;
      r.experience = createValidBaseResume().experience;
    },
  },

  // 8. Clean & safe (8 pts)
  {
    id: "clean_placeholders",
    name: "No Unfilled Placeholders",
    expectedPoints: 3,
    options: { experienceLevel: "0-2 yrs" },
    failingSetup: (r) => {
      r.projects[0].bullets[0] = "Architected responsive product catalog components, boosting conversion by [X%].";
    },
    fixedSetup: (r) => {
      r.projects[0].bullets[0] = "Architected responsive product catalog components, boosting checkout conversion by 24%.";
    },
  },
  {
    id: "clean_sensitive_data",
    name: "No Sensitive Personal Data",
    expectedPoints: 3,
    options: { experienceLevel: "0-2 yrs" },
    failingSetup: (r) => {
      r.contact.city = "Bangalore, India | DOB: 14/08/2001 | Single";
    },
    fixedSetup: (r) => {
      r.contact.city = "Bangalore, India";
    },
  },
  {
    id: "clean_cliches",
    name: "No Empty Cliches",
    expectedPoints: 2,
    options: { experienceLevel: "0-2 yrs" },
    failingSetup: (r) => {
      r.summary = r.summary + " Recognized as a hardworking team player and go-getter.";
    },
    fixedSetup: (r) => {
      r.summary = createValidBaseResume().summary;
    },
  },

  // 9. Fresher re-weighted rule test: Certifications / Achievements (2 pts)
  {
    id: "certifications_achievements",
    name: "Fresher Certifications / Achievements Boost",
    expectedPoints: 2,
    options: { experienceLevel: "Fresher" },
    failingSetup: (r) => {
      r.experience = []; // triggers fresher reweighting
      r.certifications = [];
      r.achievements = [];
    },
    fixedSetup: (r) => {
      r.experience = [];
      r.certifications = [
        {
          id: "c1",
          name: "AWS Certified Cloud Practitioner",
          issuer: "Amazon",
          year: "2024",
        },
      ];
    },
  },
];

console.log("=========================================================");
console.log("RUNNING STRICT DETERMINISTIC RULES TEST SUITE");
console.log("Requirement: For EVERY checkpoint, a failing sample and a");
console.log("fixed sample MUST produce a score increase EQUAL to that checkpoint's points.");
console.log("=========================================================\n");

let passedCount = 0;
let failedCount = 0;

for (const tc of testCases) {
  const failingResume = createValidBaseResume();
  tc.failingSetup(failingResume);
  const failingResult = scoreResume(failingResume, tc.options);

  const fixedResume = createValidBaseResume();
  tc.fixedSetup(fixedResume);
  const fixedResult = scoreResume(fixedResume, tc.options);

  const scoreIncrease = fixedResult.totalScore - failingResult.totalScore;

  // Verify checkpoint status transitions
  const failingCp = failingResult.checkpoints.find((c) => c.id === tc.id);
  const fixedCp = fixedResult.checkpoints.find((c) => c.id === tc.id);

  const checkpointPassed =
    failingCp &&
    fixedCp &&
    failingCp.earned === 0 &&
    fixedCp.earned === tc.expectedPoints &&
    scoreIncrease === tc.expectedPoints;

  if (checkpointPassed) {
    console.log(`✅ [PASS] ${tc.id.padEnd(28)} | ${tc.name.padEnd(35)} | +${tc.expectedPoints} pts (Score: ${failingResult.totalScore} -> ${fixedResult.totalScore})`);
    passedCount++;
  } else {
    console.error(`❌ [FAIL] ${tc.id.padEnd(28)} | ${tc.name.padEnd(35)}`);
    console.error(`   Expected increase: +${tc.expectedPoints} pts, Actual increase: +${scoreIncrease} pts`);
    console.error(`   Failing CP earned: ${failingCp?.earned}, Fixed CP earned: ${fixedCp?.earned}`);
    failedCount++;
  }
}

console.log("\n=========================================================");
console.log(`TOTAL TEST RESULTS: ${passedCount} passed, ${failedCount} failed out of ${testCases.length} checkpoints.`);
console.log("=========================================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL CHECKPOINT RULES VERIFIED DETERMINISTIC & PREDICTABLE!");
  process.exit(0);
}
