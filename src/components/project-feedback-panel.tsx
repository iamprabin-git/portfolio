"use client";

import { StarRating } from "@/components/star-rating";
import type { ProjectFeedback } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]";

export function ProjectFeedbackPanel({
  projectId,
  initialApproved,
}: {
  projectId: string;
  initialApproved: ProjectFeedback[];
}) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [trapWebsite, setTrapWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDoneMsg(null);
    setPending(true);
    try {
      const res = await fetch("/api/public/project-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          authorName,
          email,
          comment,
          rating,
          trapWebsite,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not submit.");
        return;
      }
      setAuthorName("");
      setEmail("");
      setComment("");
      setRating(5);
      setDoneMsg(
        "Thanks! Your comment will appear after the owner approves it.",
      );
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-16 grid gap-12 border-t border-border pt-16 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-foreground">
          Feedback & reviews
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Share a quick rating and comment about this project. Submissions are
          moderated before they show up here.
        </p>
        <form className="mt-8 space-y-4" onSubmit={(e) => void submit(e)}>
          <input
            type="text"
            value={trapWebsite}
            onChange={(e) => setTrapWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            aria-hidden
          />
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Name
            <input
              className={inputClass}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              maxLength={120}
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Email (optional)
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={200}
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rating
            <select
              className={inputClass}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value={5}>5 stars</option>
              <option value={4}>4 stars</option>
              <option value={3}>3 stars</option>
              <option value={2}>2 stars</option>
              <option value={1}>1 star</option>
              <option value={0}>Comment only</option>
            </select>
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Comment
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              minLength={5}
              maxLength={2000}
            />
          </label>
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          {doneMsg ? (
            <p className="text-sm text-emerald-500" role="status">
              {doneMsg}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send feedback"}
          </button>
        </form>
      </div>
      <div className="lg:col-span-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Published feedback
        </h3>
        {initialApproved.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No approved comments yet. Be the first to leave feedback.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {initialApproved.map((f) => (
              <li
                key={f.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                {f.rating > 0 ? <StarRating rating={f.rating} /> : null}
                <p className="mt-3 text-foreground">{f.comment}</p>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  — {f.authorName}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
