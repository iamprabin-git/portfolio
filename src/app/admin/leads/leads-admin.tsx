"use client";

import type { ComponentProps } from "react";
import type {
  Lead,
  LeadPriority,
  LeadReminderKind,
  LeadSource,
  LeadStatus,
} from "@/lib/types";
import {
  CRM_PIPELINE_ORDER,
  activePipelineLeads,
  countLeadsByStatus,
  formatDealNumber,
  isTerminalLeadStatus,
  leadFollowUpIsDue,
  leadMatchesSearch,
  leadsDueForFollowUp,
  leadsInboundSince,
  pipelineDealTotal,
  prioritySortRank,
  winRatePercent,
} from "@/lib/leads";
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Stable locale for dates/numbers in this client tree — avoids SSR vs browser hydration drift. */
const CRM_UI_LOCALE = "en-US";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
  archived: "Archived",
};

const STATUSES = Object.keys(STATUS_LABELS) as LeadStatus[];

const PRIORITY_LABEL: Record<LeadPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const REMINDER_LABEL: Record<LeadReminderKind, string> = {
  call: "Call",
  sms: "SMS",
  meeting: "Meeting",
};

function leadHasConversationLog(lead: Lead): boolean {
  return Boolean(
    lead.conversationNotes?.trim() || lead.futurePlanNotes?.trim(),
  );
}

function reminderBadgeClasses(kind: LeadReminderKind | ""): string {
  switch (kind) {
    case "call":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
    case "sms":
      return "border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-200";
    case "meeting":
      return "border-violet-500/40 bg-violet-500/10 text-violet-900 dark:text-violet-200";
    default:
      return "";
  }
}

