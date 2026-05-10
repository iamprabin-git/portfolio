import fs from "fs";
import path from "path";
import { getMongoDb, isMongoConfigured } from "./mongodb-client";
import { normalizeSkillIconKey } from "./skill-icons";

export { isMongoConfigured } from "./mongodb-client";
import type {
  Lead,
  LeadPriority,
  LeadReminderKind,
  LeadSource,
  LeadStatus,
  PortfolioData,
  Profile,
  Project,
  ProjectFeedback,
  Review,
  ReviewModerationStatus,
  Skill,
  Sponsor,
} from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "portfolio.json");

/** Single document holding the entire portfolio blob when using MongoDB. */
const SITE_DOC_ID = "main";

/** Stored row shape: full portfolio fields plus string `_id`. */
type PortfolioMongoDoc = PortfolioData & { _id: string };

const LEGACY_APPROVED_AT = "1970-01-01T00:00:00.000Z";

const defaultData: PortfolioData = {
  profile: {
    name: "Jordan Lee",
    title: "Web Developer",
    bio: "I design and build fast, accessible web experiences with modern tooling. Available for freelance and full-time roles.",
    email: "hello@example.com",
    address: "",
    phone: "",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    facebook: "",
    instagram: "",
    tiktok: "",
    whatsapp: "",
    location: "Remote · Worldwide",
    logoUrl: "",
    heroImageUrl:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&q=80",
  },
  projects: [
    {
      id: "sample-1",
      title: "Commerce dashboard",
      summary: "Analytics and inventory for a growing retail brand.",
      description:
        "Next.js dashboard with role-based access, charts, and webhook-driven inventory sync.",
      imageUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
      tags: ["Next.js", "TypeScript", "Tailwind CSS"],
      demoUrl: "https://example.com",
      repoUrl: "https://github.com",
      featured: true,
    },
  ],
  skills: [
    {
      id: "sk-1",
      name: "TypeScript",
      category: "Languages",
      icon: "braces",
      proficiency: 92,
      sinceYear: 2019,
    },
    {
      id: "sk-2",
      name: "React / Next.js",
      category: "Frontend",
      icon: "layers",
      proficiency: 95,
      sinceYear: 2018,
    },
    {
      id: "sk-3",
      name: "Node.js",
      category: "Backend",
      icon: "server",
      proficiency: 88,
      sinceYear: 2019,
    },
    {
      id: "sk-4",
      name: "REST & GraphQL",
      category: "APIs",
      icon: "webhook",
      proficiency: 90,
      sinceYear: 2019,
    },
    {
      id: "sk-5",
      name: "PostgreSQL",
      category: "Data",
      icon: "database",
      proficiency: 82,
      sinceYear: 2020,
    },
    {
      id: "sk-6",
      name: "Docker & CI/CD",
      category: "DevOps",
      icon: "package",
      proficiency: 78,
      sinceYear: 2021,
    },
  ],
  sponsors: [
    {
      id: "sp-1",
      name: "Vercel",
      logoUrl:
        "https://images.unsplash.com/photo-1618477388954-7852f32635db?w=200&q=80",
      websiteUrl: "https://vercel.com",
    },
    {
      id: "sp-2",
      name: "Stripe",
      logoUrl:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&q=80",
      websiteUrl: "https://stripe.com",
    },
    {
      id: "sp-3",
      name: "Linear",
      logoUrl:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&q=80",
      websiteUrl: "https://linear.app",
    },
  ],
  leads: [],
  reviews: [
    {
      id: "rv-1",
      authorName: "Sarah Chen",
      role: "Engineering Manager",
      company: "Northwind Labs",
      quote:
        "Shipped our MVP ahead of schedule with exceptional attention to UX and performance. Communication was clear throughout.",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      rating: 5,
      status: "approved",
      submittedAt: LEGACY_APPROVED_AT,
      source: "admin",
    },
    {
      id: "rv-2",
      authorName: "Marcus Webb",
      role: "Founder",
      company: "Studio Outline",
      quote:
        "Reliable partner for our product rebuild — thoughtful architecture, modern stack, and fast iteration cycles.",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
      rating: 5,
      status: "approved",
      submittedAt: LEGACY_APPROVED_AT,
      source: "admin",
    },
  ],
  projectFeedback: [],
};

