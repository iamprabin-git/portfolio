/** Same key for localStorage (legacy / client) and cookie (SSR). */
export const THEME_STORAGE_KEY = "portfolio-theme";

export type ThemePreference = "dark" | "light";

export function writeThemeCookie(value: ThemePreference) {
  if (typeof document === "undefined") return;
  document.cookie = `${THEME_STORAGE_KEY}=${value};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

/** Read non-HttpOnly cookie from `document.cookie`. */
export function readThemeCookieFromDocument(): ThemePreference | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    /(?:^|; )portfolio-theme=(dark|light)(?:;|$)/,
  );
  return m ? (m[1] as ThemePreference) : null;
}
