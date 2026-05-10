"use client";

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field";
import type { Sponsor } from "@/lib/types";
import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]";

const empty = { name: "", logoUrl: "", websiteUrl: "" };

export function SponsorsAdmin({ initial }: { initial: Sponsor[] }) {
  const [sponsors, setSponsors] = useState(initial);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function startEdit(s: Sponsor) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      logoUrl: s.logoUrl,
      websiteUrl: s.websiteUrl,
    });
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setForm(empty);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/sponsors/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError((data as { error?: string }).error ?? "Save failed");
          return;
        }
        const u = data as Sponsor;
        setSponsors((prev) => prev.map((x) => (x.id === u.id ? u : x)));
        cancel();
        return;
      }
      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Create failed");
        return;
      }
      setSponsors((prev) => [...prev, data as Sponsor]);
      setForm(empty);
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this sponsor?")) return;
    setError(null);
    const res = await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError((data as { error?: string }).error ?? "Delete failed");
      return;
    }
    setSponsors((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) cancel();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <form
        className="space-y-4 rounded-xl border border-border bg-card p-6"
        onSubmit={(e) => void submit(e)}
      >
        <h2 className="text-lg font-semibold text-foreground">
          {editingId ? "Edit sponsor" : "Add sponsor"}
        </h2>
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Name
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </label>
        <AdminImageUrlField
          label="Logo"
          value={form.logoUrl}
          onChange={(logoUrl) => setForm((f) => ({ ...f, logoUrl }))}
          hint="PNG, JPG, WebP, or SVG. Upload saves to /uploads."
        />
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Website URL
          <input
            className={inputClass}
            value={form.websiteUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, websiteUrl: e.target.value }))
            }
            placeholder="https://…"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Saving…" : editingId ? "Update" : "Add sponsor"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-foreground">All sponsors</h2>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {sponsors.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                {s.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.logoUrl}
                    alt=""
                    className="size-14 shrink-0 rounded-full border border-border bg-muted object-contain p-0 sm:size-16"
                  />
                ) : null}
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.websiteUrl || "No link"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(s)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(s.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
