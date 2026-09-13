"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { SearchIcon, ChevronRightIcon, FilterIcon } from "lucide-react"
import { OrderDetailDrawer } from "@/components/admin/order-detail-drawer"
import type { Order, Network } from "@/types/domain"

const PAYMENT_COLORS: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
  PAID: "text-green-600 bg-green-500/10 dark:text-green-400",
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
  PAID: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  NOT_APPLICABLE: "N/A",
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      timeZone: "Africa/Accra",
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  } catch {
    return "—"
  }
}

export function AdminOrdersTable({
  initialOrders,
  networks,
  currentPage,
  hasNextPage,
  nextCursor,
}: {
  initialOrders: Order[]
  networks: Network[]
  currentPage: number
  hasNextPage: boolean
  nextCursor?: string
}) {
  const [query, setQuery] = useState("")
  
  // Filters
  const [paymentFilter, setPaymentFilter] = useState("OPERATIONAL") // OPERATIONAL, ALL, PENDING, FAILED, REFUNDED
  const [networkFilter, setNetworkFilter] = useState("ALL")
  const [fulfillmentFilter, setFulfillmentFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  // Auto-refresh loop removed (Phase 1 of the Firestore read audit): this
  // previously called router.refresh() every 10s, which re-rendered the entire
  // admin server component and re-read the whole /orders + /networks
  // collections each time. Data now refreshes via explicit actions (e.g.
  // handleOrderUpdated after a status mutation) or a full page navigation.

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setTimeout(() => setSelectedOrder(null), 300)
  }

  const handleOrderUpdated = useCallback((updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    setSelectedOrder(updated)
    router.refresh()
  }, [router])

  const changePage = useCallback((nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    const safePage = Math.max(1, nextPage)

    if (safePage <= 1) {
      params.delete("page")
      params.delete("cursor")
    } else {
      params.set("page", String(safePage))
      if (safePage === currentPage + 1 && nextCursor) {
        params.set("cursor", nextCursor)
      } else if (safePage < currentPage) {
        params.delete("cursor")
      }
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }, [currentPage, nextCursor, pathname, router, searchParams])

  const filtered = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })

    const normalizedQuery = query.toLowerCase()
    
    // Calculate Date Boundaries using Ghana time (UTC+0)
    const now = new Date()
    
    // Helper to get start of day in UTC (Ghana time)
    const getStartOfDayUTC = (d: Date) => {
      const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
      return utc.getTime()
    }
    
    let fromTime = 0
    let toTime = Infinity

    if (dateFilter === "TODAY") {
      fromTime = getStartOfDayUTC(now)
    } else if (dateFilter === "YESTERDAY") {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      fromTime = getStartOfDayUTC(yesterday)
      toTime = getStartOfDayUTC(now) - 1
    } else if (dateFilter === "7DAYS") {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      fromTime = getStartOfDayUTC(past)
    } else if (dateFilter === "30DAYS") {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      fromTime = getStartOfDayUTC(past)
    } else if (dateFilter === "CUSTOM") {
      if (dateFrom) {
        const [y, m, d] = dateFrom.split("-").map(Number)
        fromTime = Date.UTC(y, m - 1, d)
      }
      if (dateTo) {
        const [y, m, d] = dateTo.split("-").map(Number)
        toTime = Date.UTC(y, m - 1, d, 23, 59, 59, 999)
      }
    }

    return sorted.filter((o) => {
      // 1. Text Search
      if (normalizedQuery) {
        const ref = (o.publicReference ?? "").toLowerCase()
        const phone = (o.recipientPhone ?? "").toLowerCase()
        const netObj = networks.find((n) => n.id === o.networkId)
        const netName = (netObj?.name ?? "").toLowerCase()
        
        if (!ref.includes(normalizedQuery) && !phone.includes(normalizedQuery) && !netName.includes(normalizedQuery)) {
          return false
        }
      }

      // 2. Payment Filter (Default Operational)
      const pStatus = (o.paymentStatus || "").toUpperCase()
      if (paymentFilter === "OPERATIONAL") {
        if (pStatus !== "SUCCESS" && pStatus !== "PAID" && pStatus !== "NOT_APPLICABLE") return false
      } else if (paymentFilter !== "ALL") {
        if (pStatus !== paymentFilter && !(paymentFilter === "SUCCESS" && pStatus === "PAID")) return false
      }

      // 3. Network Filter
      if (networkFilter !== "ALL") {
        const netObj = networks.find((n) => n.id === o.networkId)
        if (networkFilter === "MTN" && netObj?.name.toLowerCase() !== "mtn") return false
        if (networkFilter === "TELECEL" && netObj?.name.toLowerCase() !== "telecel") return false
        if (networkFilter === "AIRTELTIGO" && netObj?.name.toLowerCase() !== "airteltigo") return false
      }

      // 4. Fulfillment Filter
      if (fulfillmentFilter !== "ALL") {
        const fStatus = (o.fulfillmentStatus || "").toUpperCase()
        if (fStatus !== fulfillmentFilter && !(fulfillmentFilter === "SUCCESS" && fStatus === "DELIVERED")) return false
      }

      // 5. Date Filter
      if (dateFilter !== "ALL") {
        const orderTime = new Date(o.createdAt).getTime()
        if (orderTime < fromTime || orderTime > toTime) return false
      }

      return true
    })
  }, [orders, query, networks, paymentFilter, networkFilter, fulfillmentFilter, dateFilter, dateFrom, dateTo])

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, phone, network…"
                  className="pl-9 h-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FilterIcon className="size-4" />
                <span className="font-medium">Filters</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select 
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={paymentFilter} 
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="OPERATIONAL">Payment: Paid (Operational)</option>
                <option value="ALL">Payment: All Attempts</option>
                <option value="PENDING">Payment: Unpaid/Pending</option>
                <option value="FAILED">Payment: Failed</option>
                <option value="REFUNDED">Payment: Refunded</option>
              </select>

              <select 
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={networkFilter} 
                onChange={(e) => setNetworkFilter(e.target.value)}
              >
                <option value="ALL">Network: All</option>
                <option value="MTN">MTN</option>
                <option value="TELECEL">Telecel</option>
                <option value="AIRTELTIGO">AirtelTigo</option>
              </select>

              <select 
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={fulfillmentFilter} 
                onChange={(e) => setFulfillmentFilter(e.target.value)}
              >
                <option value="ALL">Fulfillment: All</option>
                <option value="PROCESSING">Processing</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="SUCCESS">Delivered</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>

              <select 
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="ALL">Date: All Time</option>
                <option value="TODAY">Today</option>
                <option value="YESTERDAY">Yesterday</option>
                <option value="7DAYS">Last 7 Days</option>
                <option value="30DAYS">Last 30 Days</option>
                <option value="CUSTOM">Custom Range</option>
              </select>

              {dateFilter === "CUSTOM" && (
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    className="h-9 w-auto" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)} 
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input 
                    type="date" 
                    className="h-9 w-auto" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)} 
                  />
                </div>
              )}
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
                        i % 2 === 0 ? "" : "bg-muted/10",
                        (order.paymentStatus || "").toUpperCase() === "PENDING" ? "opacity-50" : ""
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
                            PAYMENT_COLORS[(order.paymentStatus || "").toUpperCase()] || ""
                          )}
                        >
                          {PAYMENT_LABELS[(order.paymentStatus || "").toUpperCase()] || order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] font-bold tracking-wider",
                              FULFILLMENT_COLORS[(order.fulfillmentStatus || "").toUpperCase()] || (order.fulfillmentStatus?.toUpperCase() === "DELIVERED" ? FULFILLMENT_COLORS["SUCCESS"] : "")
                            )}
                          >
                            {FULFILLMENT_LABELS[(order.fulfillmentStatus || "").toUpperCase()] || (order.fulfillmentStatus?.toUpperCase() === "DELIVERED" ? FULFILLMENT_LABELS["SUCCESS"] : order.fulfillmentStatus)}
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
                {query ? "No orders match your filters/search." : "No orders found."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
        <div className="text-xs text-muted-foreground">
          Page {currentPage}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => changePage(currentPage + 1)}
            disabled={!hasNextPage}
            className="h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

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
