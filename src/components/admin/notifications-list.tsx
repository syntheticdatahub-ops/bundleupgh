"use client"

import { useState } from "react"
import { AlertTriangleIcon, ClockIcon, CheckCircle2Icon, RefreshCwIcon, Loader2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Order, Network } from "@/types/domain"
import { useRouter } from "next/navigation"

const FULFILLMENT_COLORS: Record<string, string> = {
  SUCCESS:  "text-green-600 bg-green-500/10",
  PROCESSING: "text-blue-600 bg-blue-500/10",
  ON_HOLD:  "text-amber-600 bg-amber-500/10",
  PENDING:  "text-amber-600 bg-amber-500/10",
  FAILED:   "text-red-600 bg-red-500/10",
  REFUNDED: "text-slate-600 bg-slate-500/10",
}

const FULFILLMENT_LABELS: Record<string, string> = {
  PROCESSING: "Processing",
  ON_HOLD:    "On Hold",
  SUCCESS:    "Delivered",
  FAILED:     "Failed",
  REFUNDED:   "Refunded",
  PENDING:    "Pending",
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      timeZone: "Africa/Accra",
      day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit",
    })
  } catch { return iso }
}

export function NotificationsList({
  failedOrders,
  onHoldOrders,
  processingOrders,
  networks,
}: {
  failedOrders: Order[]
  onHoldOrders: Order[]
  processingOrders: Order[]
  networks: Network[]
}) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkRetrying, setIsBulkRetrying] = useState(false)

  const getNet = (id: string) => networks.find(n => n.id === id)

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleAllFailed = () => {
    if (selectedIds.size === failedOrders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(failedOrders.map(o => o.id)))
    }
  }

  const handleBulkRetry = async () => {
    if (selectedIds.size === 0) return
    setIsBulkRetrying(true)
    
    let successCount = 0
    let failCount = 0
    
    for (const id of Array.from(selectedIds)) {
      try {
        const res = await fetch(`/api/admin/orders/${id}/retry`, { method: "POST" })
        if (res.ok) successCount++
        else failCount++
      } catch {
        failCount++
      }
    }
    
    setIsBulkRetrying(false)
    setSelectedIds(new Set())
    alert(`Bulk retry complete.\nSuccess: ${successCount}\nFailed: ${failCount}`)
    router.refresh()
  }

  const totalActionRequired = failedOrders.length + onHoldOrders.length

  if (totalActionRequired === 0 && processingOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border rounded-2xl py-16 gap-3 text-center">
        <CheckCircle2Icon className="size-12 text-green-500" />
        <p className="text-lg font-semibold">All clear!</p>
        <p className="text-sm text-muted-foreground">No failed deliveries, no orders on hold, nothing processing.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {failedOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap border-b pb-2">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="size-4 text-red-600" />
                <h2 className="font-semibold text-red-600">
                  Delivery Failed
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({failedOrders.length})</span>
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Paid orders where DataMart delivery failed. Top up your account, select them, and hit Resubmit.</p>
            </div>
            
            {selectedIds.size > 0 && (
              <Button 
                onClick={handleBulkRetry} 
                disabled={isBulkRetrying}
                className="bg-red-600 hover:bg-red-700 text-white shadow-sm shrink-0"
                size="sm"
              >
                {isBulkRetrying ? (
                  <><Loader2Icon className="size-3 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <>🔄 Resubmit Selected ({selectedIds.size})</>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {failedOrders.map(o => (
              <div key={o.id} className="flex items-center gap-3 border rounded-xl px-4 py-3 hover:bg-muted/30 transition-colors">
                <input 
                  type="checkbox"
                  checked={selectedIds.has(o.id)}
                  onChange={() => toggleSelect(o.id)}
                  className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                />
                <a href={`/admin/orders?search=${encodeURIComponent(o.recipientPhone || "")}`} className="flex-1 min-w-0 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold truncate">{o.publicReference}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.recipientPhone} · {getNet(o.networkId)?.name || o.networkId} · {o.dataSizeSnapshot}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {o.fulfillmentStatus === "FAILED" && (o.autoRetryCount || 0) > 0 && (
                      <span className="text-[10px] text-muted-foreground mr-1">
                        Auto-retry: {o.autoRetryCount}/3
                      </span>
                    )}
                    <Badge variant="secondary" className={`text-[10px] font-bold ${FULFILLMENT_COLORS[o.fulfillmentStatus] || ""}`}>
                      {FULFILLMENT_LABELS[o.fulfillmentStatus] || o.fulfillmentStatus}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(o.createdAt)}</span>
                  </div>
                </a>
              </div>
            ))}
          </div>
          <div className="pt-1 px-1">
            <button type="button" onClick={toggleAllFailed} className="text-xs text-muted-foreground hover:underline">
              {selectedIds.size === failedOrders.length ? "Deselect all" : "Select all failed orders"}
            </button>
          </div>
        </div>
      )}

      {onHoldOrders.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="size-4 text-amber-600" />
            <h2 className="font-semibold text-amber-600">
              On Hold
              <span className="ml-2 text-sm font-normal text-muted-foreground">({onHoldOrders.length})</span>
            </h2>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">DataMart is verifying the recipient number. These usually resolve on their own.</p>

          <div className="space-y-2">
            {onHoldOrders.map(o => (
              <a key={o.id} href={`/admin/orders?search=${encodeURIComponent(o.recipientPhone || "")}`} className="flex items-center justify-between gap-4 border rounded-xl px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <ClockIcon className="size-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold truncate">{o.publicReference}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.recipientPhone} · {getNet(o.networkId)?.name || o.networkId} · {o.dataSizeSnapshot}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className={`text-[10px] font-bold ${FULFILLMENT_COLORS[o.fulfillmentStatus] || ""}`}>
                    {FULFILLMENT_LABELS[o.fulfillmentStatus] || o.fulfillmentStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(o.createdAt)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {processingOrders.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between gap-4 flex-wrap border-b pb-2">
            <div>
              <div className="flex items-center gap-2">
                <RefreshCwIcon className="size-4 text-blue-600" />
                <h2 className="font-semibold text-blue-600">
                  Still Processing
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({processingOrders.length})</span>
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Orders submitted to DataMart that haven't confirmed delivery yet.</p>
            </div>
            
            <Button 
              onClick={async () => {
                setIsBulkRetrying(true)
                let successCount = 0
                for (const o of processingOrders) {
                  try {
                    const res = await fetch(`/api/admin/orders/${o.id}/sync`, { method: "POST" })
                    if (res.ok) successCount++
                  } catch (e) {}
                }
                setIsBulkRetrying(false)
                alert(`Sync complete for ${successCount} orders.`)
                router.refresh()
              }} 
              disabled={isBulkRetrying}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0"
              size="sm"
            >
              {isBulkRetrying ? (
                <><Loader2Icon className="size-3 mr-2 animate-spin" /> Syncing...</>
              ) : (
                <>🔄 Auto-Sync All</>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {processingOrders.map(o => (
              <a key={o.id} href={`/admin/orders?search=${encodeURIComponent(o.recipientPhone || "")}`} className="flex items-center justify-between gap-4 border rounded-xl px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <RefreshCwIcon className="size-4 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-semibold truncate">{o.publicReference}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.recipientPhone} · {getNet(o.networkId)?.name || o.networkId} · {o.dataSizeSnapshot}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className={`text-[10px] font-bold ${FULFILLMENT_COLORS[o.fulfillmentStatus] || ""}`}>
                    {FULFILLMENT_LABELS[o.fulfillmentStatus] || o.fulfillmentStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(o.createdAt)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
