import { redirect } from "next/navigation";
import { getMaintenanceState } from "@/lib/maintenance";
import { Zap } from "lucide-react";
import { GlobeBackground } from "@/components/buy/globe-background";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const state = await getMaintenanceState();

  if (!state.enabled) {
    redirect("/");
  }

  return (
    <main className="relative z-0 flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-12 text-foreground">
      <GlobeBackground />

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-card/80 p-8 shadow-2xl backdrop-blur-md sm:p-12">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg text-primary-foreground">
            <Zap className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">BundleUp</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">System Upgrade</h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            {state.message || "We are currently making a few changes to improve your experience. We will be right back."}
          </p>
        </div>

        <div className="mt-8 pt-8 border-t text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Need urgent help with a pending order?
          </p>
          <a href="mailto:support@bundleup.com.gh" className="text-sm font-medium text-primary hover:underline transition-colors">
            support@bundleup.com.gh
          </a>
        </div>
      </div>
    </main>
  );
}
