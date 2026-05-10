import type { Lead, LeadPriority, LeadStatus } from "./types";

/** Ordered stages for pipeline visualization */
export const CRM_PIPELINE_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
  "archived",
];

export function isTerminalLeadStatus(s: LeadStatus): boolean {
  return s === "won" || s === "lost" || s === "archived";
}

export function isActivePipelineStatus(s: LeadStatus): boolean {
  return !isTerminalLeadStatus(s);
}

/** Follow-up date is set and in the past (or now), and lead is still active */
export function leadFollowUpIsDue(lead: Lead): boolean {
  if (!lead.nextFollowUpAt.trim() || isTerminalLeadStatus(lead.status)) {
    return false;
  }
  return new Date(lead.nextFollowUpAt).getTime() <= Date.now();
}

export function leadsDueForFollowUp(leads: Lead[]): Lead[] {
  return leads.filter(leadFollowUpIsDue);
}

export function newLeads(leads: Lead[]): Lead[] {
  return leads.filter((l) => l.status === "new");
}

export function activePipelineLeads(leads: Lead[]): Lead[] {
  return leads.filter((l) => isActivePipelineStatus(l.status));
}

export function countLeadsByStatus(
  leads: Lead[],
  status: LeadStatus,
): number {
  return leads.filter((l) => l.status === status).length;
}

export function pipelineDealTotal(leads: Lead[]): number {
  return activePipelineLeads(leads).reduce((sum, l) => sum + l.dealValue, 0);
}

export function leadsInboundSince(leads: Lead[], sinceMs: number): Lead[] {
  return leads.filter((l) => new Date(l.submittedAt).getTime() >= sinceMs);
}

export function winRatePercent(leads: Lead[]): number | null {
  const won = leads.filter((l) => l.status === "won").length;
  const lost = leads.filter((l) => l.status === "lost").length;
  const denom = won + lost;
  if (denom === 0) return null;
  return Math.round((100 * won) / denom);
}

/** Fixed locale so SSR and browser agree (undefined caused Hindi digits vs ASCII hydration mismatches). */
const DEAL_FORMAT_LOCALE = "en-US";

export function formatDealNumber(n: number): string {
  return new Intl.NumberFormat(DEAL_FORMAT_LOCALE, {
    maximumFractionDigits: 0,
  }).format(Math.max(0, n));
}

export function prioritySortRank(p: LeadPriority): number {
  switch (p) {
    case "high":
      return 0;
    case "medium":
      return 1;
    default:
      return 2;
  }
}

export function leadMatchesSearch(lead: Lead, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    lead.name,
    lead.email,
    lead.phone,
    lead.company,
    lead.message,
    lead.notes,
    lead.conversationNotes,
    lead.futurePlanNotes,
    ...(lead.tags ?? []),
  ]
    .join("\n")
    .toLowerCase();
  return hay.includes(q);
}
