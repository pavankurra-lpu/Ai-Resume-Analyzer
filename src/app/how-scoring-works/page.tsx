import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileText,
  Award,
  Layers,
  Wrench,
  Info,
  Scale
} from "lucide-react";

export const metadata = {
  title: "How ATS Readiness Scoring Works | Learners Track",
  description:
    "Complete breakdown of our 100-point deterministic ATS Readiness Score rubric, checkpoints, and partial credit formulas.",
};

export default function HowScoringWorksPage() {
  const categories = [
    {
      name: "A. ATS Format & Parsing",
      points: 30,
      description: "Ensures automated ATS parsers (Workday, Taleo, Greenhouse, Lever) can accurately extract your text without corruption.",
      checkpoints: [
        {
          title: "Single Column & No Graphics",
          points: 8,
          desc: "Single-column linear text flow with zero tables, text boxes, images, or rating bars.",
          reason: "Multi-column layouts cause ATS parsers to read across columns, scrambling your sentences.",
        },
        {
          title: "Standard Section Headings",
          points: 6,
          desc: "Recognized standard headings: Summary, Education, Skills, Projects, Experience, Certifications.",
          reason: "Parsers use exact heading patterns to categorize sections into structured candidate profiles.",
        },
        {
          title: "Plain-Text Contact Details in Body",
          points: 6,
          desc: "Email address and 10-digit telephone number placed directly in the document body.",
          reason: "Contact placed in header/footer margin bands is often stripped or ignored during parsing.",
        },
        {
          title: "Consistent Date Formatting",
          points: 3,
          desc: "Uniform chronological format across education and experience (e.g. 'Jan 2024 - Present').",
          reason: "Inconsistent date patterns cause ATS parsers to miscalculate total months of experience.",
        },
        {
          title: "Selectable Vector Text & Readable Fonts",
          points: 4,
          desc: "Standard system fonts (Calibri or Arial, 10 to 11 pt) exported as real selectable text streams.",
          reason: "Image scans and rasterized PDFs cannot be read by automated search scrapers.",
        },
        {
          title: "Optimal Page Length",
          points: 3,
          desc: "Strictly 1 page for freshers and 0-2 years; up to 2 pages for senior applicants.",
          reason: "Recruiters spend 6-10 seconds on an initial scan; multi-page fresher resumes dilute key strengths.",
        },
      ],
    },
    {
      name: "B. Content Completeness",
      points: 25,
      description: "Verifies that essential credentials, contact links, and academic history are fully documented.",
      checkpoints: [
        {
          title: "Complete Contact Information & Links",
          points: 8,
          desc: "Full name, email, phone, city & state, LinkedIn, and GitHub/Portfolio link.",
          reason: "Enables recruiters to contact you instantly and inspect real code or design deliverables.",
        },
        {
          title: "Role-Aligned Professional Summary",
          points: 5,
          desc: "Concise 25-85 word executive summary naming your specific target role and technical focus.",
          reason: "Immediately anchors your resume for the specific job requisition within 3 seconds.",
        },
        {
          title: "Complete Education Details",
          points: 5,
          desc: "Degree title, college/institution name, graduation year, and CGPA or percentage.",
          reason: "Campus and fresher recruitment drives filter candidates by graduation year and academic cutoff.",
        },
        {
          title: "Categorized Technical Skills (8-20 skills)",
          points: 4,
          desc: "At least 8-20 concrete skills grouped into categories (e.g. Languages, Frameworks, Tools).",
          reason: "Categorized skills help both algorithmic keyword matchers and hiring managers quickly map your tech stack.",
        },
        {
          title: "Demonstrated Projects & Experience",
          points: 3,
          desc: "At least 2 significant projects, or 1 project plus 1 internship/job.",
          reason: "Practical projects are the primary proof of your coding abilities before your first full-time role.",
        },
      ],
    },
    {
      name: "C. Bullet Quality",
      points: 25,
      description: "Evaluates bullet point strength across action verbs, technologies, and measurable impact.",
      checkpoints: [
        {
          title: "Strong Action Verbs in Bullets",
          points: 8,
          desc: "Every bullet initiates with a power verb (e.g. Built, Developed, Designed, Optimized, Automated, Led).",
          reason: "Passive openings ('Worked on', 'Responsible for') hide your personal ownership and initiative.",
        },
        {
          title: "Tools & Technologies in Context",
          points: 6,
          desc: "Explicitly names the libraries, databases, and tools used for each deliverable.",
          reason: "Validates that your listed skills were actually applied to build production features.",
        },
        {
          title: "Measurable Results or Outcomes",
          points: 6,
          desc: "Includes a quantified metric OR a clear outcome in words ('so students can filter jobs by city').",
          reason: "Metrics are never mandatory, but demonstrating business or user impact proves tangible value.",
        },
        {
          title: "Concise Bullet Length",
          points: 5,
          desc: "Each bullet falls in the 8 to 30 word sweet spot (1-2 lines on the page).",
          reason: "Bullets under 8 words lack technical context; bullets over 30 words turn into dense paragraphs.",
        },
      ],
    },
    {
      name: "D. Role Keyword Relevance",
      points: 12,
      description: "Measures keyword coverage from our curated role database (/config/roles.ts) or your pasted job description.",
      checkpoints: [
        {
          title: "Target Role Keyword Coverage",
          points: 12,
          desc: "Core competencies and tools appear naturally across both your skills list and bullet context.",
          reason: "ATS rank algorithms prioritize resumes with high keyword density matching the job requisition.",
        },
      ],
    },
    {
      name: "E. Clean & Safe",
      points: 8,
      description: "Ensures the resume is free from unprofessional template placeholders, private data, and generic clichés.",
      checkpoints: [
        {
          title: "No Unfilled Placeholders",
          points: 3,
          desc: "Zero bracketed template leftovers like [X%] or [Company Name].",
          reason: "Unfilled brackets show carelessness and result in immediate recruiter dismissal.",
        },
        {
          title: "Clean of Sensitive Personal Data",
          points: 3,
          desc: "Zero photos, date of birth, marital status, religion, caste, father's name, Aadhaar, or PAN.",
          reason: "Protect against unconscious hiring bias and identity security risks.",
        },
        {
          title: "No Empty Buzzwords",
          points: 2,
          desc: "Free of unsupported clichés like 'hardworking', 'team player', or 'passionate'.",
          reason: "Empty claims add noise without demonstrating proof of capability.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-lt-blue text-xs font-bold shadow-2xs">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>Open & Deterministic 100-Point Rubric</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-lt-blue-dark tracking-tight">
            How the ATS Readiness Score Works
          </h1>

          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Every point on your score is calculated deterministically in code using fixed weights and proportional partial credit. AI never assigns or changes numbers.
          </p>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-2xl mx-auto text-xs text-amber-900 leading-relaxed text-left flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Honest Labelling Notice:</strong> Our standard ATS Readiness Score is an educational benchmark calibrated against modern recruiter workflows. Real applicant tracking systems vary across employers, so this score is a reliable guide, not an employment guarantee.
            </div>
          </div>
        </div>

        {/* Tier Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs">
            <span className="text-xs font-bold text-rose-600 block">0 - 49 pts</span>
            <span className="text-sm font-extrabold text-slate-800">Needs Work</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-xs font-bold text-amber-600 block">50 - 69 pts</span>
            <span className="text-sm font-extrabold text-slate-800">Average</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs">
            <span className="text-xs font-bold text-blue-600 block">70 - 84 pts</span>
            <span className="text-sm font-extrabold text-slate-800">Good</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-xs font-bold text-emerald-600 block">85 - 100 pts</span>
            <span className="text-sm font-extrabold text-slate-800">ATS-Ready</span>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="space-y-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-lt-blue-dark">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </div>
                <span className="text-sm font-extrabold px-3 py-1 bg-lt-blue/10 text-lt-blue rounded-full">
                  {cat.points} pts
                </span>
              </div>

              <div className="space-y-3">
                {cat.checkpoints.map((cp, cIdx) => (
                  <div key={cIdx} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-800">
                        {cp.title}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        +{cp.points} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{cp.desc}</p>
                    <p className="text-[11px] text-slate-500 italic">
                      <strong>Why recruiters care:</strong> {cp.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Proportional Partial Credit & Non-tech Re-weighting */}
        <div className="bg-gradient-to-r from-lt-blue-dark to-lt-blue text-white rounded-2xl p-6 sm:p-8 space-y-3">
          <h3 className="font-heading font-extrabold text-lg text-white">
            Proportional Partial Credit & Fair Re-weighting
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Our scoring engine rewards every incremental improvement. For instance, if 2 out of 4 bullets feature strong action verbs, you receive exactly half credit (+4 of 8 points) instead of 0. Furthermore, if an item does not apply to you (e.g. no GitHub for non-tech roles, or no prior corporate internships for freshers), its points are automatically redistributed to Projects and Skills so you can still reach 100/100.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/check"
            className="inline-flex items-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <span>Check My Resume Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
