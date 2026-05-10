"use client";

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ensureProfileFormState } from "@/lib/profile-coerce";
import type { Profile } from "@/lib/types";
import { useState } from "react";

export function ProfileForm({ initial }: { initial: Profile }) {
  const [profile, setProfile] = useState(() =>
    ensureProfileFormState(initial),
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Save failed");
        return;
      }
      setProfile(ensureProfileFormState(data as Profile));
      setSaved(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={(e) => void save(e)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={profile.name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, name: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-title">Title</Label>
          <Input
            id="profile-title"
            value={profile.title}
            onChange={(e) =>
              setProfile((p) => ({ ...p, title: e.target.value }))
            }
          />
        </div>
      </div>
      <AdminImageUrlField
        label="Logo"
        value={profile.logoUrl ?? ""}
        onChange={(logoUrl) => setProfile((p) => ({ ...p, logoUrl }))}
        hint="Shown in the site header and footer next to your name. Square or circle PNG/SVG works best; leave empty to use initials."
      />
      <AdminImageUrlField
        label="Hero image"
        value={profile.heroImageUrl ?? ""}
        onChange={(heroImageUrl) =>
          setProfile((p) => ({ ...p, heroImageUrl }))
        }
        hint="Paste a URL or upload from your computer. Files are stored under public/uploads (works on your own server / local dev; serverless hosts may need cloud storage)."
      />
      <div className="space-y-2">
        <Label htmlFor="profile-bio">Bio</Label>
        <Textarea
          id="profile-bio"
          className="min-h-[120px] resize-y"
          value={profile.bio}
          onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile((p) => ({ ...p, email: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-phone">Phone (contact page)</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={profile.phone}
            onChange={(e) =>
              setProfile((p) => ({ ...p, phone: e.target.value }))
            }
            placeholder="+1 …"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-address">Address (contact page)</Label>
        <Textarea
          id="profile-address"
          className="min-h-[72px] resize-y"
          value={profile.address}
          onChange={(e) =>
            setProfile((p) => ({ ...p, address: e.target.value }))
          }
          placeholder="Street, city, country — or leave blank to use location only"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-location">Location / tagline</Label>
        <Input
          id="profile-location"
          value={profile.location}
          onChange={(e) =>
            setProfile((p) => ({ ...p, location: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Short line (e.g. Remote · EU). Shown on Contact when address is empty.
        </p>
      </div>
      <div className="space-y-4 border-t border-border pt-6">
        <div>
          <p className="text-sm font-medium text-foreground">Social links</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Prefer full URLs. Handles without{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
              https://
            </code>{" "}
            work for most networks. WhatsApp:{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
              +country code number
            </code>{" "}
            or a wa.me / invite link.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="profile-facebook">Facebook</Label>
            <Input
              id="profile-facebook"
              value={profile.facebook}
              onChange={(e) =>
                setProfile((p) => ({ ...p, facebook: e.target.value }))
              }
              placeholder="https://facebook.com/…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-tiktok">TikTok</Label>
            <Input
              id="profile-tiktok"
              value={profile.tiktok}
              onChange={(e) =>
                setProfile((p) => ({ ...p, tiktok: e.target.value }))
              }
              placeholder="@handle or URL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-instagram">Instagram</Label>
            <Input
              id="profile-instagram"
              value={profile.instagram}
              onChange={(e) =>
                setProfile((p) => ({ ...p, instagram: e.target.value }))
              }
              placeholder="@handle or URL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-linkedin">LinkedIn</Label>
            <Input
              id="profile-linkedin"
              value={profile.linkedin}
              onChange={(e) =>
                setProfile((p) => ({ ...p, linkedin: e.target.value }))
              }
              placeholder="https://linkedin.com/in/…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-github">GitHub</Label>
            <Input
              id="profile-github"
              value={profile.github}
              onChange={(e) =>
                setProfile((p) => ({ ...p, github: e.target.value }))
              }
              placeholder="username or URL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-whatsapp">WhatsApp</Label>
            <Input
              id="profile-whatsapp"
              value={profile.whatsapp}
              onChange={(e) =>
                setProfile((p) => ({ ...p, whatsapp: e.target.value }))
              }
              placeholder="+977 … or https://wa.me/…"
            />
          </div>
        </div>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {saved ? (
        <Alert>
          <AlertDescription>Saved successfully.</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
