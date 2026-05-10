export type Profile = {
  name: string;
  title: string;
  bio: string;
  email: string;
  /** Postal / studio address; shown on Contact (falls back to location if empty). */
  address: string;
  phone: string;
  github: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  location: string;
  /** Logo image URL for header & footer (square-ish works best). Falls back to initials if empty. */
  logoUrl: string;
  /** Shown in the homepage hero (optional URL). */
  heroImageUrl: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string;
  tags: string[];
  demoUrl: string;
  repoUrl: string;
  featured: boolean;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  /** Lucide-backed icon key from `SKILL_ICONS` in `@/lib/skill-icons`; empty = sparkle fallback in UI. */
  icon: string;
  /** Self-assessed mastery for charts (0–100). */
  proficiency: number;
  /** Calendar year you started using this skill; 0 hides it from the timeline. */
  sinceYear: number;
};

export type Sponsor = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
};

export type ReviewModerationStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: string;
  authorName: string;
  /** Job title or relation, e.g. “Product Lead”. */
  role: string;
  company: string;
  quote: string;
  avatarUrl: string;
  /** 1–5 stars; 0 means hide stars. */
  rating: number;
  status: ReviewModerationStatus;
  /** ISO timestamp when submitted (optional for legacy admin-only rows). */
  submittedAt: string;
  source: "admin" | "public";
};

export type ProjectFeedbackStatus = "pending" | "approved" | "rejected";

export type ProjectFeedback = {
  id: string;
  projectId: string;
  authorName: string;
  email: string;
  comment: string;
  /** 1–5 stars; 0 hides stars in UI. */
  rating: number;
  status: ProjectFeedbackStatus;
  submittedAt: string;
};

/** Source of a sales / inquiry lead */
export type LeadSource = "contact_form" | "manual";

/** Pipeline stage for follow-up CRM */
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost"
  | "archived";

export type LeadPriority = "low" | "medium" | "high";

/** Touchpoint type for the next follow-up reminder (admin CRM only). */
export type LeadReminderKind = "call" | "sms" | "meeting";

/** Potential customer — inquiries from the site or added manually in admin */
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  /** Internal notes (visible only in admin) */
  notes: string;
  /** Summary of what the prospect said on last calls/messages (admin CRM). */
  conversationNotes: string;
  /** Planned next actions / commitments (admin CRM). */
  futurePlanNotes: string;
  /** ISO datetime — optional reminder */
  nextFollowUpAt: string;
  /** When `nextFollowUpAt` is set: scheduled touchpoint type — empty = unspecified */
  reminderKind: LeadReminderKind | "";
  /** ISO datetime — last outreach */
  lastContactedAt: string;
  submittedAt: string;
  /** Estimated opportunity value (whole units — set your own currency). */
  dealValue: number;
  priority: LeadPriority;
  /** Short labels for segmentation (e.g. enterprise, referral). */
  tags: string[];
};

export type PortfolioData = {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  sponsors: Sponsor[];
  reviews: Review[];
  projectFeedback: ProjectFeedback[];
  leads: Lead[];
  /**
   * Scrypt hash (`v1$…`) saved via Admin → Settings. When present, login uses this
   * instead of `ADMIN_PASSWORD`. Never exposed on public APIs.
   */
  adminPasswordHash?: string;
};
