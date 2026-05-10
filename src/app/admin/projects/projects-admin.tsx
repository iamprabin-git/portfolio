"use client";

import { AdminImageUrlField } from "@/components/admin/admin-image-url-field";
import type { Project } from "@/lib/types";
import { useMemo, useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]";

const emptyForm = {
  title: "",
  summary: "",
  description: "",
  imageUrl: "",
  tags: "",
  demoUrl: "",
  repoUrl: "",
  featured: false,
};

export function ProjectsAdmin({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const editing = useMemo(
    () => projects.find((p) => p.id === editingId) ?? null,
    [projects, editingId],
  );

  function startEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      summary: p.summary,
      description: p.description,
      imageUrl: p.imageUrl,
      tags: p.tags.join(", "),
      demoUrl: p.demoUrl,
      repoUrl: p.repoUrl,
      featured: p.featured,
    });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function parseTags(s: string): string[] {
    return s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          description: form.description,
          imageUrl: form.imageUrl,
          tags: parseTags(form.tags),
          demoUrl: form.demoUrl,
          repoUrl: form.repoUrl,
          featured: form.featured,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not create");
        return;
      }
      setProjects((prev) => [...prev, data as Project]);
      setForm(emptyForm);
    } finally {
      setPending(false);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/admin/projects/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          description: form.description,
          imageUrl: form.imageUrl,
          tags: parseTags(form.tags),
          demoUrl: form.demoUrl,
          repoUrl: form.repoUrl,
          featured: form.featured,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not save");
        return;
      }
      const updated = data as Project;
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      cancelEdit();
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    setError(null);
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError((data as { error?: string }).error ?? "Delete failed");
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) cancelEdit();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          {editing ? "Edit project" : "Add project"}
        </h2>
        <form
          className="mt-4 grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2"
          onSubmit={(e) => void (editing ? saveEdit(e) : createProject(e))}
        >
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
            Title
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
            Summary (short)
            <input
              className={inputClass}
              value={form.summary}
              onChange={(e) =>
                setForm((f) => ({ ...f, summary: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
            Description
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>
          <AdminImageUrlField
            className="sm:col-span-2"
            label="Project image"
            value={form.imageUrl}
            onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
            hint="Cover image for cards on the site."
          />
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
            Tags (comma-separated)
            <input
              className={inputClass}
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="Next.js, TypeScript"
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Demo URL
            <input
              className={inputClass}
              value={form.demoUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, demoUrl: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Repo URL
            <input
              className={inputClass}
              value={form.repoUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, repoUrl: e.target.value }))
              }
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, featured: e.target.checked }))
              }
              className="rounded border-border bg-muted text-primary"
            />
            Featured (shown prominently on home)
          </label>
          {error ? (
            <p className="text-sm text-red-400 sm:col-span-2" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
            >
              {pending
                ? "Saving…"
                : editing
                  ? "Update project"
                  : "Add project"}
            </button>
            {editing ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          All projects
        </h2>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.featured ? "Featured · " : ""}
                  {p.tags.join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(p.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-muted"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
