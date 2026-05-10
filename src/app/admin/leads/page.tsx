import { LeadsAdmin } from "./leads-admin";
import { readPortfolio } from "@/lib/portfolio-store";

export default async function AdminLeadsPage() {
  const { leads } = await readPortfolio();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        CRM system
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Open any row to edit pipeline value and priority, schedule{" "}
        <strong className="font-semibold text-foreground">
          call / SMS / meeting
        </strong>{" "}
        reminders, and capture{" "}
        <strong className="font-semibold text-foreground">
          what they said
        </strong>{" "}
        plus{" "}
        <strong className="font-semibold text-foreground">next-step plans</strong>
        . The table shows whether conversation notes exist (
        <span aria-hidden>✓</span>
        ) — reminders appear once you set a follow-up date and type.
      </p>
      <div className="mt-10">
        <LeadsAdmin initial={leads} />
      </div>
    </div>
  );
}
