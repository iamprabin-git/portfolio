/** Full-viewport decorative layer: shimmer + sparkles + soft orbs. Site layout only. */

type Sparkle = { left: number; top: number; delay: number; size: number };

function sparkles(): Sparkle[] {
  const out: Sparkle[] = [];
  for (let i = 0; i < 42; i++) {
    const row = Math.floor(i / 7);
    const col = i % 7;
    const left = 6 + col * 13 + ((i * 3) % 5);
    const top = 5 + row * 14 + ((i * 5) % 7);
    const delay = ((i * 0.41) % 4.5) + (i % 3) * 0.2;
    const size = 2 + (i % 5);
    out.push({ left, top, delay, size });
  }
  return out;
}

const SPARKLES = sparkles();

export function SiteAmbientEffects() {
  return (
    <div
      className="site-ambient-root pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden
    >
      <div className="site-ambient-orb site-ambient-orb-a" />
      <div className="site-ambient-orb site-ambient-orb-b" />
      <div className="site-ambient-shimmer" />
      <div className="site-ambient-sparkle-layer">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="site-sparkle absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