export function clampRating(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(x) || x < 0) return 0;
  if (x > 5) return 5;
  return Math.round(x);
}

function normalizeReview(raw: unknown): Review | null {
  const r =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  if (!r) return null;
  const id = String(r.id ?? "");
  if (!id) return null;

  const st = r.status;
  const status: ReviewModerationStatus =
    st === "pending" || st === "rejected" || st === "approved"
      ? st
      : "approved";

  const submittedAt =
    typeof r.submittedAt === "string"
      ? r.submittedAt
      : status === "approved"
        ? LEGACY_APPROVED_AT
        : new Date().toISOString();

  return {
    id,
    authorName: String(r.authorName ?? ""),
    role: String(r.role ?? ""),
    company: String(r.company ?? ""),
    quote: String(r.quote ?? ""),
    avatarUrl: String(r.avatarUrl ?? ""),
    rating: clampRating(r.rating),
    status,
    submittedAt,
    source: r.source === "public" ? "public" : "admin",
  };
}

function normalizeReviews(arr: unknown): Review[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(normalizeReview)
    .filter((x): x is Review => x !== null);
}

function normalizeProjectFeedback(raw: unknown): ProjectFeedback | null {
  const r =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  if (!r) return null;
  const id = String(r.id ?? "");
  if (!id) return null;

  const st = r.status;
  const status =
    st === "approved" || st === "rejected" || st === "pending"
      ? st
      : "pending";

  return {
    id,
    projectId: String(r.projectId ?? ""),
    authorName: String(r.authorName ?? ""),
    email: String(r.email ?? ""),
    comment: String(r.comment ?? ""),
    rating: clampRating(r.rating),
    status,
    submittedAt:
      typeof r.submittedAt === "string"
        ? r.submittedAt
        : new Date().toISOString(),
  };
}

function normalizeProjectFeedbackList(arr: unknown): ProjectFeedback[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(normalizeProjectFeedback)
    .filter((x): x is ProjectFeedback => x !== null);
}

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
  "archived",
];

function normalizeLeadStatus(s: unknown): LeadStatus {
  return typeof s === "string" && LEAD_STATUSES.includes(s as LeadStatus)
    ? (s as LeadStatus)
    : "new";
}

function normalizeLeadSource(s: unknown): LeadSource {
  return s === "manual" ? "manual" : "contact_form";
}

function normalizeLeadPriority(raw: unknown): LeadPriority {
  return raw === "low" || raw === "high" ? raw : "medium";
}

function normalizeLeadReminderKind(raw: unknown): LeadReminderKind | "" {
  return raw === "call" || raw === "sms" || raw === "meeting" ? raw : "";
}

function normalizeLeadTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const t of raw) {
    if (typeof t !== "string") continue;
    const s = t.trim().slice(0, 32);
    if (s && out.length < 16) out.push(s);
  }
  return out;
}

function normalizeDealValue(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return 0;
  return Math.max(
    0,
    Math.min(Number.MAX_SAFE_INTEGER, Math.round(raw)),
  );
}

function normalizeLead(raw: unknown): Lead | null {
  const r =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  if (!r) return null;
  const id = String(r.id ?? "");
  if (!id) return null;

  return {
    id,
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    phone: String(r.phone ?? ""),
    company: String(r.company ?? ""),
    message: String(r.message ?? ""),
    source: normalizeLeadSource(r.source),
    status: normalizeLeadStatus(r.status),
    notes: String(r.notes ?? ""),
    conversationNotes: String(r.conversationNotes ?? ""),
    futurePlanNotes: String(r.futurePlanNotes ?? ""),
    nextFollowUpAt:
      typeof r.nextFollowUpAt === "string" ? r.nextFollowUpAt : "",
    reminderKind: normalizeLeadReminderKind(r.reminderKind),
    lastContactedAt:
      typeof r.lastContactedAt === "string" ? r.lastContactedAt : "",
    submittedAt:
      typeof r.submittedAt === "string"
        ? r.submittedAt
        : new Date().toISOString(),
    dealValue: normalizeDealValue(r.dealValue),
    priority: normalizeLeadPriority(r.priority),
    tags: normalizeLeadTags(r.tags),
  };
}

