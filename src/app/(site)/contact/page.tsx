import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ProfileSocialIcon } from "@/components/profile-social-icon";
import { readPortfolio } from "@/lib/portfolio-store";
import {
  profileHasAnySocial,
  profileSocialItems,
} from "@/lib/profile-social";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contact",
};

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

function ContactDetails({ profile }: { profile: Profile }) {
  const addressBody = profile.address.trim() || profile.location.trim();
  const addressLabel = profile.address.trim() ? "Address" : "Location";
  const phoneTrim = profile.phone.trim();
  const socials = profileSocialItems(profile);

  const hasAny =
    Boolean(addressBody) ||
    Boolean(phoneTrim) ||
    Boolean(profile.email.trim()) ||
    profileHasAnySocial(profile);

  return (
    <aside className="rounded-2xl border border-border bg-card/50 p-8 shadow-sm backdrop-blur-[2px]">
      <div className="border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Contact details
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Address, phone, email, and social profiles. Use the form opposite for
          enquiries and project briefs.
        </p>
      </div>

      {!hasAny ? (
        <p className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Add address, phone, email, and links in{" "}
          <span className="font-medium text-foreground">Admin → Profile</span>.
        </p>
      ) : (
        <dl className="mt-8 space-y-8">
          {addressBody ? (
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <IconMapPin className="h-4 w-4 text-primary" aria-hidden />
                {addressLabel}
              </dt>
              <dd className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {addressBody}
              </dd>
            </div>
          ) : null}

          {phoneTrim ? (
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <IconPhone className="h-4 w-4 text-primary" aria-hidden />
                Phone
              </dt>
              <dd className="mt-3">
                <a
                  href={`tel:${phoneTrim.replace(/\s/g, "")}`}
                  className="text-sm font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline"
                >
                  {phoneTrim}
                </a>
              </dd>
            </div>
          ) : null}

          {profile.email.trim() ? (
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <IconMail className="h-4 w-4 text-primary" aria-hidden />
                Email
              </dt>
              <dd className="mt-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="break-all text-sm font-medium text-foreground underline-offset-4 transition hover:text-primary hover:underline"
                >
                  {profile.email}
                </a>
              </dd>
            </div>
          ) : null}

          {socials.length > 0 ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Social
              </dt>
              <dd className="mt-4 flex flex-wrap gap-3">
                {socials.map(({ key, href, label }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/45 hover:bg-muted/60 hover:text-primary"
                  >
                    <ProfileSocialIcon platform={key} className="h-4 w-4" />
                    {label}
                  </a>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      )}
    </aside>
  );
}

export default async function ContactPage() {
  const { profile } = await readPortfolio();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_80%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]" />
      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Contact
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Let&apos;s work together
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Details on the left; send an enquiry or project request from the
            form — submissions land in your admin lead inbox.
          </p>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <ContactDetails profile={profile} />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
