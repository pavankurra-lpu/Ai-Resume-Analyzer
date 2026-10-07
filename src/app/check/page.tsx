"use client";

import React, { useState, useRef, ChangeEvent, DragEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProgressStepper from "@/components/ProgressStepper";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sparkles,
  ArrowRight,
  X,
  FileCheck,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase
} from "lucide-react";

export default function CheckResumePage() {
  const router = useRouter();

  // Tab: 'file' | 'text'
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text state
  const [resumeText, setResumeText] = useState("");

  // Primary fields
  const [experienceLevel, setExperienceLevel] = useState<"Fresher" | "0-2 yrs" | "2-5 yrs" | "5+ yrs">("Fresher");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Collapsed optional lead box: "Save my progress (optional)"
  const [showSaveProgress, setShowSaveProgress] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [collegeOrCompany, setCollegeOrCompany] = useState("");

  // UI / Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const analysisSteps = [
    { title: "Reading your resume", desc: "Extracting structural text & sections..." },
    { title: "Checking ATS compatibility", desc: "Verifying parseability, headings & layout..." },
    { title: "Scoring each section", desc: "Applying 100-point deterministic rubric..." },
    { title: "Preparing diagnostic report", desc: "Calculating line-by-line quick wins..." },
  ];

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = [".pdf", ".docx"];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      setErrorMessage("Please select a PDF or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds 5 MB. Please upload a smaller resume file.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (activeTab === "file" && !selectedFile) {
      errors.file = "Please upload your resume file (PDF or DOCX).";
    }

    if (activeTab === "text" && resumeText.trim().length < 150) {
      errors.resumeText = "Resume text must be at least 150 characters.";
    }

    // Optional fields format check if provided
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (phone.trim() && phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1800);

    try {
      const formData = new FormData();
      if (activeTab === "file" && selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("resumeText", resumeText);
      }

      formData.append("name", name.trim());
      formData.append("phone", phone.trim());
      formData.append("email", email.trim());
      formData.append("collegeOrCompany", collegeOrCompany.trim());
      formData.append("experienceLevel", experienceLevel);
      if (targetRole.trim()) formData.append("targetRole", targetRole.trim());
      if (jobDescription.trim()) formData.append("jobDescription", jobDescription.trim());
      formData.append("consent", "true");

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume. Please try again.");
      }

      setAnalysisStep(3);
      setTimeout(() => {
        router.push(`/report/${data.reportId}`);
      }, 500);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      {/* 4-STEP PROGRESS STEPPER */}
      <ProgressStepper currentStep={1} />

      {/* WHAT HAPPENS NEXT STRIP */}
      <div className="w-full bg-gradient-to-r from-lt-blue/10 via-amber-500/10 to-lt-yellow/10 border-b border-slate-200/60 py-2.5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center sm:justify-between text-xs text-slate-700 gap-2">
          <span className="font-bold flex items-center gap-1.5 text-lt-blue">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            What happens next:
          </span>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
            <span>1. Instant Score (out of 100)</span>
            <span>→</span>
            <span>2. Top Quick Wins</span>
            <span>→</span>
            <span>3. Word-Style Interactive Fixes</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {/* PAGE HEADER */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-lt-blue-dark tracking-tight">
            Check Your Resume for ATS & Recruiter Readiness
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Upload your resume or paste its text. Our deterministic engine will score your resume across 10 vital categories and give you line-by-line fixes.
          </p>
        </div>

        {/* MAIN FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-card border border-slate-200/90 shadow-soft p-6 sm:p-10 space-y-8"
        >
          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Analysis Failed</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* SECTION 1: UPLOAD RESUME */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-heading font-extrabold text-base text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-lt-blue text-white flex items-center justify-center text-xs">
                  1
                </span>
                <span>Your Resume</span>
              </span>

              {/* File / Paste Toggle */}
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("file");
                    setFieldErrors((prev) => ({ ...prev, resumeText: "" }));
                  }}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === "file"
                      ? "bg-white text-lt-blue-dark shadow-2xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("text");
                    setFieldErrors((prev) => ({ ...prev, file: "" }));
                  }}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === "text"
                      ? "bg-white text-lt-blue-dark shadow-2xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {/* TAB: FILE UPLOAD */}
            {activeTab === "file" && (
              <div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-lt-blue bg-lt-bg-soft/70 scale-[0.99]"
                      : selectedFile
                      ? "border-emerald-400 bg-emerald-50/40"
                      : fieldErrors.file
                      ? "border-rose-300 bg-rose-50/20"
                      : "border-slate-300 hover:border-lt-blue hover:bg-slate-50/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <span className="font-heading font-bold text-base text-slate-800">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                      >
                        Remove and choose another
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-lt-bg-soft text-lt-blue flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-heading font-bold text-base text-slate-800 block">
                          Click to upload, or drag and drop your resume
                        </span>
                        <span className="text-xs text-slate-500 block">
                          PDF or DOCX (Max 5 MB) • Scanned image PDFs not recommended
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {fieldErrors.file && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fieldErrors.file}</span>
                  </p>
                )}
              </div>
            )}

            {/* TAB: PASTE TEXT */}
            {activeTab === "text" && (
              <div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your full resume text here (Summary, Education, Experience, Projects, Skills)..."
                  rows={9}
                  className={`w-full rounded-xl border p-4 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-lt-blue ${
                    fieldErrors.resumeText
                      ? "border-rose-300 bg-rose-50/10"
                      : "border-slate-300 focus:border-lt-blue"
                  }`}
                />
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>Minimum 150 characters required</span>
                  <span>{resumeText.length} characters</span>
                </div>
                {fieldErrors.resumeText && (
                  <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{fieldErrors.resumeText}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: TARGET ROLE & EXPERIENCE LEVEL */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="font-heading font-extrabold text-base text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-lt-blue text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>Role & Experience</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Role */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Target Job Title / Role:
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Developer, Data Analyst"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-lt-blue focus:ring-2 focus:ring-lt-blue outline-none"
                />
                <p className="text-[11px] text-slate-500">
                  Helps calibrate keyword checks to your desired designation.
                </p>
              </div>

              {/* Experience Level */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Experience Level:
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-lt-blue focus:ring-2 focus:ring-lt-blue outline-none bg-white font-medium"
                >
                  <option value="Fresher">Fresher / College Student (0 yrs)</option>
                  <option value="0-2 yrs">Junior Professional (0-2 yrs)</option>
                  <option value="2-5 yrs">Mid-Level Professional (2-5 yrs)</option>
                  <option value="5+ yrs">Senior Professional (5+ yrs)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Freshers are fairly scored on projects and skills without penalizing lack of experience.
                </p>
              </div>
            </div>

            {/* Optional Job Description */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Job Description (Optional):
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description or LinkedIn job post to check keyword match percentage..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-lt-blue focus:ring-2 focus:ring-lt-blue outline-none"
              />
            </div>
          </div>

          {/* SECTION 3: COLLAPSED OPTIONAL BOX: SAVE MY PROGRESS */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
            <button
              type="button"
              onClick={() => setShowSaveProgress(!showSaveProgress)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-500" />
                <span className="font-heading font-bold text-xs sm:text-sm text-slate-800">
                  Save my progress (optional)
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              {showSaveProgress ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showSaveProgress && (
              <div className="p-5 pt-2 border-t border-slate-200 bg-white space-y-4 animate-in slide-in-from-top-1 duration-150">
                <p className="text-xs text-slate-500">
                  Provide your contact details if you want your name displayed on the report or want to access your resume history later.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-lt-blue outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-lt-blue outline-none"
                    />
                    {fieldErrors.email && (
                      <p className="text-[10px] text-rose-600">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-lt-blue outline-none"
                    />
                    {fieldErrors.phone && (
                      <p className="text-[10px] text-rose-600">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">College or Company</label>
                    <input
                      type="text"
                      value={collegeOrCompany}
                      onChange={(e) => setCollegeOrCompany(e.target.value)}
                      placeholder="e.g. VIT Vellore"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-lt-blue outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-3 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-black text-base sm:text-lg py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-lt-blue" />
                  <span>Check My Resume Free</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* PROGRESS MODAL / STEP LOADER */}
          {isSubmitting && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Analysis in Progress:
              </span>
              <div className="space-y-2">
                {analysisSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    {idx < analysisStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : idx === analysisStep ? (
                      <Loader2 className="w-4 h-4 text-lt-blue animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                    <span
                      className={
                        idx === analysisStep
                          ? "font-bold text-lt-blue-dark"
                          : idx < analysisStep
                          ? "text-slate-700"
                          : "text-slate-400"
                      }
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRIVACY FOOTER */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Free • Documents parsed in-memory and permanently erased.</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
