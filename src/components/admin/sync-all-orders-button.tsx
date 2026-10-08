"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";

type ReconciliationSummary = {
  checked: number;
  updated: number;
  unchanged: number;
  failed: number;
  transitions: Record<string, number>;
  failures: Array<{ id: string; reference: string; error: string }>;
};

export function SyncAllOrdersButton() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const syncOrders = async () => {
    if (!window.confirm(
      "Reconcile all paid orders with DataMart? This checks orders that have a DataMart reference and updates fulfillment status only.",
    )) {
      return;
    }

    setIsSyncing(true);
    setSummary(null);
    setRequestError(null);

    try {
      const response = await fetch("/api/admin/orders/sync", { method: "POST" });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Order reconciliation failed.");
      }

      setSummary(result.summary as ReconciliationSummary);
      router.refresh();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Order reconciliation failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3 sm:items-end">
      <button
        type="button"
        onClick={syncOrders}
        disabled={isSyncing}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
      >
        <RefreshCwIcon className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
        {isSyncing ? "Syncing orders…" : "Sync All Orders"}
      </button>

      {requestError && (
        <p role="alert" className="max-w-xl text-sm text-destructive">
          {requestError}
        </p>
      )}

      {summary && (
        <div
          aria-live="polite"
          className="w-full max-w-xl rounded-md border bg-card p-4 text-sm shadow-sm sm:w-auto"
        >
          <h2 className="font-semibold">Sync completed</h2>
          <p className="mt-2">
            {summary.checked} orders checked · {summary.updated} updated · {summary.unchanged} unchanged · {summary.failed} failed to sync
          </p>

          {Object.keys(summary.transitions).length > 0 && (
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {Object.entries(summary.transitions).map(([transition, count]) => (
                <li key={transition}>{count} {transition}</li>
              ))}
            </ul>
          )}

          {summary.failures.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <h3 className="font-medium text-destructive">Failed orders</h3>
              <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto text-xs">
                {summary.failures.map((failure) => (
                  <li key={failure.id}>
                    <span className="font-mono">{failure.reference}</span>: {failure.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
