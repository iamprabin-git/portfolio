"use client";

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field";
import type { Review, ReviewModerationStatus } from "@/lib/types";
import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]";

const empty = {
  authorName: "",
  role: "",
  company: "",
  quote: "",
  avatarUrl: "",
  rating: 5,
};

export function ReviewsAdmin({ initial }: { initial: Review[] }) {
  const [reviews, setReviews] = useState(initial);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function startEdit(r: Review) {
    setEditingId(r.id);
    setForm({
      authorName: r.authorName,
      role: r.role,
      company: r.company,
      quote: r.quote,
      avatarUrl: r.avatarUrl,
      rating: r.rating,
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
      const payload = {
        authorName: form.authorName,
        role: form.role,
        company: form.company,
        quote: form.quote,
        avatarUrl: form.avatarUrl,
        rating: form.rating,
      };
      if (editingId) {
        const res = await fetch(`/api/admin/reviews/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError((data as { error?: string }).error ?? "Save failed");
          return;
        }
        const u = data as Review;
        setReviews((prev) => prev.map((x) => (x.id === u.id ? u : x)));
        cancel();
        return;
      }
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Create failed");
        return;
      }
      setReviews((prev) => [...prev, data as Review]);
      setForm(empty);
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this review?")) return;
    setError(null);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError((data as { error?: string }).error ?? "Delete failed");
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) cancel();
  }

  async function moderate(id: string, status: ReviewModerationStatus) {
    setError(null);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError((data as { error?: string }).error ?? "Update failed");
      return;
    }
    const u = data as Review;
    setReviews((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  }

  const pendingQueue = reviews.filter((r) => r.status === "pending");

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {pendingQueue.length > 0 ? (
        <section className="rounded-xl border border-orange-500/35 bg-[color-mix(in_oklab,orange_10%,var(--surface))] p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Pending approvals ({pendingQueue.length})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Submitted from the website — approve to show on the homepage.
          </p>
          <ul className="mt-4 space-y-4">
            {pendingQueue.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="text-sm font-semibold text-foreground">
                  {r.authorName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[r.role, r.company].filter(Boolean).join(" · ") ||
                    "Visitor"}
                  {r.source === "public" ? " · From site" : ""}
                </p>
                <p className="mt-2 text-sm text-foreground">{r.quote}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void moderate(r.id, "approved")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void moderate(r.id, "rejected")}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(r)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    Edit first
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <form
        className="space-y-4 rounded-xl border border-border bg-card p-6"
        onSubmit={(e) => void submit(e)}
      >
        <h2 className="text-lg font-semibold text-foreground">
          {editingId ? "Edit review" : "Add review"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Author name
            <input
              className={inputClass}
              value={form.authorName}
              onChange={(e) =>
                setForm((f) => ({ ...f, authorName: e.target.value }))
              }
              required
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rating (0–5, 0 hides stars)
            <input
              type="number"
              min={0}
              max={5}
              className={inputClass}
              value={form.rating}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  rating: Number(e.target.value),
                }))
              }
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Role
            <input
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="Engineering Manager"
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Company
            <input
              className={inputClass}
              value={form.company}
              onChange={(e) =>
                setForm((f) => ({ ...f, company: e.target.value }))
              }
            />
          </label>
        </div>
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Quote
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            value={form.quote}
            onChange={(e) =>
              setForm((f) => ({ ...f, quote: e.target.value }))
            }
            required
          />
        </label>
        <AdminImageUrlField
          label="Avatar (optional)"
          value={form.avatarUrl}
          onChange={(avatarUrl) => setForm((f) => ({ ...f, avatarUrl }))}
          hint="Optional headshot for the testimonial card."
        />
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
            {pending ? "Saving…" : editingId ? "Update" : "Add review"}
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
        <h2 className="text-lg font-semibold text-foreground">All reviews</h2>
        <ul className="mt-4 space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-sm font-semibold text-foreground">
                {r.authorName}
              </p>
              <p className="text-xs text-muted-foreground">
                <span
                  className={`mr-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    r.status === "approved"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : r.status === "pending"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {r.status}
                </span>
                {r.rating ? `${r.rating}★ · ` : ""}
                {[r.role, r.company].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Source: {r.source}
                {r.submittedAt
                  ? ` · ${new Date(r.submittedAt).toLocaleString()}`
                  : ""}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {r.quote}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void moderate(r.id, "approved")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => void moderate(r.id, "rejected")}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => startEdit(r)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(r.id)}
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
