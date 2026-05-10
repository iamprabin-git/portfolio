"use client";

import { useLayoutEffect } from "react";
import {
  THEME_STORAGE_KEY,
  readThemeCookieFromDocument,
  writeThemeCookie,
  type ThemePreference,
} from "@/lib/theme-shared";

/**
 * Aligns `document.documentElement` with localStorage (if set), otherwise keeps
 * SSR cookie theme or falls back to `prefers-color-scheme`, then mirrors to cookie.
 * No `<script>` — avoids React 19 “script in component tree” warnings.
 */
export function ThemeCookieSync() {
  useLayoutEffect(() => {
    try {
      const root = document.documentElement;
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        const v = stored as ThemePreference;
        root.classList.toggle("dark", v === "dark");
        writeThemeCookie(v);
        return;
      }

      const fromCookie = readThemeCookieFromDocument();
      if (fromCookie) {
        root.classList.toggle("dark", fromCookie === "dark");
        return;
      }

      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.toggle("dark", prefersDark);
      writeThemeCookie(prefersDark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
