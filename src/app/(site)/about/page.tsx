import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ProfileBrandMark } from "@/components/profile-brand-mark";
import { ProfileSocialIcon } from "@/components/profile-social-icon";
import { SectionHeading } from "@/components/section-heading";
import { readPortfolio } from "@/lib/portfolio-store";
import {
  profileHasAnySocial,
  profileSocialItems,
} from "@/lib/profile-social";
import type { Profile } from "@/lib/types";

function metaDescription(bio: string): string {
  const t = bio.trim().replace(/\s+/g, " ");
  if (t.length <= 155) return t || "Professional background and contact overview.";
  return `${t.slice(0, 152)}…`;
}

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await readPortfolio();
  return {
    title: "About",
    description: metaDescription(profile.bio),
    openGraph: {
      title: `${profile.name} — About`,
      description: metaDescription(profile.bio),
    },
  };
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SnapshotCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[inset_0_1px_0_color-mix(in_oklab,white_5%,transparent)]">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-3 text-sm font-semibold leading-snug text-foreground">
        {children}
      </div>
    </div>
  );
}

function ProfessionalSnapshot({ profile }: { profile: Profile }) {
  const phoneTrim = profile.phone.trim();
  const emailTrim = profile.email.trim();
  const addressBody = profile.address.trim() || profile.location.trim();
  const addressLabel = profile.address.trim() ? "Studio / address" : "Base";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SnapshotCard label="Current focus">
        <span className="font-semibold">{profile.title}</span>
      </SnapshotCard>
      <SnapshotCard label="Location & availability">
        {profile.location.trim() ? profile.location : (
          <span className="font-normal text-muted-foreground">Not specified</span>
        )}
      </SnapshotCard>
      <SnapshotCard label="Email">
        {emailTrim ? (
          <a
            href={`mailto:${emailTrim}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {emailTrim}
          </a>
        ) : (
          <span className="font-normal text-muted-foreground">—</span>
        )}
      </SnapshotCard>
      {phoneTrim ? (
        <SnapshotCard label="Phone">
          <a
            href={`tel:${phoneTrim.replace(/\s/g, "")}`}
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            {phoneTrim}
          </a>
        </SnapshotCard>
      ) : null}
      {addressBody && profile.address.trim() ? (
        <SnapshotCard label={addressLabel}>
          <span className="block whitespace-pre-line font-medium leading-relaxed">
            {addressBody}
          </span>
        </SnapshotCard>
      ) : null}
    </div>
  );
}

export default async function AboutPage() {
  const { profile } = await readPortfolio();
  const socials = profileSocialItems(profile);
  const heroImg = profile.heroImageUrl?.trim();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex items-center gap-4">
                <ProfileBrandMark
                  profile={profile}
                  frameClassName="h-14 w-14 sm:h-16 sm:w-16"
                  initialsTextClassName="text-lg sm:text-xl font-semibold"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  About
                </p>
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                {profile.name}
              </h1>
              <p className="mt-3 text-xl font-medium text-muted-foreground sm:text-2xl">
                {profile.title}
              </p>
              {profile.location.trim() ? (
                <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]"
                    aria-hidden
                  />
                  {profile.location}
                </p>
              ) : null}
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
                >
                  View portfolio
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex rounded-full border border-border bg-muted px-6 py-2.5 text-sm font-semibold text-foreground transition hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
                >
                  Start a conversation
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-muted shadow-[0_24px_80px_-24px_color-mix(in_oklab,var(--foreground)_35%,transparent)] ring-1 ring-black/5 dark:ring-white/10">
                {heroImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImg}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[color-mix(in_oklab,var(--surface)_80%,var(--muted))] p-10">
                    <ProfileBrandMark
                      profile={profile}
                      frameClassName="h-28 w-28 sm:h-32 sm:w-32"
                      initialsTextClassName="text-3xl font-semibold sm:text-4xl"
                    />
                    <p className="text-center text-sm text-muted-foreground">
                      Add a hero image in Admin → Profile to personalize this
                      panel.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-[color-mix(in_oklab,var(--surface)_35%,var(--background))]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="Overview"
            title="Professional summary"
            description="A concise narrative you can refine anytime from Admin → Profile."
          />
          <div className="mt-12 max-w-3xl">
            <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
              {profile.bio.trim() || (
                <span className="text-muted-foreground/80">
                  Your biography will appear here once you add it in Admin →
                  Profile.
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Credentials"
          title="At a glance"
          description="Key details for recruiters, clients, and collaborators."
        />
        <div className="mt-12">
          <ProfessionalSnapshot profile={profile} />
        </div>
      </section>

      <section className="border-y border-border bg-[color-mix(in_oklab,var(--surface)_25%,var(--background))]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Collaboration"
                title="How I work with teams"
                description="Principles that guide delivery, communication, and quality on every engagement."
              />
            </div>
            <ul className="space-y-5 text-sm leading-relaxed text-muted-foreground lg:pt-14">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="font-semibold text-foreground">
                    Clear ownership and pacing.
                  </strong>{" "}
                  Written updates, realistic timelines, and explicit trade-offs
                  so stakeholders stay aligned without constant meetings.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="font-semibold text-foreground">
                    Quality by default.
                  </strong>{" "}
                  Performant, accessible interfaces and maintainable code—not
                  optional polish added at the end of a sprint.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="font-semibold text-foreground">
                    Partnership over hand-offs.
                  </strong>{" "}
                  Early involvement in product and UX decisions, proactive risk
                  flags, and documentation that helps the next person succeed.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {(profileHasAnySocial(profile) ||
        profile.email.trim() ||
        profile.phone.trim()) ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:pb-24">
          <SectionHeading
            eyebrow="Connect"
            title="Direct channels"
            description="Reach out through email or phone, or connect on the networks below."
          />
          <div className="mt-10 flex flex-wrap items-center gap-6">
            {profile.email.trim() ? (
              <a
                href={`mailto:${profile.email.trim()}`}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
              >
                <IconMail className="h-4 w-4 text-primary" aria-hidden />
                Email
              </a>
            ) : null}
            {profile.phone.trim() ? (
              <a
                href={`tel:${profile.phone.trim().replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
              >
                <IconPhone className="h-4 w-4 text-primary" aria-hidden />
                Call
              </a>
            ) : null}
            {(profile.address.trim() || profile.location.trim()) ? (
              <span className="inline-flex max-w-full items-start gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="whitespace-pre-line">
                  {profile.address.trim() || profile.location.trim()}
                </span>
              </span>
            ) : null}
          </div>
          {socials.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-3">
              {socials.map(({ key, href, label }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
                  >
                    <ProfileSocialIcon
                      platform={key}
                      className="h-4 w-4 text-primary"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="border-t border-border bg-[color-mix(in_oklab,var(--surface)_40%,var(--background))]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Explore the rest of the site
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Projects, skills depth, and testimonials.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/skills"
                className="inline-flex rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold text-foreground transition hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
              >
                Skills & expertise
              </Link>
              <Link
                href="/#reviews"
                className="inline-flex rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold text-foreground transition hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
              >
                Reviews
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Contact form
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
