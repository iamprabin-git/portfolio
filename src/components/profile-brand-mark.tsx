import { initialsFromName } from "@/lib/initials";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  /** Size & shape for logo or initials box — e.g. `h-9 w-9 rounded-xl sm:h-10 sm:w-10` */
  frameClassName: string;
  /** Extra surface styles when showing initials (optional). */
  initialsFrameClassName?: string;
  /** Optional smaller initials text (footer) */
  initialsTextClassName?: string;
};

/** Logo image when `profile.logoUrl` is set; otherwise initials from name. */
export function ProfileBrandMark({
  profile,
  frameClassName,
  initialsFrameClassName,
  initialsTextClassName,
}: Props) {
  const url = profile.logoUrl.trim();
  if (url) {
    return (
      <span
        className={cn(
          "relative m-0 shrink-0 overflow-hidden rounded-full bg-muted p-0 ring-1 ring-border",
          frameClassName,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="m-0 block h-full w-full rounded-full object-cover p-0"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "m-0 flex shrink-0 items-center justify-center rounded-full bg-primary/15 p-0 text-primary shadow-inner ring-1 ring-primary/10 transition group-hover:bg-primary/22",
        frameClassName,
        initialsFrameClassName,
      )}
    >
      <span
        className={cn(
          "font-bold tracking-tight",
          initialsTextClassName ?? "text-xs sm:text-sm",
        )}
      >
        {initialsFromName(profile.name)}
      </span>
    </span>
  );
}
