import prisma from "@/lib/prisma";
import { StructuredResume } from "@/lib/resumeTypes";

export interface CreateLeadInput {
  name?: string;
  phone?: string;
  email?: string;
  collegeOrCompany?: string;
  experienceLevel?: string;
  targetRole?: string;
  jobDescription?: string;
}

export interface CreateReportInput {
  leadId: string;
  overallScore: number;
  grade: string;
  summary: string;
  categoriesJson: string;
  topQuickWinsJson: string;
  jdMatchJson?: string | null;
  atsChecksJson: string;
  suggestedCoursesJson: string;
  rawTextPreview?: string;
  rawText?: string;
  isDemo?: boolean;
}

export interface CreateResumeInput {
  leadId: string;
  baseReportId?: string;
  content: StructuredResume;
  templateId?: string;
  explanationLanguage?: string;
  status?: string;
}

export interface UpdateResumeInput {
  content: StructuredResume;
  templateId?: string;
  explanationLanguage?: string;
  status?: string;
}

/**
 * Storage / Data Access Abstraction Layer
 * All database operations are routed through this module.
 * The underlying ORM/DB (Prisma, SQLite, PostgreSQL, external API) can be swapped here.
 */
export const dataStore = {
  async createLead(data: CreateLeadInput) {
    return prisma.lead.create({
      data: {
        name: data.name || null,
        phone: data.phone || null,
        email: data.email || null,
        collegeOrCompany: data.collegeOrCompany || null,
        experienceLevel: data.experienceLevel || "Fresher",
        targetRole: data.targetRole || null,
        jobDescription: data.jobDescription || null,
        consent: true,
      },
    });
  },

  async getLead(id: string) {
    return prisma.lead.findUnique({
      where: { id },
    });
  },

  async createReport(data: CreateReportInput) {
    return prisma.report.create({
      data: {
        leadId: data.leadId,
        overallScore: data.overallScore,
        grade: data.grade,
        summary: data.summary,
        categoriesJson: data.categoriesJson,
        topQuickWinsJson: data.topQuickWinsJson,
        jdMatchJson: data.jdMatchJson || null,
        atsChecksJson: data.atsChecksJson,
        suggestedCoursesJson: data.suggestedCoursesJson,
        rawTextPreview: data.rawTextPreview || null,
        rawText: data.rawText || null,
        isDemo: Boolean(data.isDemo),
      },
    });
  },

  async getReport(id: string) {
    return prisma.report.findUnique({
      where: { id },
      include: {
        lead: true,
        resumes: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  },

  async createResume(data: CreateResumeInput) {
    return prisma.resume.create({
      data: {
        leadId: data.leadId,
        baseReportId: data.baseReportId || null,
        contentJson: JSON.stringify(data.content),
        templateId: data.templateId || "modern",
        explanationLanguage: data.explanationLanguage || "en",
        status: data.status || "Draft",
        versions: {
          create: {
            contentJson: JSON.stringify(data.content),
          },
        },
      },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        lead: true,
      },
    });
  },

  async getResume(id: string) {
    return prisma.resume.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        lead: true,
        baseReport: true,
      },
    });
  },

  async findResumeByReport(reportId: string) {
    return prisma.resume.findFirst({
      where: { baseReportId: reportId },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        lead: true,
        baseReport: true,
      },
    });
  },

  async updateResume(id: string, data: UpdateResumeInput) {
    const contentString = JSON.stringify(data.content);

    // Save a new version snapshot
    await prisma.resumeVersion.create({
      data: {
        resumeId: id,
        contentJson: contentString,
      },
    });

    // Keep only latest 10 versions
    const allVersions = await prisma.resumeVersion.findMany({
      where: { resumeId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (allVersions.length > 10) {
      const toDelete = allVersions.slice(10).map((v) => v.id);
      await prisma.resumeVersion.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    return prisma.resume.update({
      where: { id },
      data: {
        contentJson: contentString,
        templateId: data.templateId,
        explanationLanguage: data.explanationLanguage,
        status: data.status,
      },
      include: {
        versions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        lead: true,
      },
    });
  },

  async getResumeVersion(versionId: string) {
    return prisma.resumeVersion.findUnique({
      where: { id: versionId },
    });
  },

  async deleteUserData(email: string) {
    const leads = await prisma.lead.findMany({
      where: { email: { equals: email.trim() } },
      select: { id: true },
    });

    if (leads.length === 0) {
      return { count: 0 };
    }

    const leadIds = leads.map((l) => l.id);

    // Cascade delete through lead relations
    const result = await prisma.lead.deleteMany({
      where: { id: { in: leadIds } },
    });

    return { count: result.count };
  },
};
