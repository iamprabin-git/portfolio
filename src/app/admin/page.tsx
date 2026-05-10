import Link from "next/link";
import { leadsDueForFollowUp, newLeads } from "@/lib/leads";
import {
  isMongoConfigured,
  pendingProjectFeedback,
  pendingReviews,
  readPortfolio,
} from "@/lib/portfolio-store";
import { cn } from "@/lib/utils";

const statCardClass = cn(
  "block rounded-xl border border-border bg-card p-5 outline-none transition",
  "hover:border-[color-mix(in_oklab,var(--primary)_38%,var(--border))]",
  "hover:bg-[color-mix(in_oklab,var(--muted)_40%,var(--card))]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

export default async function AdminDashboardPage() {
  const data = await readPortfolio();
  const pendingRev = pendingReviews(data.reviews).length;
  const pendingFb = pendingProjectFeedback(data.projectFeedback).length;
  const leadsDue = leadsDueForFollowUp(data.leads).length;
  const leadsNew = newLeads(data.leads).length;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Overview
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your public site reads from{" "}
        {isMongoConfigured() ? (
          <>
            MongoDB (single document in collection{" "}
            <code className="text-primary">
              {process.env.MONGODB_COLLECTION?.trim() || "site"}
            </code>
            ).
          </>
        ) : (
          <>
            <code className="text-primary">data/portfolio.json</code>.
          </>
        )}
      </p>
      {(pendingRev > 0 || pendingFb > 0 || leadsDue > 0 || leadsNew > 0) && (
        <div className="mt-6 rounded-xl border border-orange-500/35 bg-[color-mix(in_oklab,orange_10%,var(--surface))] px-4 py-3 text-sm text-foreground">
          <p className="font-semibold">Attention needed</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
            {pendingRev > 0 ? (
              <li>
                <Link
                  href="/admin/reviews"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {pendingRev} review(s)
                </Link>{" "}
                waiting for approval
              </li>
            ) : null}
            {pendingFb > 0 ? (
              <li>
                <Link
                  href="/admin/project-feedback"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {pendingFb} project comment(s)
                </Link>{" "}
                waiting for approval
              </li>
            ) : null}
            {(leadsDue > 0 || leadsNew > 0) ? (
              <li>
                <Link
                  href="/admin/leads"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  CRM
                </Link>
                {": "}
                {leadsNew > 0 ? `${leadsNew} new` : null}
                {leadsNew > 0 && leadsDue > 0 ? ", " : ""}
                {leadsDue > 0 ? `${leadsDue} follow-up due` : null}
              </li>
            ) : null}
          </ul>
        </div>
      )}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Link href="/admin/projects" className={statCardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Projects
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {data.projects.length}
          </p>
        </Link>
        <Link href="/admin/skills" className={statCardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Skills
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {data.skills.length}
          </p>
        </Link>
        <Link href="/admin/projects" className={statCardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Featured
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {data.projects.filter((p) => p.featured).length}
          </p>
        </Link>
        <Link href="/admin/sponsors" className={statCardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sponsors
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {data.sponsors.length}
          </p>
        </Link>
        <Link href="/admin/reviews" className={statCardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reviews
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {data.reviews.length}
          </p>
        </Link>
        <Link href="/admin/leads" className={statCardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            CRM records
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
            {data.leads.length}
          </p>
        </Link>
        <Link href="/admin/settings" className={statCardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Security
          </p>
          <p className="mt-2 text-sm font-semibold leading-snug text-foreground">
            Password & sign-in
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Open settings →
          </p>
        </Link>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/leads"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          Open CRM
        </Link>
        <Link
          href="/admin/profile"
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
        >
          Edit profile
        </Link>
        <Link
          href="/admin/projects"
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
        >
          Manage projects
        </Link>
        <Link
          href="/admin/skills"
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
        >
          Manage skills
        </Link>
        <Link
          href="/admin/sponsors"
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
        >
          Sponsors
        </Link>
        <Link
          href="/admin/reviews"
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
        >
          Reviews
        </Link>
        <Link
          href="/admin/project-feedback"
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
        >
          Project feedback
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
        >
          Settings
        </Link>
        <Link
          href="/"
          target="_blank"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          View site →
        </Link>
      </div>
    </div>
  );
}
