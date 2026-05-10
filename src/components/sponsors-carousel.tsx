import type { Sponsor } from "@/lib/types";

function SponsorTile({ sponsor: s }: { sponsor: Sponsor }) {
  const circle = (
    <span className="relative isolate m-0 flex size-24 shrink-0 overflow-hidden rounded-full border border-border bg-card p-0 shadow-sm grayscale transition duration-300 hover:scale-[1.06] hover:grayscale-0 hover:shadow-md hover:shadow-[color-mix(in_oklab,var(--accent)_14%,transparent)] sm:size-28 md:size-32">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.logoUrl}
        alt={s.name ? `${s.name} logo` : "Sponsor logo"}
        className="m-0 size-full rounded-full object-contain object-center p-0"
      />
    </span>
  );

  if (s.websiteUrl) {
    return (
      <a
        href={s.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={s.name ? `Visit ${s.name}` : "Visit sponsor"}
        className="m-0 shrink-0 p-0 outline-none ring-primary transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_oklab,var(--surface)_40%,var(--background))]"
      >
        {circle}
      </a>
    );
  }
  return <div className="m-0 shrink-0 p-0">{circle}</div>;
}

/**
 * Infinite horizontal marquee for sponsor logos + reduced-motion fallback grid.
 * Logos only (no captions under circles).
 */
export function SponsorsCarousel({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;

  const loop = [...sponsors, ...sponsors];
  const durationSec = Math.min(Math.max(22, sponsors.length * 9), 52);

  return (
    <>
      <div
        className="sponsors-carousel-static mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-8 sm:gap-x-12 sm:gap-y-10 md:gap-x-14"
        aria-hidden={false}
      >
        {sponsors.map((s) => (
          <SponsorTile key={s.id} sponsor={s} />
        ))}
      </div>

      <div
        className="sponsors-marquee-mask sponsors-carousel-motion relative mt-12 overflow-hidden py-6 md:py-8"
        role="region"
        aria-label="Sponsor logos carousel"
      >
        <div
          className="sponsors-marquee-track flex w-max items-center gap-12 md:gap-16 lg:gap-20"
          style={{
            animationDuration: `${durationSec}s`,
          }}
        >
          {loop.map((s, index) => (
            <SponsorTile key={`${s.id}-${index}`} sponsor={s} />
          ))}
        </div>
      </div>
    </>
  );
}
