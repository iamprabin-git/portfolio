import type { Profile } from "./types";

/** Ordered keys shown on Contact + footer */
export type ProfileSocialKey =
  | "facebook"
  | "tiktok"
  | "instagram"
  | "linkedin"
  | "github"
  | "whatsapp";

export type ProfileSocialItem = {
  key: ProfileSocialKey;
  href: string;
  label: string;
};

function hasHttpProtocol(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function ensureHttps(raw: string): string {
  const t = raw.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (/^\/\//.test(t)) return `https:${t}`;
  return `https://${t.replace(/^\/+/, "")}`;
}

/** WhatsApp: full URL or international phone digits → wa.me link */
export function whatsappChatHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (hasHttpProtocol(t)) return t;
  if (/whatsapp\.com|wa\.me/i.test(t)) return ensureHttps(t);
  const digits = t.replace(/\D/g, "");
  if (digits.length >= 8) return `https://wa.me/${digits}`;
  return "";
}

function facebookHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (hasHttpProtocol(t)) return t;
  if (/facebook\.com|fb\.com/i.test(t)) return ensureHttps(t);
  const slug = t.replace(/^@/, "").replace(/^\//, "");
  return `https://www.facebook.com/${encodeURIComponent(slug)}`;
}

function instagramHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (hasHttpProtocol(t)) return t;
  if (/instagram\.com/i.test(t)) return ensureHttps(t);
  const slug = t.replace(/^@/, "").replace(/^\//, "").replace(/\/$/, "");
  return `https://www.instagram.com/${encodeURIComponent(slug)}/`;
}

function tikTokHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (hasHttpProtocol(t)) return t;
  if (/tiktok\.com/i.test(t)) return ensureHttps(t);
  const slug = t.replace(/^@/, "");
  return `https://www.tiktok.com/@${encodeURIComponent(slug)}`;
}

function githubHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (hasHttpProtocol(t)) return t;
  if (/github\.com/i.test(t)) return ensureHttps(t);
  return `https://github.com/${encodeURIComponent(t.replace(/^@/, ""))}`;
}

function linkedinHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (hasHttpProtocol(t)) return t;
  if (/linkedin\.com/i.test(t)) return ensureHttps(t);
  const slug = t.replace(/^\//, "").replace(/\/$/, "");
  return `https://www.linkedin.com/in/${encodeURIComponent(slug)}`;
}

function hrefForField(key: ProfileSocialKey, raw: string): string {
  switch (key) {
    case "facebook":
      return facebookHref(raw);
    case "instagram":
      return instagramHref(raw);
    case "tiktok":
      return tikTokHref(raw);
    case "whatsapp":
      return whatsappChatHref(raw);
    case "github":
      return githubHref(raw);
    case "linkedin":
      return linkedinHref(raw);
    default:
      return "";
  }
}

const SOCIAL_DEFS: Array<{ key: ProfileSocialKey; label: string }> = [
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "whatsapp", label: "WhatsApp" },
];

function profileSocialRaw(profile: Profile, key: ProfileSocialKey): string {
  switch (key) {
    case "facebook":
      return profile.facebook;
    case "tiktok":
      return profile.tiktok;
    case "instagram":
      return profile.instagram;
    case "linkedin":
      return profile.linkedin;
    case "github":
      return profile.github;
    case "whatsapp":
      return profile.whatsapp;
    default:
      return "";
  }
}

export function profileSocialItems(profile: Profile): ProfileSocialItem[] {
  const out: ProfileSocialItem[] = [];
  for (const { key, label } of SOCIAL_DEFS) {
    const raw = profileSocialRaw(profile, key).trim();
    if (!raw) continue;
    const href = hrefForField(key, raw);
    if (!href) continue;
    out.push({ key, href, label });
  }
  return out;
}

export function profileHasAnySocial(profile: Profile): boolean {
  return profileSocialItems(profile).length > 0;
}
