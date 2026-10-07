import React from "react";
import Link from "next/link";
import DeleteDataForm from "@/components/DeleteDataForm";
import { Shield, Lock, Trash2, Database, Mail, ArrowLeft, Phone, Clock } from "lucide-react";

export default function PrivacyPage() {
  const counsellorPhone = process.env.COUNSELLOR_PHONE || "+919876543210";
  const retentionDays = process.env.RETENTION_DAYS || "30";

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-lt-blue hover:underline mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-lt-blue flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-lt-blue-dark">
                Privacy Policy & Data Security
              </h1>
              <p className="text-xs text-slate-500">Learners Track Data Governance • Updated October 2026</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card p-6 sm:p-10 border border-slate-200/80 shadow-soft space-y-6 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-emerald-600" />
              <span>1. Immediate File Deletion Guarantee</span>
            </h2>
            <p>
              When you upload a PDF or DOCX file to Resume Checker by Learners Track, the document is processed exclusively in transient server memory to extract textual content. <strong>The original binary file is permanently deleted immediately after text extraction.</strong> We do not store, archive, or retain your raw resume files on our file systems or cloud buckets.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>2. {retentionDays}-Day Automated Retention Policy</span>
            </h2>
            <p>
              In accordance with strict data minimization principles, <strong>all candidate records, parsed resumes, generated reports, resume versions, and email audit logs are subject to a strict {retentionDays}-day retention period</strong>. Records exceeding {retentionDays} days are automatically and irreversibly purged from our database via our automated cleanup scheduler.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-lt-blue" />
              <span>3. What Information We Store Temporarily</span>
            </h2>
            <p>
              To generate, retrieve, and calibrate your personalized score report, we retain:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Your contact information: Full Name, 10-digit Mobile Number, and Email Address.</li>
              <li>Academic & Professional details: College or Company Name, Experience Level, and Target Role.</li>
              <li>Calculated evaluation scores across the 10 rubric categories and ATS checks.</li>
              <li>Extracted resume text and editable drafts required to render your interactive editor.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>4. How We Use Your Data</span>
            </h2>
            <p>
              Your contact details and evaluation results are used solely to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Display your score report, Before vs After progression comparisons, and downloadable PDF/DOCX resumes.</li>
              <li>Enable Learners Track academic counsellors to reach out via WhatsApp or phone with career guidance and relevant training course recommendations.</li>
              <li>Maintain rate limits and security against automated abuse.</li>
            </ul>
            <p className="pt-1">
              <strong>We never sell, rent, or trade your personal information to third-party advertisers or recruitment agencies.</strong>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600" />
              <span>5. Support & Direct Inquiries</span>
            </h2>
            <p>
              If you have any questions about data processing or privacy practices:
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
              <p><strong>Email:</strong> privacy@learnerstrack.com</p>
              <p><strong>Counsellor Helpline:</strong> {counsellorPhone}</p>
              <p><strong>Entity:</strong> Learners Track EdTech Private Limited</p>
            </div>
          </section>
        </div>

        {/* SELF-SERVICE DATA DELETION WIDGET */}
        <DeleteDataForm />

        <div className="text-center">
          <Link
            href="/check"
            className="inline-flex items-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all"
          >
            <span>Scan My Resume Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
