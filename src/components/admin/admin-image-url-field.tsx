"use client";

import { useId, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]";

const MAX_BYTES = 5 * 1024 * 1024;

export function AdminImageUrlField({
  label,
  value,
  onChange,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  className?: string;
}) {
  const id = useId();
  const fileInputId = `${id}-file`;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError("Max file size is 5 MB.");
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      let data: { error?: string; url?: string };
      try {
        data = (await res.json()) as { error?: string; url?: string };
      } catch {
        setUploadError("Upload failed.");
        return;
      }
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        return;
      }
      if (typeof data.url === "string") {
        onChange(data.url);
      }
    } catch {
      setUploadError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          type="text"
          className={`${inputClass} min-w-0 sm:flex-1`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload an image"
          autoComplete="off"
        />
        <label
          htmlFor={fileInputId}
          className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))] sm:w-36 ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? "Uploading…" : "Upload image"}
        </label>
        <input
          id={fileInputId}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(e) => void onFileChange(e)}
          disabled={uploading}
        />
      </div>
      {hint ? (
        <span className="mt-1 block text-[11px] font-normal normal-case leading-snug text-muted-foreground">
          {hint}
        </span>
      ) : null}
      {uploadError ? (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {uploadError}
        </p>
      ) : null}
      {value.trim() ? (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="max-h-28 max-w-full rounded-lg border border-border bg-muted object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
