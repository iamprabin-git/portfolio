"use client";

import type { ProjectFeedback, ProjectFeedbackStatus } from "@/lib/types";
import { useMemo, useState } from "react";

export function ProjectFeedbackAdmin({
  projects,
  initialFeedback,
}: {
  projects: { id: string; title: string }[];
  initialFeedback: ProjectFeedback[];
}) {
  const [items, setItems] = useState(initialFeedback);
  const [error, setError] = useState<string | null>(null);

  const titleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of projects) m.set(p.id, p.title);
    return m;
  }, [projects]);

  const pendingQueue = items.filter((f) => f.status === "pending");

  async function moderate(id: string, status: ProjectFeedbackStatus) {
    setError(null);
    const res = await fetch(`/api/admin/project-feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError((data as { error?: string }).error ?? "Update failed");
      return;
    }
    const u = data as ProjectFeedback;
    setItems((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this feedback permanently?")) return;
    setError(null);
    const res = await fetch(`/api/admin/project-feedback/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      setError((data as { error?: string }).error ?? "Delete failed");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {pendingQueue.length > 0 ? (
        <section className="rounded-xl border border-[color-mix(in_oklab,orange_45%,var(--border))] bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Pending project feedback ({pendingQueue.length})
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Approvals appear on each project&apos;s detail page under Feedback &
            reviews.
          </p>
          <ul className="mt-4 space-y-4">
            {pendingQueue.map((f) => (
              <li
                key={f.id}
                className="rounded-lg border border-border bg-muted p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {titleById.get(f.projectId) ?? f.projectId}
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {f.authorName}
                  {f.email ? (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {f.email}
                    </span>
                  ) : null}
                </p>
                {f.rating > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {f.rating}★ rating
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-foreground">{f.comment}</p>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {new Date(f.submittedAt).toLocaleString()}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void moderate(f.id, "approved")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void moderate(f.id, "rejected")}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(f.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-foreground">
          All project feedback
        </h2>
        {error ? (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <ul className="mt-4 space-y-3">
          {items.map((f) => (
            <li
              key={f.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-primary">
                    {titleById.get(f.projectId) ?? f.projectId}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {f.authorName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {f.email || "No email"}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    f.status === "approved"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : f.status === "pending"
                        ? "bg-orange-500/15 text-orange-400"
                        : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {f.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{f.comment}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {f.status !== "approved" ? (
                  <button
                    type="button"
                    onClick={() => void moderate(f.id, "approved")}
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Approve
                  </button>
                ) : null}
                {f.status !== "rejected" ? (
                  <button
                    type="button"
                    onClick={() => void moderate(f.id, "rejected")}
                    className="rounded-lg border border-border px-3 py-1 text-xs font-semibold"
                  >
                    Reject
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void remove(f.id)}
                  className="rounded-lg px-3 py-1 text-xs font-semibold text-red-400"
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
