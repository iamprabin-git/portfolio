"use client";

import { ADMIN_PASSWORD_MIN_LENGTH } from "@/lib/admin-password-policy";
import { useState } from "react";

export function ChangeAdminPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update password.");
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]";

  return (
    <form
      className="rounded-xl border border-border bg-card p-6"
      onSubmit={(e) => void submit(e)}
    >
      <h2 className="text-sm font-semibold text-foreground">Admin password</h2>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        After you save a new password here, sign-in uses this stored hash only
        (your <code className="text-primary">ADMIN_PASSWORD</code> env value is
        no longer checked). Minimum {ADMIN_PASSWORD_MIN_LENGTH} characters.
      </p>

      <label className="mt-6 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Current password
        <input
          className={inputClass}
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </label>
      <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        New password
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={ADMIN_PASSWORD_MIN_LENGTH}
          required
        />
      </label>
      <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Confirm new password
        <input
          className={inputClass}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={ADMIN_PASSWORD_MIN_LENGTH}
          required
        />
      </label>

      {error ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 text-sm text-emerald-500" role="status">
          Password updated. Use it next time you sign in.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
