"use client";

import { ThemeCookieSync } from "@/components/theme-cookie-sync";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeCookieSync />
      {children}
      <Toaster richColors position="top-center" closeButton />
    </>
  );
}
