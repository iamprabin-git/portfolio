import { SponsorsAdmin } from "./sponsors-admin";
import { readPortfolio } from "@/lib/portfolio-store";

export default async function AdminSponsorsPage() {
  const { sponsors } = await readPortfolio();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Sponsors
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Logos appear on the homepage sponsors section. Use square or wide PNG /
        SVG URLs.
      </p>
      <div className="mt-10">
        <SponsorsAdmin initial={sponsors} />
      </div>
    </div>
  );
}
