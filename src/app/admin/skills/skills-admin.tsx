"use client";

import type { Skill } from "@/lib/types";
import { SKILL_ICON_OPTIONS } from "@/lib/skill-icons";
import { SkillGlyph } from "@/components/skill-glyph";
import { useEffect, useMemo, useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]";

function parseSinceYear(s: string, maxYear: number): number | null {
  const t = s.trim();
  if (t === "") return 0;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 1970 || n > maxYear) return null;
  return n;
}

export function SkillsAdmin({ initial }: { initial: Skill[] }) {
  const maxYear = useMemo(() => new Date().getFullYear() + 1, []);

  const [skills, setSkills] = useState(initial);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [proficiency, setProficiency] = useState(70);
  const [sinceYearStr, setSinceYearStr] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sy = parseSinceYear(sinceYearStr, maxYear);
    if (sy === null) {
      setError("Since year must be empty or between 1970 and " + maxYear);
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          icon,
          proficiency,
          sinceYear: sy,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not add skill");
        return;
      }
      setSkills((prev) => [...prev, data as Skill]);
      setName("");
      setProficiency(70);
      setSinceYearStr("");
      setIcon("");
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this skill?")) return;
    setError(null);
    const res = await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError((data as { error?: string }).error ?? "Delete failed");
      return;
    }
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  async function saveRow(
    id: string,
    nextName: string,
    nextCat: string,
    nextProf: number,
    nextSince: number,
    nextIcon: string,
  ) {
    setError(null);
    const res = await fetch(`/api/admin/skills/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nextName,
        category: nextCat,
        proficiency: nextProf,
        sinceYear: nextSince,
        icon: nextIcon,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError((data as { error?: string }).error ?? "Update failed");
      return;
    }
    const s = data as Skill;
    setSkills((prev) => prev.map((x) => (x.id === id ? s : x)));
  }

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const k = s.category || "General";
    if (!acc[k]) acc[k] = [];
    acc[k].push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <form
        className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-6"
        onSubmit={(e) => void add(e)}
      >
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
          Skill name
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. PostgreSQL"
            required
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
          Category
          <input
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Frontend"
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground sm:col-span-2">
          Icon (public site)
          <select
            className={inputClass}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            <option value="">Default (sparkle)</option>
            {SKILL_ICON_OPTIONS.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Proficiency (%)
          <input
            className={inputClass}
            type="number"
            min={0}
            max={100}
            step={1}
            value={proficiency}
            onChange={(e) => {
              const v = Number(e.target.value);
              setProficiency(
                Number.isFinite(v)
                  ? Math.min(100, Math.max(0, Math.round(v)))
                  : 0,
              );
            }}
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Since year
          <input
            className={inputClass}
            type="number"
            min={1970}
            max={maxYear}
            value={sinceYearStr}
            onChange={(e) => setSinceYearStr(e.target.value)}
            placeholder={`e.g. ${maxYear - 3}`}
          />
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-6">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add skill"}
          </button>
        </div>
      </form>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Icons appear next to each skill on the site. Proficiency drives the bar
        chart (0–100). Since year adds the skill to the public timeline; leave
        blank to omit from the timeline.
      </p>

      <div className="space-y-8">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              {cat}
            </h3>
            <ul className="mt-3 space-y-3">
              {items.map((s) => (
                <SkillRow
                  key={s.id}
                  skill={s}
                  maxYear={maxYear}
                  onSave={saveRow}
                  onDelete={remove}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillRow({
  skill,
  maxYear,
  onSave,
  onDelete,
}: {
  skill: Skill;
  maxYear: number;
  onSave: (
    id: string,
    name: string,
    category: string,
    proficiency: number,
    sinceYear: number,
    icon: string,
  ) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}) {
  const [name, setName] = useState(skill.name);
  const [category, setCategory] = useState(skill.category);
  const [proficiency, setProficiency] = useState(skill.proficiency);
  const [sinceYearStr, setSinceYearStr] = useState(
    skill.sinceYear > 0 ? String(skill.sinceYear) : "",
  );
  const [icon, setIcon] = useState(skill.icon);

  useEffect(() => {
    setName(skill.name);
    setCategory(skill.category);
    setProficiency(skill.proficiency);
    setSinceYearStr(skill.sinceYear > 0 ? String(skill.sinceYear) : "");
    setIcon(skill.icon);
  }, [skill]);

  const parsedSince = parseSinceYear(sinceYearStr, maxYear);
  const sinceOk = parsedSince !== null;
  const dirty =
    sinceOk &&
    (name !== skill.name ||
      category !== skill.category ||
      proficiency !== skill.proficiency ||
      parsedSince !== skill.sinceYear ||
      icon !== skill.icon);

  return (
    <li className="rounded-lg border border-border bg-muted p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <SkillGlyph icon={icon} className="h-8 w-8 text-primary" />
          <span className="text-xs text-muted-foreground">Preview</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Skill name"
          />
          <input
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
          />
        </div>
        <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Icon
          <select
            className={inputClass}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            aria-label="Skill icon"
          >
            <option value="">Default (sparkle)</option>
            {SKILL_ICON_OPTIONS.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Proficiency (%)
            <input
              className={inputClass}
              type="number"
              min={0}
              max={100}
              step={1}
              value={proficiency}
              onChange={(e) => {
                const v = Number(e.target.value);
                setProficiency(
                  Number.isFinite(v)
                    ? Math.min(100, Math.max(0, Math.round(v)))
                    : 0,
                );
              }}
            />
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Since year (optional)
            <input
              className={inputClass}
              type="number"
              min={1970}
              max={maxYear}
              step={1}
              value={sinceYearStr}
              onChange={(e) => setSinceYearStr(e.target.value)}
              placeholder="Leave blank for timeline"
            />
          </label>
        </div>
        {!sinceOk ? (
          <p className="text-xs text-red-400">
            Year must be empty or between {1970} and {maxYear}.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!dirty || !sinceOk}
            onClick={() =>
              sinceOk &&
              void onSave(
                skill.id,
                name,
                category,
                proficiency,
                parsedSince,
                icon,
              )
            }
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => void onDelete(skill.id)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-card"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
