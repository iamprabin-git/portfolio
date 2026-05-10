import { SiteAmbientEffects } from "@/components/site-ambient-effects";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { readPortfolio } from "@/lib/portfolio-store";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await readPortfolio();
  return (
    <div className="relative isolate flex min-h-full flex-col bg-background">
      <SiteAmbientEffects />
      <SiteHeader profile={profile} />
      <main className="relative z-10 flex-1">{children}</main>
      <SiteFooter profile={profile} />
    </div>
  );
}
