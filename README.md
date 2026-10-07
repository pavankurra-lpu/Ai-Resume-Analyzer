# Resume Checker by Learners Track

An interactive resume builder and intelligence platform tailored for freshers, engineering graduates, career switchers, and working professionals in India.

Built with **Next.js 14+ (App Router, TypeScript)**, **Tailwind CSS**, **Prisma ORM**, **pdfkit**, and **Anthropic Claude API** (optional).

---

## 🌟 Key Features

* **Unified Deterministic Scoring Engine (`src/lib/scoring/`)**:
  * One single source of truth for the scanner, the report, and the live interactive builder.
  * AI never assigns scores or numbers; all 100 points are calculated deterministically via code.
  * Fixed weights:
    * **Bullet Quality:** 20 pts (Action verbs 8, Quantified metrics 8, Length 4)
    * **Projects:** 14 pts
    * **Experience / Internships:** 14 pts *(re-weighted to Projects/Skills for freshers)*
    * **Contact & Links:** 12 pts
    * **Skills:** 10 pts
    * **Summary:** 8 pts
    * **Education:** 8 pts
    * **Clean & Safe:** 8 pts (Zero [X] placeholders 3, Zero sensitive data 3, Zero clichés 2)
    * **Length & Layout:** 6 pts
  * **Total = 100 points**. Every checkpoint is predictable, visible, and adds its stated points when fixed.
* **Word-Style Document Editor (`/editor/[reportId]`)**:
  * Centered white A4 page on a soft grey background (WYSIWYG) matching the final PDF.
  * Inline clickable & editable fields for name, contact bar, summary, education, skills, projects, and experience.
  * Spell-check style underlines: red = must fix, amber = improve, yellow = unfilled `[X]` placeholders.
  * Inline issue popovers with recruiter explanations and high-impact suggested rewrites.
  * Top toolbar: Undo/Redo (`Ctrl+Z`/`Ctrl+Y`), Modern/Classic templates, font sizes, zoom, and live score pill.
  * Floating micro-toolbar on hover for moving items, adding bullets, and deleting entries.
  * Slim right-hand checklist panel (and mobile bottom sheet) with 1-click deep scroll to exact fields.
  * Simplified Review toggle: Recruiter 6-second scan view, ATS plain-text preview with 1-click copy, and JD keyword gap tracker.
* **4-Step Guided Funnel**:
  1. *Upload & Scan* (with optional contact details)
  2. *Your Score* (diagnostic breakdown & "Fix these first (+N pts)" deep links)
  3. *Fix It* (interactive Word-style builder)
  4. *Download* (clean completion screen & vector PDF)
* **High-Fidelity Text-Based PDF Export (`pdfkit`)**:
  * Pure single-column ATS vector PDF download (`Firstname_Lastname_Role.pdf`) with selectable text.
* **Delight & Gamification**:
  * Mascot bubble ("Track" the graduation cap) in the corner.
  * Milestone confetti triggered on real achievements (crossing 50/70/85, fixing all red items, download).
  * Respects `prefers-reduced-motion`.
* **Zero-Config / 100% Local**:
  * Runs with no API keys, no SMTP service, and no admin login.
  * Optional Claude API support (`claude-3-5-sonnet-20241022`) for phrasing suggestions.
* **Integration Ready**:
  * All database operations routed through `src/lib/data/` for easy storage swapping.
  * Reusable `<ResumeBuilder />` component documented in `docs/INTEGRATION.md`.

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18.17+ or 20+
* npm

### 2. Installation
```bash
git clone <repo-url>
cd "Ai resume"
npm install
```

### 3. Database Initialization
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

### Test 1: Deterministic Checkpoint Rules
Verifies that for every single checkpoint, a failing sample and a fixed sample produce a score increase equal to that checkpoint's points:
```bash
npm run test:rules
```

### Test 2: End-to-End Test Suite
Tests candidate upload, report generation, editor parsing, autosave, rescore, and vector PDF download:
```bash
node scratch/test-e2e.mjs
```

### Production Build
```bash
npm run build
```

---

## 📚 Integration Guide

See [`docs/INTEGRATION.md`](docs/INTEGRATION.md) for instructions on embedding `<ResumeBuilder />`, utilizing the REST endpoints, and swapping the database adapter.
