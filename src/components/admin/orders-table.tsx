"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { SearchIcon, ChevronRightIcon } from "lucide-react"
import { OrderDetailDrawer } from "@/components/admin/order-detail-drawer"
import type { Order, Network } from "@/types/domain"

const PAYMENT_COLORS: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
  PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
  REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
  NOT_APPLICABLE: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
}

const FULFILLMENT_COLORS: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
  PROCESSING: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
  ON_HOLD: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
  REFUND_PENDING: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
  REFUNDED: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
}

const FULFILLMENT_LABELS: Record<string, string> = {
  PROCESSING: "Processing",
  ON_HOLD: "On Hold",
  SUCCESS: "Delivered",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PENDING: "Pending",
  REFUND_PENDING: "Refund Pending",
}

const PAYMENT_LABELS: Record<string, string> = {
  SUCCESS: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  NOT_APPLICABLE: "N/A",
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    })
  } catch {
    return "—"
  }
}

export function AdminOrdersTable({
  initialOrders,
  networks,
}: {
  initialOrders: Order[]
  networks: Network[]
}) {
  const [query, setQuery] = useState("")
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()

  // Keep local state in sync when server refreshes initialOrders
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  // Polling: refresh server data every 10s
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 10000)
    return () => clearInterval(interval)
  }, [router])

  // Sort client-side by createdAt DESC (server already returns DESC but guard here too)
  const sorted = [...orders].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return tb - ta
  })

  const normalizedQuery = query.toLowerCase()
  const filtered = sorted.filter((o) => {
    const ref = (o.publicReference ?? "").toLowerCase()
    const phone = (o.recipientPhone ?? "").toLowerCase()
    const net = networks.find((n) => n.id === o.networkId)
    const netName = (net?.name ?? "").toLowerCase()
    return (
      ref.includes(normalizedQuery) ||
      phone.includes(normalizedQuery) ||
      netName.includes(normalizedQuery)
    )
  })

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    // Don't immediately null selectedOrder so the animation can finish
    setTimeout(() => setSelectedOrder(null), 300)
  }

  const handleOrderUpdated = useCallback((updated: Order) => {
    // Update in local list immediately
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    // Also update the selected order so the drawer reflects new status
    setSelectedOrder(updated)
    // Trigger a background refresh to stay in sync
    router.refresh()
  }, [router])

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, phone, network…"
                className="pl-9 h-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium">Reference</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Network</th>
                  <th className="px-4 py-3 text-left font-medium">Bundle</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Payment</th>
                  <th className="px-4 py-3 text-left font-medium">Delivery</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 w-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const net = networks.find((n) => n.id === order.networkId)
                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleRowClick(order)}
                      className={cn(
                        "border-b last:border-0 hover:bg-primary/5 transition-colors cursor-pointer group",
                        i % 2 === 0 ? "" : "bg-muted/10"
                      )}
                    >
                      <td className="px-4 py-3 font-mono font-medium">
                        <div className="flex items-center gap-2">
                          {order.publicReference}
                          {order.source === "MANUAL" && (
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase h-5 px-1 bg-slate-100 text-slate-500"
                            >
                              Manual
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                        {order.recipientPhone}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: net?.color ?? "#ccc" }}
                          />
                          {net?.name ?? order.networkId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.dataSizeSnapshot}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        GHS {order.sellingPriceSnapshot?.toFixed(2) ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-bold tracking-wider",
                            PAYMENT_COLORS[order.paymentStatus] || ""
                          )}
                        >
                          {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] font-bold tracking-wider",
                              FULFILLMENT_COLORS[order.fulfillmentStatus] || ""
                            )}
                          >
                            {FULFILLMENT_LABELS[order.fulfillmentStatus] || order.fulfillmentStatus}
                          </Badge>
                          {(order.fulfillmentProviderReference || order.providerReference) && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {order.fulfillmentProviderReference || order.providerReference}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground group-hover:text-foreground transition-colors">
                        <ChevronRightIcon className="size-4" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground text-sm">
                {query ? "No orders match your search." : "No orders yet."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <OrderDetailDrawer
        order={selectedOrder}
        networks={networks}
        open={drawerOpen}
        onClose={handleDrawerClose}
        onOrderUpdated={handleOrderUpdated}
      />
    </>
  )
}
