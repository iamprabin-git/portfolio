import { ChangeAdminPasswordForm } from "./change-password-form";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Security and account options for the admin panel.
        </p>
      </header>
      <ChangeAdminPasswordForm />
    </div>
  );
}
