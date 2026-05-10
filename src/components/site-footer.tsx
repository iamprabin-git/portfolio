import Link from "next/link";
import { ProfileBrandMark } from "@/components/profile-brand-mark";
import { ProfileSocialIcon } from "@/components/profile-social-icon";
import {
  profileHasAnySocial,
  profileSocialItems,
} from "@/lib/profile-social";
import { footerQuickLinks, primaryNavLinks } from "@/lib/site-nav";
import type { Profile } from "@/lib/types";

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const sectionTitle =
  "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground";

const footerLinkClass =
  "group inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary";

export function SiteFooter({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();

  const addressLine =
    profile.address.trim() || profile.location.trim();
  const phoneTrim = profile.phone.trim();

  const hasContactDetails =
    Boolean(addressLine) ||
    Boolean(phoneTrim) ||
    Boolean(profile.email.trim());

  const socialLinks = profileSocialItems(profile);

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-[color-mix(in_oklab,var(--accent)_18%,var(--border))] bg-card">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/2 h-48 w-[min(100%,56rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-14 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground transition hover:text-primary"
            >
              <ProfileBrandMark
                profile={profile}
                frameClassName="h-12 w-12 sm:h-14 sm:w-14"
                initialsFrameClassName="bg-[color-mix(in_oklab,var(--accent)_18%,var(--elevated))] ring-[color-mix(in_oklab,var(--accent)_22%,var(--border))]"
                initialsTextClassName="text-[11px] sm:text-xs"
              />
              {profile.name}
            </Link>
            <p className="mt-3 text-sm font-medium text-primary">
              {profile.title}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground line-clamp-4">
              {profile.bio}
            </p>
          </div>

          {/* Same routes as header + Admin */}
          <div>
            <p className={sectionTitle}>Site menu</p>
            <ul className="mt-5 space-y-3">
              {primaryNavLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLinkClass}>
                    <span className="h-px w-4 bg-[color-mix(in_oklab,var(--accent)_0%,var(--border))] transition-all group-hover:w-6 group-hover:bg-primary" />
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin/login"
                  className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Homepage anchors */}
          <div>
            <p className={sectionTitle}>Quick links</p>
            <ul className="mt-5 space-y-3">
              {footerQuickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLinkClass}>
                    <span className="h-px w-4 bg-[color-mix(in_oklab,var(--accent)_0%,var(--border))] transition-all group-hover:w-6 group-hover:bg-primary" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + social */}
          <div>
            <p className={sectionTitle}>Contact</p>
            <div className="mt-5 space-y-4">
              {!hasContactDetails && !profileHasAnySocial(profile) ? (
                <p className="text-sm text-muted-foreground">
                  Add contact info and social URLs in Admin → Profile.
                </p>
              ) : null}

              {addressLine ? (
                <div className="flex gap-3">
                  <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {addressLine}
                  </p>
                </div>
              ) : null}

              {phoneTrim ? (
                <a
                  href={`tel:${phoneTrim.replace(/\s/g, "")}`}
                  className="flex items-start gap-3 text-sm font-medium text-foreground transition hover:text-primary"
                >
                  <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {phoneTrim}
                </a>
              ) : null}

              {profile.email.trim() ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-start gap-3 text-sm font-medium text-foreground transition hover:text-primary"
                >
                  <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="break-all">{profile.email}</span>
                </a>
              ) : null}

              {socialLinks.length > 0 ? (
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Social
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map(({ key, href, label }) => (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground transition hover:border-primary/45 hover:text-primary"
                        aria-label={label}
                      >
                        <ProfileSocialIcon platform={key} className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {year}{" "}
            <span className="font-medium text-foreground">{profile.name}</span>
            . All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Crafted with Next.js
            </span>
            {profile.email ? (
              <Link
                href={`mailto:${profile.email}`}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Let&apos;s talk
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
