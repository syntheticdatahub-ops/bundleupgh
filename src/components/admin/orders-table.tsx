"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { decodeCursorState, encodeCursorState } from "@/lib/pagination"
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState("")
  
  // Filters
  const [paymentFilter, setPaymentFilter] = useState(searchParams.get("payment") || "OPERATIONAL")
  const [networkFilter, setNetworkFilter] = useState(searchParams.get("network") || "ALL")
  const [fulfillmentFilter, setFulfillmentFilter] = useState(searchParams.get("fulfillment") || "ALL")
  const [dateFilter, setDateFilter] = useState("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const applyFilters = (pf: string, ff: string, nf: string) => {
    setPaymentFilter(pf)
    setFulfillmentFilter(ff)
    setNetworkFilter(nf)
    
    const params = new URLSearchParams(searchParams.toString())
    if (pf !== "OPERATIONAL") params.set("payment", pf)
    else params.delete("payment")
    
    if (ff !== "ALL") params.set("fulfillment", ff)
    else params.delete("fulfillment")
    
    if (nf !== "ALL") params.set("network", nf)
    else params.delete("network")
    
    // Reset pagination when filters change
    params.delete("page")
    params.delete("cursor")
    
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const [globalRef, setGlobalRef] = useState("")

  useEffect(() => {
    setOrders(initialOrders)
    setSelectedOrderIds(new Set())
  }, [initialOrders])

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

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSet = new Set(selectedOrderIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedOrderIds(newSet)
  }

  const toggleAll = () => {
    if (selectedOrderIds.size === filtered.length) {
      setSelectedOrderIds(new Set())
    } else {
      setSelectedOrderIds(new Set(filtered.map(o => o.id)))
    }
  }

  const handleBulkAction = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const action = e.target.value
    if (!action || selectedOrderIds.size === 0) return
    e.target.value = ""
    
    setIsBulkLoading(true)
    let processed = 0
    let errors = 0
    
    for (const id of Array.from(selectedOrderIds)) {
      try {
        let endpoint = ""
        if (action === "SYNC") endpoint = `/api/admin/orders/${id}/sync`
        else if (action === "RETRY") endpoint = `/api/admin/orders/${id}/retry`
        
        if (endpoint) {
          const res = await fetch(endpoint, { method: "POST" })
          if (!res.ok) throw new Error("Request failed")
          
          const data = await res.json()
          if (data.order) {
            setOrders(prev => prev.map(o => o.id === id ? data.order : o))
          }
        }
        processed++
      } catch (err) {
        errors++
      }
    }
    
    setIsBulkLoading(false)
    setSelectedOrderIds(new Set())
    alert(`Bulk action complete. Processed: ${processed}. Errors: ${errors}.`)
    router.refresh()
  }

  const changePage = useCallback((nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    const safePage = Math.max(1, nextPage)
    const cursorState = decodeCursorState(params.get("cursor"))

    if (safePage <= 1) {
      params.delete("page")
      params.delete("cursor")
    } else {
      params.set("page", String(safePage))
      if (safePage === currentPage + 1 && nextCursor) {
        const nextCursorState = [...cursorState, nextCursor]
        params.set("cursor", encodeCursorState(nextCursorState))
      } else if (safePage < currentPage) {
        const previousCursorState = cursorState.slice(0, Math.max(0, safePage - 1))
        if (previousCursorState.length > 0) {
          params.set("cursor", encodeCursorState(previousCursorState))
        } else {
          params.delete("cursor")
        }
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
              
              <div className="flex items-center gap-4">
                {selectedOrderIds.size > 0 && (
                  <select
                    className="h-9 rounded-md border border-input bg-primary text-primary-foreground px-3 py-1 text-sm shadow-sm cursor-pointer"
                    value=""
                    onChange={handleBulkAction}
                    disabled={isBulkLoading}
                  >
                    <option value="" disabled>{isBulkLoading ? "Processing..." : `Bulk Actions (${selectedOrderIds.size})`}</option>
                    <option value="SYNC">Sync with Provider</option>
                    <option value="RETRY">Retry ON_HOLD</option>
                  </select>
                )}

                {/* Global Search by Reference or Phone */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!globalRef) return;
                    router.push(`${pathname}?search=${encodeURIComponent(globalRef)}`);
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder="Search ANY Ref or Phone"
                    className="h-9 w-56 font-mono text-sm uppercase"
                    value={globalRef}
                    onChange={(e) => setGlobalRef(e.target.value.replace(/[^A-Za-z0-9-+]/g, "").toUpperCase())}
                  />
                  <button type="submit" className="h-9 px-3 rounded-md border bg-muted/50 text-sm hover:bg-muted font-medium text-muted-foreground">
                    Find
                  </button>
                  {(searchParams.get("reference") || searchParams.get("search")) && (
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalRef("");
                        const p = new URLSearchParams(searchParams.toString());
                        p.delete("reference");
                        p.delete("search");
                        router.push(p.toString() ? `${pathname}?${p.toString()}` : pathname);
                      }}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </form>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
                  <FilterIcon className="size-4" />
                  <span className="font-medium">Filters</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select 
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={paymentFilter} 
                onChange={(e) => applyFilters(e.target.value, fulfillmentFilter, networkFilter)}
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
                onChange={(e) => applyFilters(paymentFilter, fulfillmentFilter, e.target.value)}
              >
                <option value="ALL">Network: All</option>
                <option value="MTN">MTN</option>
                <option value="TELECEL">Telecel</option>
                <option value="AIRTELTIGO">AirtelTigo</option>
              </select>

              <select 
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={fulfillmentFilter} 
                onChange={(e) => applyFilters(paymentFilter, e.target.value, networkFilter)}
              >
                <option value="ALL">Fulfillment: All</option>
                <option value="PENDING">Pending</option>
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

          {/* ── Quick-filter chips ─────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1 border-b">
            {[
              { label: "⚠️ Delivery Failed", ff: "FAILED", pf: "OPERATIONAL", color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30" },
              { label: "⏸ On Hold", ff: "ON_HOLD", pf: "OPERATIONAL", color: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30" },
              { label: "⏳ Processing", ff: "PROCESSING", pf: "OPERATIONAL", color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30" },
              { label: "✅ Delivered", ff: "SUCCESS", pf: "OPERATIONAL", color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30" },
            ].map(({ label, ff, pf, color }) => {
              const isActive = fulfillmentFilter === ff && paymentFilter === pf
              return (
                <button
                  key={ff}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      applyFilters("OPERATIONAL", "ALL", networkFilter)
                    } else {
                      applyFilters(pf, ff, networkFilter)
                    }
                  }}
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                    color,
                    isActive && "ring-2 ring-offset-1 ring-current"
                  )}
                >
                  {label}
                  {isActive && (
                    <span className="ml-1.5 opacity-70">✕</span>
                  )}
                </button>
              )
            })}
            {(fulfillmentFilter !== "ALL" || paymentFilter !== "OPERATIONAL") && (
              <button
                type="button"
                onClick={() => applyFilters("OPERATIONAL", "ALL", networkFilter)}
                className="text-xs text-muted-foreground hover:underline ml-1"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300" 
                      checked={filtered.length > 0 && selectedOrderIds.size === filtered.length}
                      onChange={toggleAll}
                    />
                  </th>
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
                        (order.paymentStatus || "").toUpperCase() === "PENDING" ? "opacity-50" : "",
                        selectedOrderIds.has(order.id) ? "bg-primary/10" : ""
                      )}
                    >
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300"
                          checked={selectedOrderIds.has(order.id)}
                          onChange={() => {}} // Handle on parent div/td
                          onClick={(e) => toggleSelection(order.id, e)}
                        />
                      </td>
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
