# Integration Guide: Resume Checker by Learners Track

This showcase project is designed to be effortlessly integrated into your internal LMS, EdTech portal, or job board. It follows clean architecture principles: **data access abstraction**, **pure functional scoring**, and **embeddable React components**.

---

## 1. Architecture Overview

```
                      ┌───────────────────────────────┐
                      │    Your Portal / Frontend     │
                      └──────────────┬────────────────┘
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          ▼                                                     ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     <ResumeBuilder />           │           │        REST API Endpoints       │
│  (Word-style document canvas)   │           │    /api/analyze, /api/resume/*  │
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │                                             │
                 ▼                                             ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│       src/lib/scoring/          │           │        src/lib/data/            │
│  Pure deterministic engine      │           │  Storage Abstraction Layer      │
│  Fixed 100-pt rubric            │           │  (Swap Prisma for PostgreSQL,   │
│  Zero API key required          │           │   MongoDB, Supabase, or REST)   │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## 2. Embedding the `<ResumeBuilder />` Component

The document editor is exported as an isolated, self-contained React component:

```tsx
import ResumeBuilder from "@/components/ResumeBuilder";
import { StructuredResume } from "@/lib/resumeTypes";

export default function MyCustomPortalPage() {
  const initialResume: StructuredResume = {
    contact: {
      fullName: "Arun Kumar",
      email: "arun.kumar@example.com",
      phone: "9876543210",
      city: "Bangalore, India",
      linkedin: "https://linkedin.com/in/arunkumar",
      github: "https://github.com/arunkumar",
      portfolio: "",
    },
    headline: "Frontend Developer",
    summary: "Frontend Developer with 2 years of experience designing high-performance React web applications...",
    education: [
      {
        id: "edu-1",
        degree: "B.Tech in Computer Science",
        institution: "PES University",
        startYear: "2020",
        endYear: "2024",
        grade: "8.6 CGPA",
      },
    ],
    skills: [
      { id: "sk-1", group: "Languages", items: ["TypeScript", "JavaScript", "HTML", "CSS"] },
      { id: "sk-2", group: "Frameworks & Tools", items: ["React", "Next.js", "Tailwind CSS", "Git"] },
    ],
    projects: [
      {
        id: "proj-1",
        name: "E-Commerce Web Portal",
        techStack: "React, TypeScript, Redux",
        link: "https://github.com/arunkumar/ecommerce",
        bullets: [
          "Architected responsive product catalog components, boosting checkout conversion by 24%.",
          "Engineered reusable custom hooks that decreased bundle size by 18% across 12 views.",
        ],
      },
      {
        id: "proj-2",
        name: "Developer Analytics Dashboard",
        techStack: "Next.js, Tailwind, Chart.js",
        link: "https://github.com/arunkumar/dashboard",
        bullets: [
          "Developed real-time metrics telemetry visualizer handling 5,000+ daily events.",
          "Optimized client rendering cycles, slashing perceived page latency by 35%.",
        ],
      },
    ],
    experience: [],
    certifications: [],
    achievements: [],
    sectionOrder: ["summary", "education", "skills", "projects", "experience"],
  };

  return (
    <ResumeBuilder
      initialResume={initialResume}
      resumeId="opt-resume-123"
      initialScore={72}
      leadInfo={{
        name: "Arun Kumar",
        targetRole: "Frontend Developer",
        experienceLevel: "Fresher",
      }}
      onChange={(updatedResume, currentScore) => {
        console.log("Resume updated:", updatedResume, "Score:", currentScore);
      }}
      onDownload={() => {
        console.log("User triggered PDF download");
      }}
    />
  );
}
```

### Component Props:
| Prop | Type | Description |
|---|---|---|
| `initialResume` | `StructuredResume` | Initial resume data object |
| `resumeId` | `string` (optional) | If supplied, triggers debounced autosave to `/api/resume/[id]` |
| `initialScore` | `number` (optional) | Initial score shown for Before vs After progress |
| `leadInfo` | `object` (optional) | Candidate context (`targetRole`, `experienceLevel`, `jobDescription`) |
| `initialTargetField` | `string` (optional) | Element path to auto-scroll & pulse (e.g. `projects.0.bullets.0`) |
| `onChange` | `(resume, score) => void` | Invoked on keystroke / edit with new score |
| `onDownload` | `() => void` | Optional override for PDF download action |

---

## 3. Pure Scoring Engine (`src/lib/scoring`)

All scoring logic is decoupled from UI and network calls. It runs as pure synchronous TypeScript functions:

```ts
import { scoreResume } from "@/lib/scoring";

const result = scoreResume(resume, {
  experienceLevel: "Fresher",
  targetRole: "Frontend Developer",
});

console.log("Total Score (out of 100):", result.totalScore);
console.log("Grade:", result.grade); // "Needs Work" | "Average" | "Good" | "Excellent"
console.log("Checkpoints:", result.checkpoints); // 25 deterministic checkpoints
```

### Fixed Rubric Weights (Sum = 100):
1. **Contact & links:** 12 pts
2. **Summary:** 8 pts
3. **Education:** 8 pts
4. **Skills:** 10 pts
5. **Projects:** 14 pts
6. **Experience / Internships:** 14 pts *(re-weighted for freshers)*
7. **Bullet quality:** 20 pts (Action verbs 8, Metrics 8, Length 4)
8. **Length & layout:** 6 pts
9. **Clean & safe:** 8 pts (Zero [X] placeholders 3, Zero sensitive info 3, Zero clichés 2)

*Fresher Re-weighting:* If a candidate is a fresher without formal work experience, the 14 experience points are automatically allocated to Projects (+8), Skills (+4), and Certifications (+2). A fresher with no work experience can achieve a full **100/100**.

---

## 4. Swapping Storage / Database (`src/lib/data/index.ts`)

All database operations are centralized behind `dataStore` in `src/lib/data/index.ts`. No API route touches Prisma directly.

To replace SQLite/Prisma with PostgreSQL, MongoDB, or an external API:
1. Open `src/lib/data/index.ts`.
2. Replace the method implementations (`createLead`, `createReport`, `getResume`, `updateResume`, `deleteUserData`).
3. The rest of the application, API routes, and editor will continue working without code changes.

---

## 5. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Accepts multipart form (PDF/DOCX file or `resumeText`, plus optional role/experience). Returns `{ reportId }`. |
| `POST` | `/api/resume/parse` | Converts report raw text into structured JSON `StructuredResume`. Returns `{ resumeId, resume }`. |
| `GET` | `/api/resume/:id` | Fetches resume JSON, lead context, and versions. |
| `PATCH` | `/api/resume/:id` | Debounced autosave endpoint. Saves version snapshots. |
| `POST` | `/api/resume/:id/rescore` | Deterministically recalculates score and returns Before vs After diff. |
| `GET` | `/api/resume/:id/export?format=pdf` | Downloads clean vector ATS PDF (`Firstname_Lastname_Role.pdf`). |
| `POST` | `/api/user/delete-data` | Erases candidate data by email in cascade. |

---

## 6. Optional AI Integration (`ANTHROPIC_API_KEY`)

* **Default (No API Key):** The application runs 100% locally with high-fidelity deterministic heuristic parsing, instant rule evaluation, and local template rewrites.
* **With API Key:** Set `ANTHROPIC_API_KEY` in `.env.local`. The system will optionally query Claude (`claude-3-5-sonnet-20241022`) for phrasing suggestions.
* **Important:** AI **never assigns numbers or alters category scores**. Scores are strictly controlled by `src/lib/scoring`.