function normalizeLeads(arr: unknown): Lead[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeLead).filter((x): x is Lead => x !== null);
}

function pickProfileStr(
  raw: unknown,
  preserve: unknown,
  fallback: string,
): string {
  return typeof raw === "string"
    ? raw
    : typeof preserve === "string"
      ? preserve
      : fallback;
}

/**
 * @param preservePrevious — When merging API payloads, pass the on-disk profile so invalid/missing keys keep prior values instead of sample defaults.
 */
export function normalizeProfile(
  raw: unknown,
  preservePrevious?: Profile,
): Profile {
  const x = raw && typeof raw === "object" ? (raw as Partial<Profile>) : {};
  const p = preservePrevious;
  const d = defaultData.profile;
  return {
    ...d,
    ...x,
    name: pickProfileStr(x.name, p?.name, d.name),
    title: pickProfileStr(x.title, p?.title, d.title),
    bio: pickProfileStr(x.bio, p?.bio, d.bio),
    email: pickProfileStr(x.email, p?.email, d.email),
    address: pickProfileStr(x.address, p?.address, d.address),
    phone: pickProfileStr(x.phone, p?.phone, d.phone),
    github: pickProfileStr(x.github, p?.github, d.github),
    linkedin: pickProfileStr(x.linkedin, p?.linkedin, d.linkedin),
    facebook: pickProfileStr(x.facebook, p?.facebook, d.facebook),
    instagram: pickProfileStr(x.instagram, p?.instagram, d.instagram),
    tiktok: pickProfileStr(x.tiktok, p?.tiktok, d.tiktok),
    whatsapp: pickProfileStr(x.whatsapp, p?.whatsapp, d.whatsapp),
    location: pickProfileStr(x.location, p?.location, d.location),
    logoUrl:
      typeof x.logoUrl === "string"
        ? x.logoUrl
        : typeof p?.logoUrl === "string"
          ? p.logoUrl
          : "",
    heroImageUrl:
      typeof x.heroImageUrl === "string"
        ? x.heroImageUrl
        : typeof p?.heroImageUrl === "string"
          ? p.heroImageUrl
          : "",
  };
}

function normalizeSkill(raw: unknown, index: number): Skill {
  const x = raw && typeof raw === "object" ? (raw as Partial<Skill>) : {};
  const currentYear = new Date().getFullYear();

  let proficiency =
    typeof x.proficiency === "number" && Number.isFinite(x.proficiency)
      ? Math.round(x.proficiency)
      : 70;
  proficiency = Math.min(100, Math.max(0, proficiency));

  let sinceYear =
    typeof x.sinceYear === "number" && Number.isFinite(x.sinceYear)
      ? Math.round(x.sinceYear)
      : 0;
  if (
    sinceYear !== 0 &&
    (sinceYear < 1970 || sinceYear > currentYear + 1)
  ) {
    sinceYear = 0;
  }

  const id =
    typeof x.id === "string" && x.id.trim().length > 0
      ? x.id.trim()
      : `legacy-skill-${index}`;

  return {
    id,
    name:
      typeof x.name === "string" && x.name.trim() ? x.name.trim() : "Skill",
    category:
      typeof x.category === "string" && x.category.trim()
        ? x.category.trim()
        : "General",
    icon: normalizeSkillIconKey(x.icon),
    proficiency,
    sinceYear,
  };
}

export function normalizePortfolio(raw: unknown): PortfolioData {
  const d =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const adminPasswordHash =
    typeof d.adminPasswordHash === "string" &&
    d.adminPasswordHash.trim().length > 0
      ? d.adminPasswordHash.trim()
      : undefined;
  const base: PortfolioData = {
    profile: normalizeProfile(d.profile),
    projects: Array.isArray(d.projects) ? (d.projects as Project[]) : [],
    skills: Array.isArray(d.skills)
      ? (d.skills as unknown[]).map((raw, i) => normalizeSkill(raw, i))
      : [],
    sponsors: Array.isArray(d.sponsors) ? (d.sponsors as Sponsor[]) : [],
    reviews: normalizeReviews(d.reviews),
    projectFeedback: normalizeProjectFeedbackList(d.projectFeedback),
    leads: normalizeLeads(d.leads),
  };
  return adminPasswordHash !== undefined
    ? { ...base, adminPasswordHash }
    : base;
}

