import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { StarRating } from "@/components/star-rating";
import { HeroRotatingTitle } from "@/components/hero-rotating-titles";
import { SkillChip } from "@/components/skill-chip";
import { SponsorsCarousel } from "@/components/sponsors-carousel";
import { SubmitReviewTrigger } from "@/components/submit-review-dialog";
import {
  approvedReviews,
  readPortfolio,
} from "@/lib/portfolio-store";

export default async function HomePage() {
  const { profile, projects, skills, sponsors, reviews } =
    await readPortfolio();
  const approvedReviewList = approvedReviews(reviews);
  const featured = projects.filter((p) => p.featured);
  const displayProjects = featured.length ? featured : projects.slice(0, 6);

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>(
    (acc, s) => {
      const k = s.category || "General";
      if (!acc[k]) acc[k] = [];
      acc[k].push(s);
      return acc;
    },
    {},
  );

  const heroImg =
    profile.heroImageUrl?.trim() ||
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80";

  return (
    <>
      {/* Hero with image */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-25%,color-mix(in_oklab,var(--accent)_20%,transparent),transparent)]" />
        <div className="relative mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-20">
          <div className="order-2 lg:order-1">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              {profile.location}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.08]">
              Hi, I&apos;m{" "}
              <span className="text-[color-mix(in_oklab,var(--accent)_92%,var(--text))]">
                {profile.name.split(" ")[0]}
              </span>
              <span className="mt-1 block min-h-[1.35em] text-2xl sm:text-3xl sm:mt-2">
                <HeroRotatingTitle />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
              >
                View projects
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground transition hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
              >
                Contact
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
              >
                Learn more ↓
              </a>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md lg:max-w-none hero-card-float">
              <div className="hero-glow-breathe absolute -inset-4 rounded-[2rem] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_50%,color-mix(in_oklab,var(--accent)_12%,transparent))] blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-border bg-muted shadow-[0_24px_80px_-24px_color-mix(in_oklab,var(--accent)_35%,transparent)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImg}
                  alt=""
                  className="aspect-[4/5] w-full object-cover object-center sm:aspect-[16/11] lg:aspect-[4/5]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,color-mix(in_oklab,var(--surface)_95%,transparent)_0%,transparent)] p-6 pt-20">
                  <p className="text-sm font-medium text-foreground">
                    {profile.name}
                  </p>
                  <p className="mt-0.5 min-h-[1.15em]">
                    <HeroRotatingTitle className="text-xs" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
      >
        <SectionHeading
          eyebrow="About"
          title="Background & focus"
          description="A concise snapshot of who I am and how I like to work with teams."
          action={
            <Link
              href="/about"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Full about →
            </Link>
          }
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-3">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
            <dl className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role
                </dt>
                <dd className="mt-2 text-sm font-semibold text-foreground">
                  {profile.title}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Location
                </dt>
                <dd className="mt-2 text-sm font-semibold text-foreground">
                  {profile.location || "—"}
                </dd>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-2 truncate text-sm font-semibold text-primary">
                  {profile.email ? (
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <aside className="rounded-3xl border border-border bg-[color-mix(in_oklab,var(--surface)_70%,var(--background))] p-8 lg:col-span-2">
            <p className="text-sm font-semibold text-foreground">
              Working style
            </p>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Clear communication, async-friendly updates, and documented
                decisions.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Performance, accessibility, and maintainability baked in from day
                one.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                Edit all homepage content dynamically from your admin panel.
              </li>
            </ul>
          </aside>
        </div>
      </section>

      {/* Skills */}
      <section
        id="skills"
        className="border-y border-border bg-[color-mix(in_oklab,var(--surface)_35%,var(--background))]"
      >
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="Skills"
            title="Tools & technologies"
            description="Browse by category — full proficiency and timeline on the skills page. Edit in Admin → Skills."
            action={
              <Link
                href="/skills"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                View all →
              </Link>
            }
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(skillsByCategory).map(([category, items]) => (
              <div
                key={category}
                className="rounded-2xl border border-border bg-card p-6 shadow-[inset_0_1px_0_color-mix(in_oklab,white_5%,transparent)]"
              >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {category}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {items.map((s) => (
                    <li key={s.id}>
                      <SkillChip skill={s} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {skills.length === 0 ? (
            <p className="mt-12 text-center text-muted-foreground">
              Add skills in Admin → Skills.
            </p>
          ) : null}
        </div>
      </section>

      {/* My projects */}
      <section id="projects" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Portfolio"
          title="My projects"
          description="Featured work and recent builds. Manage entries from Admin → Projects."
          action={
            <Link
              href="/projects"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              All projects →
            </Link>
          }
        />
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {displayProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
        {projects.length === 0 ? (
          <p className="mt-12 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No projects yet. Add your first project in the admin panel.
          </p>
        ) : null}
      </section>

      {/* Sponsors */}
      <section
        id="sponsors"
        className="border-t border-border bg-[color-mix(in_oklab,var(--surface)_40%,var(--background))]"
      >
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="Partners"
            title="Sponsors & collaborators"
            description="Brands and teams I’ve partnered with. Logos and links are editable from Admin → Sponsors."
          />
          {sponsors.length > 0 ? (
            <SponsorsCarousel sponsors={sponsors} />
          ) : (
            <p className="mt-12 text-center text-muted-foreground">
              No sponsors listed yet. Add them in Admin → Sponsors.
            </p>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Testimonials"
          title="Reviews"
          description="Approved testimonials from clients and visitors. New submissions are reviewed in Admin → Reviews."
          action={<SubmitReviewTrigger />}
        />
        {approvedReviewList.length > 0 ? (
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {approvedReviewList.map((r) => (
              <blockquote
                key={r.id}
                className="flex h-full flex-col rounded-3xl border border-border bg-card p-8 shadow-[inset_0_1px_0_color-mix(in_oklab,white_5%,transparent)]"
              >
                <StarRating rating={r.rating} />
                <p className="mt-5 flex-1 text-lg leading-relaxed text-foreground">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <footer className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                  {r.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.avatarUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary">
                      {r.authorName.slice(0, 1)}
                    </span>
                  )}
                  <div>
                    <cite className="not-italic text-sm font-semibold text-foreground">
                      {r.authorName}
                    </cite>
                    <p className="text-xs text-muted-foreground">
                      {[r.role, r.company].filter(Boolean).join(" · ") ||
                        "Review"}
                    </p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-muted-foreground">
            No approved reviews yet. Publish testimonials from the admin panel or
            approve submissions from visitors.
          </p>
        )}
      </section>
    </>
  );
}
