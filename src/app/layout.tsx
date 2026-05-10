import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Providers } from "@/components/providers";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans-geist",
});

export const metadata: Metadata = {
  title: {
    default: "Developer Portfolio",
    template: "%s · Portfolio",
  },
  description:
    "Professional portfolio showcasing projects and skills as a web developer.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("portfolio-theme")?.value;
  const isDark = themeCookie === "dark";

  return (
    <html
      lang="en"
      className={cn(
        "h-full scroll-smooth",
        "font-sans",
        geist.variable,
        isDark && "dark",
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
