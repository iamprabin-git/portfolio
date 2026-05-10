import type { Profile } from "./types";

/** Ensures every string field is defined so controlled inputs stay controlled. */
export function ensureProfileFormState(p: Profile): Profile {
  return {
    name: p.name ?? "",
    title: p.title ?? "",
    bio: p.bio ?? "",
    email: p.email ?? "",
    address: p.address ?? "",
    phone: p.phone ?? "",
    github: p.github ?? "",
    linkedin: p.linkedin ?? "",
    facebook: p.facebook ?? "",
    instagram: p.instagram ?? "",
    tiktok: p.tiktok ?? "",
    whatsapp: p.whatsapp ?? "",
    location: p.location ?? "",
    logoUrl: p.logoUrl ?? "",
    heroImageUrl: p.heroImageUrl ?? "",
  };
}
