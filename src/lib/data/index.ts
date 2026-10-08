import fs from "fs";
import path from "path";
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

// Local File Store Fallback (used when DATABASE_URL is missing or unavailable)
interface LocalStoreState {
  leads: Record<string, any>;
  reports: Record<string, any>;
  resumes: Record<string, any>;
  resumeVersions: Record<string, any>;
}

const LOCAL_STORE_FILE = path.join(process.cwd(), ".local-store.json");

function getLocalState(): LocalStoreState {
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    // ignore
  }
  return { leads: {}, reports: {}, resumes: {}, resumeVersions: {} };
}

function saveLocalState(state: LocalStoreState) {
  try {
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    // ignore
  }
}

const hasDbUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);

/**
 * Storage / Data Access Abstraction Layer
 * All database operations are routed through this module.
 * If DATABASE_URL is missing, falls back seamlessly to a local file store.
 */
export const dataStore = {
  async createLead(data: CreateLeadInput) {
    if (hasDbUrl) {
      try {
        return await prisma.lead.create({
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
      } catch (err) {
        console.warn("Prisma lead create failed, using local store fallback:", err);
      }
    }

    const state = getLocalState();
    const id = "lead_" + Math.random().toString(36).substring(2, 11);
    const lead = {
      id,
      name: data.name || null,
      phone: data.phone || null,
      email: data.email || null,
      collegeOrCompany: data.collegeOrCompany || null,
      experienceLevel: data.experienceLevel || "Fresher",
      targetRole: data.targetRole || null,
      jobDescription: data.jobDescription || null,
      consent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.leads[id] = lead;
    saveLocalState(state);
    return lead;
  },

  async getLead(id: string) {
    if (hasDbUrl) {
      try {
        return await prisma.lead.findUnique({
          where: { id },
        });
      } catch (err) {
        // fallback
      }
    }
    const state = getLocalState();
    return state.leads[id] || null;
  },

  async createReport(data: CreateReportInput) {
    if (hasDbUrl) {
      try {
        return await prisma.report.create({
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
      } catch (err) {
        console.warn("Prisma report create failed, using local store fallback:", err);
      }
    }

    const state = getLocalState();
    const id = "report_" + Math.random().toString(36).substring(2, 11);
    const report = {
      id,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.reports[id] = report;
    saveLocalState(state);
    return report;
  },

  async getReport(id: string) {
    if (hasDbUrl) {
      try {
        const found = await prisma.report.findUnique({
          where: { id },
          include: {
            lead: true,
            resumes: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });
        if (found) return found;
      } catch (err) {
        // fallback
      }
    }

    const state = getLocalState();
    const rep = state.reports[id];
    if (!rep) return null;
    const lead = state.leads[rep.leadId] || null;
    const relatedResumes = Object.values(state.resumes).filter((r: any) => r.baseReportId === id);
    return {
      ...rep,
      lead,
      resumes: relatedResumes,
    };
  },

  async createResume(data: CreateResumeInput) {
    if (hasDbUrl) {
      try {
        return await prisma.resume.create({
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
      } catch (err) {
        console.warn("Prisma resume create failed, using local store fallback:", err);
      }
    }

    const state = getLocalState();
    const id = "res_" + Math.random().toString(36).substring(2, 11);
    const verId = "ver_" + Math.random().toString(36).substring(2, 11);
    const versionObj = {
      id: verId,
      resumeId: id,
      contentJson: JSON.stringify(data.content),
      createdAt: new Date().toISOString(),
    };
    state.resumeVersions[verId] = versionObj;

    const resumeObj = {
      id,
      leadId: data.leadId,
      baseReportId: data.baseReportId || null,
      contentJson: JSON.stringify(data.content),
      templateId: data.templateId || "modern",
      explanationLanguage: data.explanationLanguage || "en",
      status: data.status || "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lead: state.leads[data.leadId] || null,
      versions: [versionObj],
    };
    state.resumes[id] = resumeObj;
    saveLocalState(state);
    return resumeObj;
  },

  async getResume(id: string) {
    if (hasDbUrl) {
      try {
        const found = await prisma.resume.findUnique({
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
        if (found) return found;
      } catch (err) {
        // fallback
      }
    }

    const state = getLocalState();
    const r = state.resumes[id];
    if (!r) return null;
    const lead = state.leads[r.leadId] || null;
    const baseReport = r.baseReportId ? state.reports[r.baseReportId] || null : null;
    const versions = Object.values(state.resumeVersions).filter((v: any) => v.resumeId === id);
    return {
      ...r,
      lead,
      baseReport,
      versions,
    };
  },

  async findResumeByReport(reportId: string) {
    if (hasDbUrl) {
      try {
        const found = await prisma.resume.findFirst({
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
        if (found) return found;
      } catch (err) {
        // fallback
      }
    }

    const state = getLocalState();
    const r = Object.values(state.resumes).find((res: any) => res.baseReportId === reportId);
    if (!r) return null;
    const lead = state.leads[r.leadId] || null;
    const baseReport = state.reports[reportId] || null;
    const versions = Object.values(state.resumeVersions).filter((v: any) => v.resumeId === r.id);
    return {
      ...r,
      lead,
      baseReport,
      versions,
    };
  },

  async updateResume(id: string, data: UpdateResumeInput) {
    const contentString = JSON.stringify(data.content);

    if (hasDbUrl) {
      try {
        await prisma.resumeVersion.create({
          data: {
            resumeId: id,
            contentJson: contentString,
          },
        });

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

        return await prisma.resume.update({
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
      } catch (err) {
        console.warn("Prisma update failed, using local fallback:", err);
      }
    }

    const state = getLocalState();
    const r = state.resumes[id];
    if (!r) throw new Error("Resume not found in local store");

    const verId = "ver_" + Math.random().toString(36).substring(2, 11);
    state.resumeVersions[verId] = {
      id: verId,
      resumeId: id,
      contentJson: contentString,
      createdAt: new Date().toISOString(),
    };

    r.contentJson = contentString;
    if (data.templateId) r.templateId = data.templateId;
    if (data.explanationLanguage) r.explanationLanguage = data.explanationLanguage;
    if (data.status) r.status = data.status;
    r.updatedAt = new Date().toISOString();

    state.resumes[id] = r;
    saveLocalState(state);

    const versions = Object.values(state.resumeVersions).filter((v: any) => v.resumeId === id);
    return {
      ...r,
      versions,
    };
  },

  async getResumeVersion(versionId: string) {
    if (hasDbUrl) {
      try {
        return await prisma.resumeVersion.findUnique({
          where: { id: versionId },
        });
      } catch (err) {
        // fallback
      }
    }

    const state = getLocalState();
    return state.resumeVersions[versionId] || null;
  },

  async deleteUserData(email: string) {
    if (hasDbUrl) {
      try {
        const leads = await prisma.lead.findMany({
          where: { email: { equals: email.trim() } },
          select: { id: true },
        });

        if (leads.length === 0) {
          return { count: 0 };
        }

        const leadIds = leads.map((l) => l.id);
        const result = await prisma.lead.deleteMany({
          where: { id: { in: leadIds } },
        });

        return { count: result.count };
      } catch (err) {
        // fallback
      }
    }

    const state = getLocalState();
    let count = 0;
    Object.keys(state.leads).forEach((leadId) => {
      if (state.leads[leadId].email?.toLowerCase() === email.trim().toLowerCase()) {
        delete state.leads[leadId];
        count++;
      }
    });
    saveLocalState(state);
    return { count };
  },
};
