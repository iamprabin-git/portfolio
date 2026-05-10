"use client";

import { TypeAnimation } from "react-type-animation";
import { useMemo, useSyncExternalStore } from "react";

export const HERO_ROTATING_TITLES = [
  "Web Developer",
  "Graphic Designer",
  "Product Designer",
] as const;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

function subscribeNoop(onStoreChange: () => void) {
  void onStoreChange;
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function pauseSequence(
  titles: readonly string[],
  pauseMs: number,
): (string | number)[] {
  return titles.flatMap((t) => [t, pauseMs]);
}

/** Matches [dangolprabin.com.np](https://www.dangolprabin.com.np/): typewriter cycle with pause between phrases. */
export function HeroRotatingTitle({ className }: { className?: string }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isClient = useIsClient();

  const sequence = useMemo(
    () => pauseSequence(HERO_ROTATING_TITLES, 2000),
    [],
  );

  const wrapperClass =
    `inline-block max-w-full overflow-hidden align-bottom font-semibold [font-family:var(--hero-typewriter-font)] ${className ?? "text-[var(--hero-typewriter-color)]"}`;

  if (prefersReducedMotion || !isClient) {
    return (
      <span className={wrapperClass} aria-live="polite">
        {HERO_ROTATING_TITLES[0]}
      </span>
    );
  }

  return (
    <span className={wrapperClass} aria-live="polite">
      <TypeAnimation
        sequence={sequence}
        wrapper="span"
        speed={50}
        repeat={Infinity}
        cursor={false}
        className="inline-block whitespace-nowrap [font-family:var(--hero-typewriter-font)]"
      />
    </span>
  );
}
