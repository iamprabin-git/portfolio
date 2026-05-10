"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { THEME_STORAGE_KEY, writeThemeCookie } from "@/lib/theme-shared";

function IconSun({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
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
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const root = document.documentElement;
    const nextDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextDark);
    const pref = nextDark ? "dark" : "light";
    localStorage.setItem(THEME_STORAGE_KEY, pref);
    writeThemeCookie(pref);
    setIsDark(nextDark);
  }

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      title={label}
      className={cn(
        "shrink-0 sm:size-9 sm:[&_svg]:size-5",
        "hover:border-primary/40 hover:text-primary",
      )}
      onClick={toggle}
    >
      {!mounted ? (
        <span className="size-4 animate-pulse rounded-sm bg-border sm:size-5" />
      ) : isDark ? (
        <IconSun className="size-[18px] sm:size-5" />
      ) : (
        <IconMoon className="size-[18px] sm:size-5" />
      )}
    </Button>
  );
}
