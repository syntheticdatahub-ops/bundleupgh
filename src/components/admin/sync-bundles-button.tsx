"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SyncResult {
  imported: number
  created: number
  updated: number
  unchanged: number
  deactivated: number
  reactivated: number
  failed: number
  syncedAt: string
}

export function SyncBundlesButton() {
  const [syncing, setSyncing] = useState(false)
  const [lastResult, setLastResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setLastResult(null)

    try {
      const res = await fetch("/api/admin/bundles/sync", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Sync failed")
        return
      }

      setLastResult(data as SyncResult)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Network error during sync")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleSync} disabled={syncing} className="gap-2">
        <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
        {syncing ? "Syncing..." : "Sync DataMart Catalog"}
      </Button>

      {/* Result summary */}
      {lastResult && (
        <div className="flex flex-col items-start gap-1 text-xs rounded-lg border px-3 py-2 bg-card text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span className="font-medium text-foreground">Catalog Sync Complete</span>
            <span>({new Date(lastResult.syncedAt).toLocaleTimeString()})</span>
          </div>
          <div className="ml-5.5 grid grid-cols-2 gap-x-6 gap-y-0.5 mt-1">
            <span>Total imported: <span className="font-medium text-foreground">{lastResult.imported}</span></span>
            <span>New packages: <span className="text-green-600 dark:text-green-400 font-medium">{lastResult.created}</span></span>
            <span>Cost updated: <span className="text-blue-600 dark:text-blue-400 font-medium">{lastResult.updated}</span></span>
            <span>Unchanged: <span>{lastResult.unchanged}</span></span>
            <span>Reactivated: <span className="text-purple-600 dark:text-purple-400 font-medium">{lastResult.reactivated}</span></span>
            <span>Unavailable: <span className="text-red-600 dark:text-red-400 font-medium">{lastResult.deactivated}</span></span>
            {lastResult.failed > 0 && <span className="text-red-500 col-span-2">Failed: {lastResult.failed}</span>}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 text-xs rounded-lg border border-red-500/20 px-3 py-2 bg-red-500/5 text-red-500">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
