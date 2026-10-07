import { z } from "zod";

export const ContactSchema = z.object({
  fullName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  city: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  portfolio: z.string().default(""),
});

export const EducationItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  degree: z.string().default(""),
  institution: z.string().default(""),
  startYear: z.string().default(""),
  endYear: z.string().default(""),
  grade: z.string().default(""),
});

export const SkillGroupSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  group: z.string().default(""),
  items: z.array(z.string()).default([]),
});

export const ProjectItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  name: z.string().default(""),
  techStack: z.string().default(""),
  link: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});

export const ExperienceItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  role: z.string().default(""),
  company: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const CertificationItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  name: z.string().default(""),
  issuer: z.string().default(""),
  year: z.string().default(""),
});

export const StructuredResumeSchema = z.object({
  contact: ContactSchema.default({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    linkedin: "",
    github: "",
    portfolio: "",
  }),
  headline: z.string().default(""),
  summary: z.string().default(""),
  education: z.array(EducationItemSchema).default([]),
  skills: z.array(SkillGroupSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
  achievements: z.array(z.string()).default([]),
  sectionOrder: z
    .array(z.string())
    .default([
      "summary",
      "education",
      "skills",
      "projects",
      "experience",
      "certifications",
      "achievements",
    ]),
});

export type StructuredResume = z.infer<typeof StructuredResumeSchema>;
export type ContactInfo = z.infer<typeof ContactSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type SkillGroup = z.infer<typeof SkillGroupSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type CertificationItem = z.infer<typeof CertificationItemSchema>;