export function approvedReviews(reviews: Review[]): Review[] {
  return reviews.filter((r) => r.status === "approved");
}

export function pendingReviews(reviews: Review[]): Review[] {
  return reviews.filter((r) => r.status === "pending");
}

export function approvedFeedbackForProject(
  items: ProjectFeedback[],
  projectId: string,
): ProjectFeedback[] {
  return items.filter(
    (f) => f.projectId === projectId && f.status === "approved",
  );
}

export function pendingProjectFeedback(items: ProjectFeedback[]): ProjectFeedback[] {
  return items.filter((f) => f.status === "pending");
}

function ensureFile(): void {
  if (process.env.VERCEL) {
    return;
  }
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}

function readPortfolioFromDisk(): PortfolioData {
  if (!fs.existsSync(DATA_PATH)) {
    if (process.env.VERCEL) {
      console.warn(
        "[portfolio-store] data/portfolio.json missing on serverless host; using embedded defaults.",
      );
      return normalizePortfolio(defaultData);
    }
    ensureFile();
  }
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return normalizePortfolio(JSON.parse(raw) as unknown);
  } catch (err) {
    console.error("[portfolio-store] Failed to read or parse portfolio JSON:", err);
    return normalizePortfolio(defaultData);
  }
}

function writePortfolioToDisk(data: PortfolioData): void {
  ensureFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function portfolioCollectionName(): string {
  return process.env.MONGODB_COLLECTION?.trim() || "site";
}

async function readPortfolioFromMongo(): Promise<PortfolioData | null> {
  const db = await getMongoDb();
  if (!db) return null;
  const doc = await db
    .collection<PortfolioMongoDoc>(portfolioCollectionName())
    .findOne({ _id: SITE_DOC_ID });
  if (!doc) return null;
  const { _id: _omit, ...rest } = doc;
  void _omit;
  return normalizePortfolio(rest);
}

async function writePortfolioToMongo(data: PortfolioData): Promise<void> {
  const db = await getMongoDb();
  if (!db) throw new Error("MongoDB client unavailable.");
  const doc: PortfolioMongoDoc = { _id: SITE_DOC_ID, ...data };
  await db
    .collection<PortfolioMongoDoc>(portfolioCollectionName())
    .replaceOne({ _id: SITE_DOC_ID }, doc, { upsert: true });
}

/**
 * Loads portfolio data. Uses MongoDB when `MONGODB_URI` is set (collection
 * defaults to `site`, document `_id: main`). Otherwise reads/writes
 * `data/portfolio.json`. First Mongo read seeds from disk when the document is missing.
 */
export async function readPortfolio(): Promise<PortfolioData> {
  if (isMongoConfigured()) {
    try {
      const data = await readPortfolioFromMongo();
      if (!data) {
        const seed = readPortfolioFromDisk();
        try {
          await writePortfolioToMongo(seed);
        } catch (seedErr) {
          console.error(
            "[portfolio-store] MongoDB seed upsert failed (site still loads from seed):",
            seedErr,
          );
        }
        return seed;
      }
      return data;
    } catch (err) {
      console.error(
        "[portfolio-store] MongoDB unavailable; falling back to disk or defaults:",
        err,
      );
      return readPortfolioFromDisk();
    }
  }
  return readPortfolioFromDisk();
}

export async function writePortfolio(data: PortfolioData): Promise<void> {
  const normalized = normalizePortfolio(data);
  if (isMongoConfigured()) {
    await writePortfolioToMongo(normalized);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error(
      "Portfolio CMS saves require MONGODB_URI on Vercel (filesystem is read-only). Set env vars and redeploy.",
    );
  }
  writePortfolioToDisk(normalized);
}
