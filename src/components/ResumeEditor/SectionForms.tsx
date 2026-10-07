"use client";

import React, { useState } from "react";
import {
  StructuredResume,
  EducationItem,
  SkillGroup,
  ProjectItem,
  ExperienceItem,
  CertificationItem,
} from "@/lib/resumeTypes";
import { evaluateBulletPoint } from "@/lib/resumeRules";
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import GlossaryTooltip from "../GlossaryTooltip";
import { CoachModalData } from "./AiCoachModal";

interface SectionFormsProps {
  resume: StructuredResume;
  onChange: (updated: StructuredResume) => void;
  onOpenCoach: (data: CoachModalData) => void;
  targetRole?: string;
}

export default function SectionForms({
  resume,
  onChange,
  onOpenCoach,
  targetRole = "Software Engineer",
}: SectionFormsProps) {
  // Update Contact
  const updateContact = (key: keyof StructuredResume["contact"], val: string) => {
    onChange({
      ...resume,
      contact: { ...resume.contact, [key]: val },
    });
  };

  // Helper for bullet change
  const handleBulletChange = (
    sectionType: "projects" | "experience",
    itemIdx: number,
    bulletIdx: number,
    val: string
  ) => {
    if (sectionType === "projects") {
      const updated = [...resume.projects];
      updated[itemIdx].bullets[bulletIdx] = val;
      onChange({ ...resume, projects: updated });
    } else {
      const updated = [...resume.experience];
      updated[itemIdx].bullets[bulletIdx] = val;
      onChange({ ...resume, experience: updated });
    }
  };

  const handleAddBullet = (sectionType: "projects" | "experience", itemIdx: number) => {
    if (sectionType === "projects") {
      const updated = [...resume.projects];
      updated[itemIdx].bullets.push("Engineered modern functionality with test coverage.");
      onChange({ ...resume, projects: updated });
    } else {
      const updated = [...resume.experience];
      updated[itemIdx].bullets.push("Developed responsive workflows in agile sprints.");
      onChange({ ...resume, experience: updated });
    }
  };

  const handleRemoveBullet = (
    sectionType: "projects" | "experience",
    itemIdx: number,
    bulletIdx: number
  ) => {
    if (sectionType === "projects") {
      const updated = [...resume.projects];
      updated[itemIdx].bullets.splice(bulletIdx, 1);
      onChange({ ...resume, projects: updated });
    } else {
      const updated = [...resume.experience];
      updated[itemIdx].bullets.splice(bulletIdx, 1);
      onChange({ ...resume, experience: updated });
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. CONTACT INFO SECTION */}
      <section id="section-contact" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">
              Contact & Header Details
            </h3>
            <p className="text-xs text-slate-500">How recruiters get in touch with you.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={resume.contact.fullName}
              onChange={(e) => updateContact("fullName", e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-lt-blue"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Target Job Title</label>
            <input
              type="text"
              value={resume.headline}
              onChange={(e) => onChange({ ...resume, headline: e.target.value })}
              placeholder="e.g. Full Stack Developer"
              className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-lt-blue"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              value={resume.contact.email}
              onChange={(e) => updateContact("email", e.target.value)}
              placeholder="rahul.sharma.dev@gmail.com"
              className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-lt-blue"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Mobile (10 Digits)</label>
            <input
              type="tel"
              value={resume.contact.phone}
              onChange={(e) => updateContact("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
              className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-lt-blue"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">City, State Only</label>
            <input
              type="text"
              value={resume.contact.city}
              onChange={(e) => updateContact("city", e.target.value)}
              placeholder="e.g. Bengaluru, Karnataka"
              className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-lt-blue"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">LinkedIn Profile</label>
            <input
              type="text"
              value={resume.contact.linkedin}
              onChange={(e) => updateContact("linkedin", e.target.value)}
              placeholder="linkedin.com/in/yourhandle"
              className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-lt-blue"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">GitHub Profile</label>
            <input
              type="text"
              value={resume.contact.github}
              onChange={(e) => updateContact("github", e.target.value)}
              placeholder="github.com/yourhandle"
              className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-lt-blue"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Portfolio (Optional)</label>
            <input
              type="text"
              value={resume.contact.portfolio}
              onChange={(e) => updateContact("portfolio", e.target.value)}
              placeholder="yourname.dev"
              className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:ring-2 focus:ring-lt-blue"
            />
          </div>
        </div>
      </section>

      {/* 2. PROFESSIONAL SUMMARY */}
      <section id="section-summary" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-1.5">
              <span>Career Summary</span>
              <GlossaryTooltip termKey="summary" />
            </h3>
            <p className="text-xs text-slate-500">2-3 punchy lines highlighting target role + skills + 1 proof point.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              onOpenCoach({
                fieldPath: "summary",
                fieldLabel: "Career Summary",
                currentText: resume.summary,
                targetRole,
              })
            }
            className="inline-flex items-center gap-1 text-xs font-bold text-lt-blue hover:text-lt-blue-dark bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-lt-blue" />
            <span>AI Coach Fix</span>
          </button>
        </div>

        <div>
          <textarea
            rows={3}
            value={resume.summary}
            onChange={(e) => onChange({ ...resume, summary: e.target.value })}
            placeholder="Target role + top 3 skills + proof point (30-60 words)..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lt-blue"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Aim for 30 to 60 words, no first-person pronouns (&quot;I&quot;)</span>
            <span>{resume.summary.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      </section>

      {/* 3. EDUCATION SECTION */}
      <section id="section-education" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">Education</h3>
            <p className="text-xs text-slate-500">Degrees, colleges, passing years, and CGPA.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const newEdu: EducationItem = {
                id: Math.random().toString(36).substring(2, 9),
                degree: "B.Tech in Computer Science and Engineering",
                institution: "College Name",
                startYear: "2020",
                endYear: "2024",
                grade: "8.5 CGPA",
              };
              onChange({ ...resume, education: [...resume.education, newEdu] });
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-lt-blue hover:text-lt-blue-dark bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        </div>

        <div className="space-y-4">
          {resume.education.map((edu, idx) => (
            <div key={edu.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 relative text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Education Entry #{idx + 1}</span>
                {resume.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...resume.education];
                      updated.splice(idx, 1);
                      onChange({ ...resume, education: updated });
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Degree & Branch</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...resume.education];
                      updated[idx].degree = e.target.value;
                      onChange({ ...resume, education: updated });
                    }}
                    placeholder="B.Tech in Computer Science"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Institution / University</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...resume.education];
                      updated[idx].institution = e.target.value;
                      onChange({ ...resume, education: updated });
                    }}
                    placeholder="RV College of Engineering"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={edu.endYear}
                    onChange={(e) => {
                      const updated = [...resume.education];
                      updated[idx].endYear = e.target.value;
                      onChange({ ...resume, education: updated });
                    }}
                    placeholder="2024"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">CGPA or Percentage</label>
                  <input
                    type="text"
                    value={edu.grade}
                    onChange={(e) => {
                      const updated = [...resume.education];
                      updated[idx].grade = e.target.value;
                      onChange({ ...resume, education: updated });
                    }}
                    placeholder="8.5 / 10 CGPA"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TECHNICAL SKILLS SECTION */}
      <section id="section-skills" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-1.5">
              <span>Technical Skills</span>
              <GlossaryTooltip termKey="keyword" />
            </h3>
            <p className="text-xs text-slate-500">Categorized buckets (Languages, Frameworks, Tools) with 8 to 20 skills.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const newGroup: SkillGroup = {
                id: Math.random().toString(36).substring(2, 9),
                group: "Tools & Platforms",
                items: ["Git", "Docker", "Linux"],
              };
              onChange({ ...resume, skills: [...resume.skills, newGroup] });
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-lt-blue hover:text-lt-blue-dark bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Group</span>
          </button>
        </div>

        <div className="space-y-4">
          {resume.skills.map((group, idx) => (
            <div key={group.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={group.group}
                  onChange={(e) => {
                    const updated = [...resume.skills];
                    updated[idx].group = e.target.value;
                    onChange({ ...resume, skills: updated });
                  }}
                  className="font-bold text-slate-800 bg-white px-2.5 py-1 border border-slate-200 rounded-lg text-xs"
                />
                {resume.skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...resume.skills];
                      updated.splice(idx, 1);
                      onChange({ ...resume, skills: updated });
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Skills as chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {group.items.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-medium shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...resume.skills];
                        updated[idx].items.splice(sIdx, 1);
                        onChange({ ...resume, skills: updated });
                      }}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add skill input */}
              <div className="pt-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a skill and press Enter (e.g. Next.js)..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        const updated = [...resume.skills];
                        if (!updated[idx].items.includes(val)) {
                          updated[idx].items.push(val);
                          onChange({ ...resume, skills: updated });
                        }
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-lt-blue"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PROJECTS SECTION */}
      <section id="section-projects" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-1.5">
              <span>Projects</span>
              <GlossaryTooltip termKey="metric" />
            </h3>
            <p className="text-xs text-slate-500">Your #1 proof of practical coding. Each needs a tech stack and 2-3 bullets with numbers.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const newProj: ProjectItem = {
                id: Math.random().toString(36).substring(2, 9),
                name: "Full Stack Web App",
                techStack: "React, Node.js, PostgreSQL",
                link: "https://github.com/yourhandle/project",
                bullets: [
                  "Architected responsive user interface with Next.js, serving 300+ monthly active test users.",
                  "Engineered RESTful APIs with Express and JWT authentication for secure data transactions.",
                ],
              };
              onChange({ ...resume, projects: [...resume.projects, newProj] });
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-lt-blue hover:text-lt-blue-dark bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>

        <div className="space-y-5">
          {resume.projects.map((proj, pIdx) => (
            <div key={proj.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Project #{pIdx + 1}</span>
                {resume.projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...resume.projects];
                      updated.splice(pIdx, 1);
                      onChange({ ...resume, projects: updated });
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Project Name</label>
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => {
                      const updated = [...resume.projects];
                      updated[pIdx].name = e.target.value;
                      onChange({ ...resume, projects: updated });
                    }}
                    placeholder="AI Resume Screening App"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Tech Stack Used</label>
                  <input
                    type="text"
                    value={proj.techStack}
                    onChange={(e) => {
                      const updated = [...resume.projects];
                      updated[pIdx].techStack = e.target.value;
                      onChange({ ...resume, projects: updated });
                    }}
                    placeholder="React, Node.js, PostgreSQL"
                    className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Bullets List */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <span>Bullet Points</span>
                    <GlossaryTooltip termKey="actionverb" />
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddBullet("projects", pIdx)}
                    className="text-xs text-lt-blue hover:underline font-bold"
                  >
                    + Add Bullet
                  </button>
                </div>

                {proj.bullets.map((b, bIdx) => {
                  const evalResult = evaluateBulletPoint(b);

                  return (
                    <div key={bIdx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={b}
                          onChange={(e) => handleBulletChange("projects", pIdx, bIdx, e.target.value)}
                          className="flex-1 p-2 border border-slate-200 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-lt-blue"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenCoach({
                                fieldPath: `projects.${pIdx}.bullets.${bIdx}`,
                                fieldLabel: `${proj.name} Bullet ${bIdx + 1}`,
                                currentText: b,
                                targetRole,
                              })
                            }
                            className="p-1.5 text-lt-blue hover:bg-blue-50 rounded-lg border border-blue-100"
                            title="Improve with AI Coach"
                          >
                            <Sparkles className="w-4 h-4 text-lt-blue" />
                          </button>
                          {proj.bullets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet("projects", pIdx, bIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                              title="Delete bullet"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Live Feedback Chips per Bullet */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {evalResult.feedbackChips.map((chip, cIdx) => (
                          <span
                            key={cIdx}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              chip.type === "good"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : chip.type === "warn"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {chip.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. WORK EXPERIENCE / INTERNSHIPS */}
      <section id="section-experience" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-900">
              Work Experience / Internships
            </h3>
            <p className="text-xs text-slate-500">Internships, training, or full-time roles (optional for freshers).</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const newExp: ExperienceItem = {
                id: Math.random().toString(36).substring(2, 9),
                role: "Software Engineering Intern",
                company: "Tech Solutions Pvt Ltd",
                location: "Bengaluru, India",
                startDate: "Jan 2024",
                endDate: "Jun 2024",
                current: false,
                bullets: [
                  "Engineered 5 REST API endpoints in Node.js, accelerating transaction processing by 32%.",
                ],
              };
              onChange({ ...resume, experience: [...resume.experience, newExp] });
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-lt-blue hover:text-lt-blue-dark bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        </div>

        {resume.experience.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No work experience added yet. (As a fresher, strong projects carry heavy rubric points!)
          </p>
        ) : (
          <div className="space-y-4">
            {resume.experience.map((exp, eIdx) => (
              <div key={exp.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">Experience #{eIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...resume.experience];
                      updated.splice(eIdx, 1);
                      onChange({ ...resume, experience: updated });
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Role / Job Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const updated = [...resume.experience];
                        updated[eIdx].role = e.target.value;
                        onChange({ ...resume, experience: updated });
                      }}
                      placeholder="Software Engineer Intern"
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Company & Location</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...resume.experience];
                        updated[eIdx].company = e.target.value;
                        onChange({ ...resume, experience: updated });
                      }}
                      placeholder="TechCorp, Bengaluru"
                      className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Bullets:</span>
                    <button
                      type="button"
                      onClick={() => handleAddBullet("experience", eIdx)}
                      className="text-xs text-lt-blue hover:underline font-bold"
                    >
                      + Add Bullet
                    </button>
                  </div>
                  {exp.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={b}
                        onChange={(e) => handleBulletChange("experience", eIdx, bIdx, e.target.value)}
                        className="flex-1 p-2 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onOpenCoach({
                            fieldPath: `experience.${eIdx}.bullets.${bIdx}`,
                            fieldLabel: `${exp.role} Bullet ${bIdx + 1}`,
                            currentText: b,
                            targetRole,
                          })
                        }
                        className="p-1.5 text-lt-blue hover:bg-blue-50 rounded-lg border border-blue-100"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet("experience", eIdx, bIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
