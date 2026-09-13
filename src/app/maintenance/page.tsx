import { redirect } from "next/navigation";
import { getMaintenanceState } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  const state = getMaintenanceState();

  if (!state.enabled) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            P
          </div>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Play Ato</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Temporarily unavailable</h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">{state.message}</p>
        </div>
      </div>
    </main>
  );
}
