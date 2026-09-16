"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Order } from "@/types/domain"
import { ClockIcon, PackageIcon } from "lucide-react"
import Image from "next/image"

// Network brand config – keyed on the networkId stored in Firestore
const NETWORK_BRAND: Record<string, { name: string; bg: string; textColor: string; logo?: string }> = {
  mtn: {
    name: "MTN",
    bg: "#FFCC00",
    textColor: "#000",
    logo: "/mtn-logo.png",
  },
  telecel: {
    name: "Telecel",
    bg: "#E3001B",
    textColor: "#fff",
    logo: "/telecel-logo.png",
  },
  airteltigo: {
    name: "AirtelTigo",
    bg: "#E40000",
    textColor: "#fff",
    logo: "/airteltigo-logo.png",
  },
}

function NetworkBadge({ networkId }: { networkId: string }) {
  const brand = NETWORK_BRAND[networkId?.toLowerCase()] ?? null

  if (!brand) {
    return (
      <Badge variant="outline" className="capitalize">
        {networkId || "Unknown"}
      </Badge>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: brand.bg, color: brand.textColor }}
    >
      {brand.name}
    </span>
  )
}

function FulfillmentBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase()
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
  if (s === "SUCCESS") variant = "default"
  else if (s === "FAILED") variant = "destructive"
  else if (s === "ON_HOLD" || s === "PROCESSING") variant = "outline"
  return <Badge variant={variant}>{status || "—"}</Badge>
}

export function CustomerDetailDrawer({
  phone,
  open,
  onOpenChange,
}: {
  phone: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && phone) {
      setLoading(true)
      setError(null)
      fetch(`/api/admin/customers/orders?phone=${encodeURIComponent(phone)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load customer orders")
          return res.json()
        })
        .then((data) => {
          const fetchedOrders: Order[] = data.orders || []
          setOrders(fetchedOrders)

          // Auto-sync: patch the customer document with real live stats
          // so the table row never shows stale data again
          const realTotalOrders = fetchedOrders.length
          const realTotalSpent = fetchedOrders.reduce((sum, o) => sum + (o.sellingPriceSnapshot || 0), 0)
          if (data.customerId) {
            fetch(`/api/admin/customers/${data.customerId}/sync`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ totalOrders: realTotalOrders, totalSpent: realTotalSpent }),
            }).catch(() => {}) // Fire and forget — don't block the UI
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    } else {
      setOrders([])
    }
  }, [open, phone])

  const totalRevenue = orders.reduce((sum, o) => sum + (o.sellingPriceSnapshot || 0), 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>Customer Details</SheetTitle>
          <SheetDescription>Order history for {phone}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : error ? (
            <div className="text-red-500 bg-red-50 p-4 rounded-md text-sm">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
                  <div className="text-2xl font-bold">{orders.length}</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Spent</div>
                  <div className="text-2xl font-bold">
                    GHS {totalRevenue.toFixed(2)}
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-sm text-muted-foreground pt-4 border-t uppercase tracking-wider">Order History</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No operational orders found.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const networkId = (order.networkId || "").toLowerCase()
                    const brand = NETWORK_BRAND[networkId]
                    return (
                      <div key={order.id} className="border rounded-lg p-4 space-y-3">
                        {/* Header row: ref + network logo chip + payment status */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-mono text-xs text-muted-foreground truncate">
                            {order.publicReference || order.id}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <NetworkBadge networkId={order.networkId} />
                            <Badge variant="secondary" className="text-xs">{order.paymentStatus}</Badge>
                          </div>
                        </div>

                        {/* Bundle info row */}
                        <div className="flex items-center justify-between gap-2">
                          {/* Telco logo + bundle name */}
                          <div className="flex items-center gap-2">
                            {brand ? (
                              <span
                                className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: brand.bg, color: brand.textColor }}
                              >
                                {brand.name.slice(0, 2)}
                              </span>
                            ) : null}
                            <div>
                              <div className="font-semibold text-sm">{order.bundleNameSnapshot}</div>
                              <div className="text-xs text-muted-foreground">{order.dataSizeSnapshot}</div>
                            </div>
                          </div>
                          <div className="font-bold text-sm">GHS {order.sellingPriceSnapshot?.toFixed(2)}</div>
                        </div>

                        {/* Footer row: date + fulfillment status */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {new Date(order.createdAt).toLocaleString("en-GB", {
                              timeZone: "Africa/Accra",
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </div>
                          <FulfillmentBadge status={order.fulfillmentStatus} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
