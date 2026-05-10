"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "CRM" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/project-feedback", label: "Project feedback" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function itemActive(href: string) {
    return href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);
  }

  const linkClass = (href: string) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition",
      itemActive(href)
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-56 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="shrink-0 border-b border-border px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            Portfolio CMS
          </p>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3 overscroll-contain">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="shrink-0 border-t border-border p-3">
          <div className="mb-2 flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs font-medium text-muted-foreground">
              Theme
            </span>
          </div>
          <Button
            variant="outline"
            type="button"
            className="w-full justify-start font-medium text-muted-foreground hover:text-foreground"
            onClick={() => void logout()}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col md:pl-56">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md md:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Open admin navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <span className="truncate text-sm font-semibold">Admin</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="text-xs font-semibold"
              onClick={() => void logout()}
            >
              Sign out
            </Button>
          </div>
        </header>

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side="left"
            className="flex h-full max-h-[100dvh] w-[min(100vw-1rem,18rem)] flex-col gap-0 p-0 sm:max-w-xs"
          >
            <SheetHeader className="border-b border-border px-4 py-4 text-left">
              <SheetTitle className="font-heading">Admin</SheetTitle>
              <SheetDescription>Portfolio CMS navigation</SheetDescription>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1">
              <nav className="flex flex-col gap-0.5 p-3 pb-6">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={linkClass(item.href)}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </ScrollArea>
            <Separator />
            <div className="space-y-3 p-3">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-xs font-medium text-muted-foreground">
                  Theme
                </span>
              </div>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={() => void logout()}
              >
                Sign out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <main className="flex-1 px-4 py-6 sm:py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
