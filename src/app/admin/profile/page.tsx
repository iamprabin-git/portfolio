import { ProfileForm } from "./profile-form";
import { readPortfolio } from "@/lib/portfolio-store";

export default async function AdminProfilePage() {
  const { profile } = await readPortfolio();
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Profile
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sets hero copy and footer links on the public site.
      </p>
      <div className="mt-10">
        <ProfileForm initial={profile} />
      </div>
    </div>
  );
}
