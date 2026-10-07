import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Zap,
  Target,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  Layers,
  Check,
  Phone,
  BookOpen
} from "lucide-react";
import { LEARNERS_TRACK_COURSES } from "@/config/courses";

export default function HomePage() {
  const counsellorPhone = process.env.COUNSELLOR_PHONE || "+919876543210";

  // Fixed weights totalling exactly 100
  const categories = [
    { name: "Contact & Links", pts: 12, desc: "Email, Indian mobile, city, LinkedIn, and GitHub/Portfolio link completeness." },
    { name: "Summary / Objective", pts: 8, desc: "Role-aligned, 25-85 word executive summary focusing on tangible strengths." },
    { name: "Education", pts: 8, desc: "Degree, branch, college institution, graduation year, and CGPA/grade." },
    { name: "Skills", pts: 10, desc: "Categorized technical and domain skill groups tailored for automated ATS filters." },
    { name: "Projects", pts: 14, desc: "At least 2 significant projects with tech stacks and descriptive outcome bullets." },
    { name: "Experience / Internships", pts: 14, desc: "Company names, roles, dates, and deliverables (re-weighted for freshers)." },
    { name: "Bullet Quality", pts: 20, desc: "Action verbs (8 pts), quantified numbers/metrics (8 pts), and concise length (4 pts)." },
    { name: "Length & Layout", pts: 6, desc: "1-page standard sweet spot calibrated for your specific experience level." },
    { name: "Clean & Safe", pts: 8, desc: "Zero unfilled placeholders [X], zero sensitive data (DOB/marital status), zero clichés." },
  ];

  const steps = [
    {
      step: "01",
      title: "Upload & Scan",
      desc: "Upload your PDF or DOCX file, or paste your resume text. Takes under 5 seconds.",
      icon: UploadCloud,
    },
    {
      step: "02",
      title: "Your Diagnostic Score",
      desc: "Deterministic 100-point scoring engine evaluates your resume against rigorous recruiter rubrics.",
      icon: Zap,
    },
    {
      step: "03",
      title: "Fix It In The Editor",
      desc: "Document editor with spellcheck-style underlines and suggested rewrites with real numbers.",
      icon: FileCheck2,
    },
    {
      step: "04",
      title: "Download PDF",
      desc: "Download your clean, single-column ATS vector PDF ready for job applications.",
      icon: Award,
    },
  ];

  const faqs = [
    {
      q: "Is the resume checker 100% free?",
      a: "Yes! There are no hidden fees, paywalls, or credit card requirements. You get your diagnostic score, live Word-style editor, and downloadable vector PDF completely free.",
    },
    {
      q: "How does the scoring rubric work?",
      a: "Our scoring engine uses fixed, predictable weights totaling 100 (Bullet Quality 20, Experience 14, Projects 14, Contact 12, Skills 10, Summary 8, Education 8, Clean 8, Layout 6). If you are a fresher without work experience, the 14 experience points are automatically re-weighted to Projects and Skills so you can reach 100/100.",
    },
    {
      q: "Does AI invent numbers or fake information?",
      a: "Never! Our AI coach strictly preserves honesty: suggested rewrites contain [X%] placeholders and ask you for your real project metrics before applying.",
    },
    {
      q: "Is my personal data secure?",
      a: "Yes. Uploaded files are processed in-memory and permanently erased immediately after parsing. We never sell or share your resume text with third parties.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-lt-bg-soft via-white to-white py-14 lg:py-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-lt-yellow/20 blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 -left-28 w-80 h-80 rounded-full bg-lt-blue/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-lt-blue text-xs sm:text-sm font-semibold shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: "6s" }} />
                <span>Deterministic Scoring • Recruiter-Tuned for India</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-lt-blue-dark tracking-tight leading-[1.15]">
                Is your resume recruiter-ready?{" "}
                <span className="text-lt-blue relative inline-block">
                  Build and score it live
                  <span className="absolute left-0 bottom-1 w-full h-2 bg-lt-yellow -z-10 rounded-xs"></span>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Check your resume against our 100-point rubric, edit it directly on an A4 Word-style canvas with live AI suggestions, and download your clean ATS-compliant PDF.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/check"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Check my resume free</span>
                  <ArrowRight className="w-5 h-5 text-lt-blue-dark" />
                </Link>

                <Link
                  href="/improve"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-heading font-bold text-sm px-6 py-4 rounded-full border border-slate-200 shadow-xs transition-all hover:border-lt-blue"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Improve a Bullet Point</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Free & Open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>No login required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>In-memory extraction</span>
                </div>
              </div>
            </div>

            {/* Right Authentic Feature Showcase (No fake scores or fake user stats) */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-700 ml-2">Word-Style WYSIWYG Editor</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Live Feedback
                  </span>
                </div>

                {/* Mock A4 document representation */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3 font-sans text-xs">
                  <div className="text-center space-y-0.5 border-b border-slate-200 pb-2">
                    <span className="font-extrabold text-sm text-lt-blue uppercase tracking-tight block">
                      Candidate Name
                    </span>
                    <span className="text-[10px] text-slate-500">
                      email@domain.com • +91 9876543210 • Bangalore, India • LinkedIn
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-700 tracking-wider block">
                      Key Highlights & Checks
                    </span>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Action verbs verified (Architected, Engineered)</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Quantified metric detection (35% speedup, 10k users)</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Single-column ATS parsable formatting</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>Click any line on the page to edit with live spell-check style rewrite coaching.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/check"
                    className="w-full py-2.5 bg-lt-blue hover:bg-lt-blue-dark text-white font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <span>Try the builder free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS IN 4 STEPS */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-lt-blue px-3 py-1 bg-blue-50 rounded-full">
              4 Clear Steps
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-lt-blue-dark mt-2">
              From Raw Resume to Recruiter-Ready
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-6 rounded-2xl border border-slate-100 bg-white shadow-2xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-lt-bg-soft text-lt-blue flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5 text-lt-blue" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 font-heading">
                      {st.step}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-slate-800">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHAT WE CHECK: 10 FIXED RUBRIC CATEGORIES */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-lt-blue px-3 py-1 bg-white rounded-full shadow-2xs">
              Predictable 100-Point Rubric
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-lt-blue-dark mt-2">
              What Our Engine Evaluates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Fixed category weights totaling 100. Every fix adds its stated points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, idx) => (
              <div
                key={cat.name}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 hover:border-lt-blue/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-slate-800">
                    {idx + 1}. {cat.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-lt-blue-dark border border-amber-200 font-mono">
                    {cat.pts} pts
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHT SKILL UP SECTION WITH LEARNERS TRACK COURSES & WHATSAPP */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 px-3 py-1 bg-emerald-50 rounded-full">
              Bridge Your Project Gaps
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-lt-blue-dark">
              Learners Track Tech Programs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Need real portfolio projects or mentorship to put on your resume? Check out our industry-led programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEARNERS_TRACK_COURSES.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-lt-blue uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                    {course.tags[0] || "Career Track"}
                  </span>
                  <h3 className="font-heading font-bold text-base text-slate-800">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {course.shortDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Duration: {course.duration}
                  </span>
                  <a
                    href={`https://wa.me/${counsellorPhone.replace(/[^0-9]/g, "")}?text=Hi%20Learners%20Track,%20I%20am%20interested%20in%20the%20${encodeURIComponent(course.name)}%20program.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-lt-blue hover:text-lt-blue-dark"
                  >
                    <span>Inquire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Counsellor Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-lt-blue to-lt-blue-dark text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-heading font-extrabold">
                Want 1-on-1 Career Counselling?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100">
                Chat with our senior placement counsellor directly on WhatsApp for resume review and career roadmaps.
              </p>
            </div>

            <a
              href={`https://wa.me/${counsellorPhone.replace(/[^0-9]/g, "")}?text=Hi%20Learners%20Track,%20I%20would%20like%20guidance%20on%20my%20resume%20and%20career.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-sm px-6 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Phone className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQS */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-1 mb-8">
            <h2 className="text-2xl font-extrabold text-lt-blue-dark">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-2"
              >
                <h3 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-lt-blue flex-shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
