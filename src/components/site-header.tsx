"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ProfileBrandMark } from "@/components/profile-brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { primaryNavLinks } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

function navLinkClass(active: boolean) {
  return cn(
    "rounded-lg px-3 py-2 text-sm font-semibold tracking-wide transition",
    active
      ? "bg-primary/15 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

export function SiteHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function activeHref(href: string) {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/75">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 rounded-lg outline-none ring-ring/60 transition focus-visible:ring-2"
        >
          <ProfileBrandMark
            profile={profile}
            frameClassName="h-12 w-12 sm:h-14 sm:w-14"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-foreground transition group-hover:text-primary">
              {profile.name}
            </span>
            <span className="hidden truncate text-[11px] font-medium text-muted-foreground sm:block">
              {profile.title}
            </span>
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <nav
            className="hidden items-center gap-0.5 md:flex lg:gap-1"
            aria-label="Primary"
          >
            {primaryNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(activeHref(item.href))}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Separator orientation="vertical" className="hidden !h-6 md:block" />

          <ThemeToggle />

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="flex w-[min(100vw-1rem,20rem)] flex-col gap-0 p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="font-heading">Menu</SheetTitle>
            <SheetDescription>Navigate the portfolio</SheetDescription>
          </SheetHeader>
          <nav
            className="flex flex-col gap-1 p-3"
            aria-label="Mobile primary navigation"
          >
            {primaryNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(navLinkClass(activeHref(item.href)), "w-full")}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