function isoToDatetimeLocal(iso: string): string {
  if (!iso.trim()) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(local: string): string {
  if (!local.trim()) return "";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function badgeVariant(
  status: LeadStatus,
): ComponentProps<typeof Badge>["variant"] {
  switch (status) {
    case "new":
      return "destructive";
    case "won":
      return "default";
    case "lost":
    case "archived":
      return "outline";
    default:
      return "secondary";
  }
}

function priorityBadgeClass(p: LeadPriority): string {
  switch (p) {
    case "high":
      return "border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case "low":
      return "border-border bg-muted text-muted-foreground";
    default:
      return "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-200";
  }
}

function escapeCsvCell(cell: string): string {
  if (/[",\r\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

function downloadLeadsCsv(leads: Lead[]) {
  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "company",
    "status",
    "source",
    "dealValue",
    "priority",
    "tags",
    "submittedAt",
    "nextFollowUpAt",
    "lastContactedAt",
    "message",
    "notes",
    "conversationNotes",
    "futurePlanNotes",
    "reminderKind",
  ];
  const rows = leads.map((l) =>
    [
      l.id,
      l.name,
      l.email,
      l.phone,
      l.company,
      l.status,
      l.source,
      String(l.dealValue),
      l.priority,
      (l.tags ?? []).join("; "),
      l.submittedAt,
      l.nextFollowUpAt,
      l.lastContactedAt,
      l.message,
      l.notes,
      l.conversationNotes,
      l.futurePlanNotes,
      l.reminderKind,
    ].map((v) => escapeCsvCell(String(v))),
  );
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `crm-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function MetricCard({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "shadow-none transition-colors",
        highlight &&
          "border-primary/40 bg-[color-mix(in_oklab,var(--primary)_8%,var(--card))]",
      )}
    >
      <CardHeader className="space-y-1 pb-2">
        <CardDescription className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </CardDescription>
        <CardTitle className="font-heading text-2xl tabular-nums tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent className="pb-4 pt-0">
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function LeadsAdmin({ initial }: { initial: Lead[] }) {
  const [items, setItems] = useState(initial);
  const [segment, setSegment] = useState<"all" | "new" | "active" | "due">(
    "all",
  );
  const [stageFilter, setStageFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | LeadSource>("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "followup" | "value" | "priority" | "name"
  >("newest");
  const [q, setQ] = useState("");
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statsNow] = useState(() => Date.now());

  const stats = useMemo(() => {
    const sevenDaysAgo = statsNow - 7 * 24 * 60 * 60 * 1000;
    const active = activePipelineLeads(items);
    const due = leadsDueForFollowUp(items);
    const inbound7 = leadsInboundSince(items, sevenDaysAgo);
    const wr = winRatePercent(items);
    return {
      total: items.length,
      activeCount: active.length,
      pipelineValue: pipelineDealTotal(items),
      dueCount: due.length,
      newCount: items.filter((l) => l.status === "new").length,
      inbound7Count: inbound7.length,
      winRate: wr === null ? "—" : `${wr}%`,
    };
  }, [items, statsNow]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (segment === "new") list = list.filter((l) => l.status === "new");
    else if (segment === "active")
      list = list.filter((l) => !isTerminalLeadStatus(l.status));
    else if (segment === "due") list = list.filter(leadFollowUpIsDue);

    if (stageFilter !== "all")
      list = list.filter((l) => l.status === stageFilter);
    if (sourceFilter !== "all")
      list = list.filter((l) => l.source === sourceFilter);
    if (q.trim()) list = list.filter((l) => leadMatchesSearch(l, q));

    list.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.submittedAt.localeCompare(b.submittedAt);
        case "followup": {
          const ae = a.nextFollowUpAt.trim()
            ? new Date(a.nextFollowUpAt).getTime()
            : Infinity;
          const be = b.nextFollowUpAt.trim()
            ? new Date(b.nextFollowUpAt).getTime()
            : Infinity;
          return ae - be;
        }
        case "value":
          return b.dealValue - a.dealValue;
        case "priority": {
          const pr = prioritySortRank(a.priority) - prioritySortRank(b.priority);
          return pr !== 0 ? pr : a.name.localeCompare(b.name);
        }
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return b.submittedAt.localeCompare(a.submittedAt);
      }
    });

    return list;
  }, [items, segment, stageFilter, sourceFilter, sortBy, q]);

  const pipelineCounts = useMemo(() => {
    const map = {} as Record<LeadStatus, number>;
    for (const s of CRM_PIPELINE_ORDER) map[s] = countLeadsByStatus(items, s);
    return map;
  }, [items]);

  async function patchLead(id: string, body: Record<string, unknown>) {
    setError(null);
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError((data as { error?: string }).error ?? "Update failed");
      return;
    }
    const u = data as Lead;
    setItems((prev) => prev.map((x) => (x.id === u.id ? u : x)));
    setActiveLead((cur) => (cur?.id === u.id ? u : cur));
  }

  async function removeLead(id: string) {
    if (!confirm("Delete this contact permanently from the CRM?")) return;
    setError(null);
    const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError((data as { error?: string }).error ?? "Delete failed");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
    setActiveLead((cur) => (cur?.id === id ? null : cur));
  }

  function toggleStageFilter(stage: LeadStatus) {
    setStageFilter((cur) => (cur === stage ? "all" : stage));
    setSegment("all");
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-[color-mix(in_oklab,var(--card)_92%,var(--primary))] px-5 py-8 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_-20%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)]" />
        <div className="relative space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            CRM system
          </p>
          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Pipeline, tasks & revenue signals
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Monitor funnel health, chase due follow-ups, and enrich deals with
            value and priority. Nothing here appears on the public site — this
            workspace is for your sales motion only.
          </p>
        </div>
      </section>

      <Alert className="border-primary/30 bg-[color-mix(in_oklab,var(--primary)_6%,var(--card))]">
        <AlertDescription className="text-sm leading-relaxed text-foreground">
          <strong className="font-semibold">CRM logging:</strong> click any lead.
          Set <span className="font-medium">Next reminder</span> (
          date/time + Call · SMS · Meeting), then fill{" "}
          <span className="font-medium">What they said</span> and{" "}
          <span className="font-medium">Plan / next steps</span>. The grid adds a{" "}
          <span className="font-medium">Notes</span> column when you widen the
          table (&quot;✓&quot; = saved conversation or plan text).
        </AlertDescription>
      </Alert>

      {(stats.dueCount > 0 || stats.newCount > 0) && (
        <Alert className="border-orange-500/35 bg-[color-mix(in_oklab,orange_10%,var(--card))]">
          <AlertDescription className="text-foreground">
            {stats.dueCount > 0 ? (
              <span className="font-semibold">
                {stats.dueCount} follow-up
                {stats.dueCount === 1 ? "" : "s"} due or overdue.
              </span>
            ) : null}
            {stats.dueCount > 0 && stats.newCount > 0 ? " · " : null}
            {stats.newCount > 0 ? (
              <span className="font-semibold">{stats.newCount} new in inbox.</span>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="crm-metrics-heading" className="space-y-4">
        <h3 id="crm-metrics-heading" className="sr-only">
          CRM metrics
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard label="Total records" value={String(stats.total)} />
          <MetricCard
            label="Active pipeline"
            value={String(stats.activeCount)}
            hint="Excludes won, lost, archived"
          />
          <MetricCard
            label="Inbound (7 days)"
            value={String(stats.inbound7Count)}
            hint="New submissions window"
          />
          <MetricCard
            label="Due follow-ups"
            value={String(stats.dueCount)}
            highlight={stats.dueCount > 0}
          />
          <MetricCard
            label="Open pipeline value"
            value={formatDealNumber(stats.pipelineValue)}
            hint="Sum of deal estimates — active stages"
          />
          <MetricCard label="Win rate" value={stats.winRate} hint="Won ÷ (won + lost)" />
        </div>
      </section>

      <section aria-labelledby="crm-pipeline-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3
              id="crm-pipeline-heading"
              className="text-sm font-semibold text-foreground"
            >
              Pipeline overview
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Click a stage to filter the workspace below.
            </p>
          </div>
          {stageFilter !== "all" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStageFilter("all")}
            >
              Clear stage filter
            </Button>
          ) : null}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CRM_PIPELINE_ORDER.map((stage) => {
            const n = pipelineCounts[stage];
            const activeCol = stageFilter === stage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => toggleStageFilter(stage)}
                className={cn(
                  "flex min-w-[128px] shrink-0 flex-col rounded-xl border px-4 py-3 text-left transition",
                  activeCol
                    ? "border-primary bg-primary/12 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
                    : "border-border bg-card hover:border-primary/35 hover:bg-muted/40",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {STATUS_LABELS[stage]}
                </span>
                <span className="mt-1 font-heading text-2xl font-semibold tabular-nums">
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <ManualLeadCard
        onCreated={(lead) => setItems((p) => [lead, ...p])}
        onError={setError}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="shadow-none">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="font-heading text-lg">Workspace</CardTitle>
              <CardDescription>
                Search, slice by cohort, and sort — exports respect filters.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => downloadLeadsCsv(filtered)}
              disabled={filtered.length === 0}
            >
              Export CSV ({filtered.length})
            </Button>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              placeholder="Search name, email, company, notes, tags…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="lg:max-w-md"
              aria-label="Search leads"
            />
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["new", `New (${stats.newCount})`],
                  ["active", "Active pipeline"],
                  ["due", `Due (${stats.dueCount})`],
                ] as const
              ).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant={segment === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSegment(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="crm-source" className="text-xs text-muted-foreground">
              Source
            </Label>
            <select
              id="crm-source"
              className={cn(
                "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
              )}
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value as "all" | LeadSource)
              }
            >
              <option value="all">All sources</option>
              <option value="contact_form">Contact form</option>
              <option value="manual">Manual entry</option>
            </select>
            <Label htmlFor="crm-sort" className="text-xs text-muted-foreground">
              Sort
            </Label>
            <select
              id="crm-sort"
              className={cn(
                "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
              )}
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as typeof sortBy)
              }
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="followup">Follow-up date ↑</option>
              <option value="value">Deal value (high → low)</option>
              <option value="priority">Priority</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-0 pb-6 pt-0">
          <div className="hidden overflow-x-auto px-6 lg:block">
            <table className="w-full min-w-[940px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">Contact</th>
                  <th className="pb-3 pr-4 font-semibold">Organization</th>
                  <th className="pb-3 pr-4 font-semibold">Stage</th>
                  <th className="pb-3 pr-4 font-semibold">Value</th>
                  <th className="pb-3 pr-4 font-semibold">Priority</th>
                  <th className="pb-3 pr-4 font-semibold">Source</th>
                  <th className="pb-3 pr-4 font-semibold">Next touch</th>
                  <th className="pb-3 pr-4 text-center font-semibold">Notes</th>
                  <th className="pb-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className={cn(
                      "cursor-pointer border-b border-border/80 transition hover:bg-muted/40",
                      leadFollowUpIsDue(lead) && "bg-orange-500/[0.06]",
                    )}
                    onClick={() => setActiveLead(lead)}
                  >
                    <td className="py-3 pr-4 align-top">
                      <p className="font-semibold text-foreground">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </td>
                    <td className="py-3 pr-4 align-top text-muted-foreground">
                      {lead.company.trim() || "—"}
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <Badge variant={badgeVariant(lead.status)}>
                        {STATUS_LABELS[lead.status]}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 align-top tabular-nums font-medium">
                      {formatDealNumber(lead.dealValue)}
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <span
                        className={cn(
                          "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                          priorityBadgeClass(lead.priority),
                        )}
                      >
                        {PRIORITY_LABEL[lead.priority]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-top text-muted-foreground">
                      {lead.source === "contact_form" ? "Web form" : "Manual"}
                    </td>
                    <td className="py-3 pr-4 align-top text-xs text-muted-foreground">
                      {lead.nextFollowUpAt.trim() ? (
                        <div className="flex flex-col gap-1">
                          <span>
                            {new Date(lead.nextFollowUpAt).toLocaleString(
                              CRM_UI_LOCALE,
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              },
                            )}
                          </span>
                          {lead.reminderKind ? (
                            <span
                              className={cn(
                                "inline-flex w-fit rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                reminderBadgeClasses(lead.reminderKind),
                              )}
                            >
                              {REMINDER_LABEL[lead.reminderKind]}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 pr-4 align-top text-center text-xs tabular-nums">
                      {leadHasConversationLog(lead) ? (
                        <span
                          className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-700 dark:text-emerald-300"
                          title="Conversation or plan notes saved"
                        >
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 align-top text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.submittedAt).toLocaleDateString(
                        CRM_UI_LOCALE,
                        { dateStyle: "medium" },
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 px-4 lg:hidden">
            {filtered.map((lead) => (
              <li key={lead.id}>
                <button
                  type="button"
                  onClick={() => setActiveLead(lead)}
                  className={cn(
                    "w-full rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/35 hover:bg-muted/30",
                    leadFollowUpIsDue(lead) &&
                      "border-orange-500/40 ring-1 ring-orange-500/15",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {lead.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {lead.email}
                      </p>
                      {lead.company ? (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {lead.company}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={badgeVariant(lead.status)}>
                        {STATUS_LABELS[lead.status]}
                      </Badge>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                          priorityBadgeClass(lead.priority),
                        )}
                      >
                        {PRIORITY_LABEL[lead.priority]}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Value {formatDealNumber(lead.dealValue)}</span>
                    <span>
                      {lead.source === "contact_form" ? "Web form" : "Manual"}
                    </span>
                    {lead.tags?.length ? (
                      <span className="text-foreground">
                        {lead.tags.map((t) => (
                          <Badge key={t} variant="outline" className="mr-1">
                            {t}
                          </Badge>
                        ))}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {lead.message || "—"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                    {leadHasConversationLog(lead) ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-800 dark:text-emerald-200">
                        Notes: ✓ What they said / plan
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Tap to add call · SMS · meeting + notes
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Submitted{" "}
                    {new Date(lead.submittedAt).toLocaleString(CRM_UI_LOCALE, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {lead.nextFollowUpAt.trim() ? (
                      <>
                        {" "}
                        · Follow-up{" "}
                        {new Date(lead.nextFollowUpAt).toLocaleString(
                          CRM_UI_LOCALE,
                          {
                            dateStyle: "short",
                            timeStyle: "short",
                          },
                        )}
                        {lead.reminderKind ? (
                          <>
                            {" "}
                            <span
                              className={cn(
                                "inline-flex rounded-md border px-1.5 py-0.5 font-semibold uppercase tracking-wide text-[9px]",
                                reminderBadgeClasses(lead.reminderKind),
                              )}
                            >
                              {REMINDER_LABEL[lead.reminderKind]}
                            </span>
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {filtered.length === 0 ? (
            <p className="mx-4 rounded-xl border border-dashed border-border bg-muted/30 py-10 text-center text-sm text-muted-foreground lg:mx-6">
              No records match your filters.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <LeadDetailDialog
        key={activeLead ? adminLeadStableKey(activeLead) : "closed"}
        lead={activeLead}
        open={activeLead !== null}
        onOpenChange={(o) => !o && setActiveLead(null)}
        onPatch={(body) => void patchLead(activeLead!.id, body)}
        onDelete={() => void removeLead(activeLead!.id)}
      />
    </div>
  );
}

function ManualLeadCard({
  onCreated,
  onError,
}: {
  onCreated: (lead: Lead) => void;
  onError: (msg: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [dealValueStr, setDealValueStr] = useState("");
  const [priority, setPriority] = useState<LeadPriority>("medium");
  const [tagsCsv, setTagsCsv] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    const dv = Number.parseInt(dealValueStr.trim(), 10);
    const dealValue =
      dealValueStr.trim() === "" || Number.isNaN(dv) ? 0 : Math.max(0, dv);
    const tags =
      tagsCsv.trim() === ""
        ? []
        : tagsCsv
            .split(",")
            .map((t) => t.trim().slice(0, 32))
            .filter(Boolean)
            .slice(0, 16);
    setPending(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          message,
          dealValue,
          priority,
          tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError((data as { error?: string }).error ?? "Could not add lead");
        return;
      }
      onCreated(data as Lead);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setMessage("");
      setDealValueStr("");
      setPriority("medium");
      setTagsCsv("");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">
          Quick capture — manual lead
        </CardTitle>
        <CardDescription>
          Log referrals, walk-ins, or DMs that never touched the public form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => void submit(e)}>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="manual-name">Name</Label>
            <Input
              id="manual-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="manual-email">Email</Label>
            <Input
              id="manual-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="manual-phone">Phone</Label>
            <Input
              id="manual-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="manual-company">Company</Label>
            <Input
              id="manual-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="manual-value">Est. deal value</Label>
            <Input
              id="manual-value"
              type="number"
              min={0}
              step={1}
              placeholder="0"
              value={dealValueStr}
              onChange={(e) => setDealValueStr(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="manual-priority">Priority</Label>
            <select
              id="manual-priority"
              className={cn(
                "flex h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
              )}
              value={priority}
              onChange={(e) => setPriority(e.target.value as LeadPriority)}
            >
              {(Object.keys(PRIORITY_LABEL) as LeadPriority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="manual-tags">Tags</Label>
            <Input
              id="manual-tags"
              value={tagsCsv}
              onChange={(e) => setTagsCsv(e.target.value)}
              placeholder="enterprise, referral, urgent …"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="manual-msg">Notes / inquiry</Label>
            <Textarea
              id="manual-msg"
              className="min-h-[80px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Create record"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/** Include editable fields so the dialog remounts after PATCH refreshes `lead` while preserving stable keys while typing. */
function adminLeadStableKey(l: Lead): string {
  return [
    l.id,
    l.status,
    l.notes,
    l.conversationNotes,
    l.futurePlanNotes,
    l.reminderKind,
    l.nextFollowUpAt,
    l.lastContactedAt,
    l.name,
    l.email,
    l.phone,
    l.company,
    l.message,
    String(l.dealValue),
    l.priority,
    l.tags.join("\x1f"),
    l.submittedAt,
    l.source,
  ].join("\x1e");
}

function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
  onPatch,
  onDelete,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatch: (body: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const [status, setStatus] = useState<LeadStatus>(() => lead?.status ?? "new");
  const [notes, setNotes] = useState(() => lead?.notes ?? "");
  const [nextLocal, setNextLocal] = useState(() =>
    lead ? isoToDatetimeLocal(lead.nextFollowUpAt) : "",
  );
  const [name, setName] = useState(() => lead?.name ?? "");
  const [email, setEmail] = useState(() => lead?.email ?? "");
  const [phone, setPhone] = useState(() => lead?.phone ?? "");
  const [company, setCompany] = useState(() => lead?.company ?? "");
  const [message, setMessage] = useState(() => lead?.message ?? "");
  const [dealValueStr, setDealValueStr] = useState(() =>
    lead?.dealValue ? String(lead.dealValue) : "",
  );
  const [priority, setPriority] = useState<LeadPriority>(
    () => lead?.priority ?? "medium",
  );
  const [tagsCsv, setTagsCsv] = useState(() => (lead?.tags ?? []).join(", "));
  const [conversationNotes, setConversationNotes] = useState(
    () => lead?.conversationNotes ?? "",
  );
  const [futurePlanNotes, setFuturePlanNotes] = useState(
    () => lead?.futurePlanNotes ?? "",
  );
  const [reminderKind, setReminderKind] = useState<LeadReminderKind | "">(
    () => lead?.reminderKind ?? "",
  );

  if (!lead) return null;

  function parseDeal(): number {
    const dv = Number.parseInt(dealValueStr.trim(), 10);
    if (dealValueStr.trim() === "" || Number.isNaN(dv)) return 0;
    return Math.max(0, dv);
  }

  function parseTags(): string[] {
    if (!tagsCsv.trim()) return [];
    return tagsCsv
      .split(",")
      .map((t) => t.trim().slice(0, 32))
      .filter(Boolean)
      .slice(0, 16);
  }

  function save() {
    const hasFollowUp = Boolean(nextLocal.trim());
    onPatch({
      status,
      notes,
      conversationNotes,
      futurePlanNotes,
      name,
      email,
      phone,
      company,
      message,
      dealValue: parseDeal(),
      priority,
      tags: parseTags(),
      nextFollowUpAt: hasFollowUp ? datetimeLocalToIso(nextLocal) : "",
      reminderKind: hasFollowUp ? reminderKind : "",
    });
    onOpenChange(false);
  }

  function markContacted() {
    onPatch({
      lastContactedAt: new Date().toISOString(),
      status: status === "new" ? "contacted" : status,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(92vh,920px)] gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        <DialogHeader className="border-b border-border px-4 py-4 text-left sm:px-6">
          <DialogTitle className="pr-8">{lead.name}</DialogTitle>
          <DialogDescription>
            Pipeline, reminders (call / SMS / meeting), conversation log, and
            plans — scroll down after contact fields.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-4 py-4 sm:px-6">
          <div className="rounded-lg border border-primary/35 bg-[color-mix(in_oklab,var(--primary)_10%,var(--card))] px-3 py-2.5 text-xs leading-snug text-foreground">
            <strong className="font-semibold">Logged touchpoints:</strong> use{" "}
            <em>What they said</em> and <em>Plan / next steps</em> below. Pick{" "}
            <em>Reminder type</em> after you set a follow-up date — it drives the
            colored chip in the table.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dlg-status">Pipeline stage</Label>
              <select
                id="dlg-status"
                className={cn(
                  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                )}
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-name">Name</Label>
              <Input id="dlg-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-email">Email</Label>
              <Input id="dlg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-phone">Phone</Label>
              <Input id="dlg-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-company">Company</Label>
              <Input id="dlg-company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-value">Est. deal value</Label>
              <Input
                id="dlg-value"
                type="number"
                min={0}
                step={1}
                value={dealValueStr}
                onChange={(e) => setDealValueStr(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-priority">Priority</Label>
              <select
                id="dlg-priority"
                className={cn(
                  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                )}
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
              >
                {(Object.keys(PRIORITY_LABEL) as LeadPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dlg-tags">Tags (comma-separated)</Label>
              <Input
                id="dlg-tags"
                value={tagsCsv}
                onChange={(e) => setTagsCsv(e.target.value)}
                placeholder="enterprise, partner, hot …"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dlg-msg">Their message</Label>
            <Textarea
              id="dlg-msg"
              className="min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dlg-conversation">What they said</Label>
            <Textarea
              id="dlg-conversation"
              className="min-h-[88px]"
              placeholder="Quotes, objections, commitments from calls or chats…"
              value={conversationNotes}
              onChange={(e) => setConversationNotes(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dlg-plan">Plan / next steps</Label>
            <Textarea
              id="dlg-plan"
              className="min-h-[88px]"
              placeholder="What you’ll do next, pricing to send, stakeholders to loop in…"
              value={futurePlanNotes}
              onChange={(e) => setFuturePlanNotes(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dlg-notes">Internal notes</Label>
            <Textarea
              id="dlg-notes"
              className="min-h-[80px]"
              placeholder="Discovery notes, objections, pricing discussed…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dlg-next">Next reminder — date and time</Label>
              <Input
                id="dlg-next"
                type="datetime-local"
                value={nextLocal}
                onChange={(e) => setNextLocal(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Clear the field and save to remove the reminder (reminder type
                resets too).
              </p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dlg-reminder-kind">Reminder type</Label>
              <select
                id="dlg-reminder-kind"
                disabled={!nextLocal.trim()}
                className={cn(
                  "flex h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                  !nextLocal.trim() && "cursor-not-allowed opacity-60",
                )}
                value={reminderKind}
                onChange={(e) =>
                  setReminderKind(e.target.value as LeadReminderKind | "")
                }
              >
                <option value="">Not set</option>
                {(Object.keys(REMINDER_LABEL) as LeadReminderKind[]).map((k) => (
                  <option key={k} value={k}>
                    {REMINDER_LABEL[k]}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Pick call, SMS, or meeting when a follow-up date is scheduled.
              </p>
            </div>
          </div>
          {lead.lastContactedAt ? (
            <p className="text-xs text-muted-foreground">
              Last touched:{" "}
              {new Date(lead.lastContactedAt).toLocaleString(CRM_UI_LOCALE, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" onClick={() => save()}>
              Save changes
            </Button>
            <Button type="button" variant="secondary" onClick={() => markContacted()}>
              Log touchpoint now
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="button" variant="destructive" onClick={() => onDelete()}>
              Delete record
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
