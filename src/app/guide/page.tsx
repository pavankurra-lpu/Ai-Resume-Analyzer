import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Lightbulb,
  Award
} from "lucide-react";

export const metadata = {
  title: "Resume Guide & ATS Handbook | Learners Track",
  description: "Comprehensive guide to crafting recruiter-ready tech resumes in India. Do's and don'ts, ATS explained, and fresher/experienced templates.",
};

export default function ResumeGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Learners Track Career Resource</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-lt-blue-dark tracking-tight">
            The Complete ATS & Recruiter Resume Guide
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about passing automated Applicant Tracking Systems and grabbing a recruiter&apos;s attention in the critical first 6 seconds.
          </p>
        </div>

        {/* What Does ATS Mean? */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-lt-blue-dark flex items-center gap-2.5">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            <span>What Does &quot;ATS&quot; Actually Mean?</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            An <strong>Applicant Tracking System (ATS)</strong> is software used by employers (like Workday, Taleo, Greenhouse, and Lever) to organize, search, and rank job applications. When you apply online, an ATS parses your resume text into structured fields: Contact, Education, Skills, and Experience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5 text-xs">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>What Breaks the ATS</span>
              </span>
              <p className="text-rose-800 leading-relaxed">
                Multi-column sidebars, tables, Canva text boxes, graphical skill ratings (e.g. 4/5 stars), and embedded images cannot be read linearly by parsers and often cause your data to get scrambled or dropped.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5 text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What the ATS Loves</span>
              </span>
              <p className="text-emerald-800 leading-relaxed">
                Clean single-column layouts, standard headings (Summary, Education, Technical Skills, Projects, Experience), selectable vector text, and direct keyword matches from the job description.
              </p>
            </div>
          </div>
        </section>

        {/* Do's and Don'ts */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-lt-blue-dark">
            Resume Do&apos;s and Don&apos;ts for the Indian Job Market
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Do's */}
            <div className="space-y-3">
              <h3 className="font-heading font-extrabold text-base text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>DO This:</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Start with action verbs:</strong> Use strong past-tense openers like &quot;Architected&quot;, &quot;Engineered&quot;, &quot;Optimized&quot;, &quot;Automated&quot;.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Quantify impact:</strong> Include numbers, percentages, latency drops (e.g., &quot;slashed query latency by 35%&quot;).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Keep it to 1 page:</strong> For freshers and engineers with under 3 years of experience, a tight 1-page document is standard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Provide clickable links:</strong> Add GitHub repositories with live deployment URLs, LeetCode, and LinkedIn.</span>
                </li>
              </ul>
            </div>

            {/* The Don'ts */}
            <div className="space-y-3">
              <h3 className="font-heading font-extrabold text-base text-rose-800 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>DON&apos;T Do This:</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span><strong>No personal sensitive data:</strong> Never list Date of Birth, marital status, gender, religion, caste, or Aadhaar/PAN.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span><strong>No generic buzzwords:</strong> Drop clichés like &quot;hardworking&quot;, &quot;team player&quot;, &quot;seeking a challenging role&quot;.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span><strong>No passive duties:</strong> Avoid &quot;Responsible for&quot;, &quot;Assisted team in&quot;, &quot;Worked on bug fixes&quot;.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span><strong>No photos or fancy graphics:</strong> Tech recruiters evaluate code, projects, and architecture, not headshots.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Real Examples (Fresher, Tech, Non-Tech) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-lt-blue-dark flex items-center gap-2.5">
            <Award className="w-6 h-6 text-lt-yellow" />
            <span>High-Impact Bullet Point Examples</span>
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-lt-blue uppercase tracking-wider block">
                1. Fresher / College Project Example:
              </span>
              <p className="text-xs text-rose-700 font-mono line-through">
                Weak: &quot;Made an e-commerce website using MERN stack with cart feature.&quot;
              </p>
              <p className="text-xs text-emerald-800 font-mono font-bold">
                Recruiter-Ready: &quot;Architected full-stack e-commerce marketplace using React, Node.js, and MongoDB, integrating Stripe checkout to process transactions in under 2 seconds.&quot;
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-lt-blue uppercase tracking-wider block">
                2. Tech / Junior Software Engineer Example:
              </span>
              <p className="text-xs text-rose-700 font-mono line-through">
                Weak: &quot;Worked on database queries and fixed application performance issues.&quot;
              </p>
              <p className="text-xs text-emerald-800 font-mono font-bold">
                Recruiter-Ready: &quot;Optimized PostgreSQL database query indexing and caching layers with Redis, slashing API response latency by 42% for 15,000+ daily active users.&quot;
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-lt-blue uppercase tracking-wider block">
                3. Data / Non-Tech / Business Analyst Example:
              </span>
              <p className="text-xs text-rose-700 font-mono line-through">
                Weak: &quot;Created Power BI dashboards for monthly sales tracking.&quot;
              </p>
              <p className="text-xs text-emerald-800 font-mono font-bold">
                Recruiter-Ready: &quot;Engineered automated Power BI telemetry dashboards connecting 5 SQL databases, reducing monthly reporting turnaround time from 3 days to 4 hours.&quot;
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center p-8 bg-gradient-to-r from-lt-bg-soft via-indigo-50/50 to-lt-yellow/20 rounded-3xl border border-indigo-100 space-y-4">
          <h3 className="text-xl font-heading font-extrabold text-lt-blue-dark">
            Ready to test your resume against these standards?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Scan your resume for free, see your deterministic score, and fix weak bullets in our interactive Word-style editor.
          </p>
          <Link
            href="/check"
            className="inline-flex items-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-extrabold text-sm px-6 py-3 rounded-full shadow-md transition-all"
          >
            <span>Scan My Resume Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
