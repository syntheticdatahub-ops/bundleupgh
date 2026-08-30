"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { SearchIcon } from "lucide-react"
import type { Order, Network } from "@/types/domain"

const paymentColors: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
  PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
  REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
  NOT_APPLICABLE: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
}

const fulfillmentColors: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
  PROCESSING: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
  PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
  REFUND_PENDING: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
  REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
}

export function AdminOrdersTable({ initialOrders, networks }: { initialOrders: Order[], networks: Network[] }) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  // Polling fallback since we are using secure REST on the server
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 10000) // refresh every 10s
    return () => clearInterval(interval)
  }, [router])

  const normalizedQuery = query.toLowerCase()

  const filtered = (initialOrders ?? []).filter((o) => {
    const publicReference = o?.publicReference ?? ""
    const recipientPhone = o?.recipientPhone ?? ""

    return (
      publicReference.toLowerCase().includes(normalizedQuery) ||
      recipientPhone.toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, phone, network…"
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const net = networks.find((n) => n.id === order.networkId)
                return (
                  <tr
                    key={order.id}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30 transition-colors",
                      i % 2 === 0 ? "" : "bg-muted/10"
                    )}
                  >
                    <td className="px-4 py-3 font-mono font-medium">
                      <div className="flex items-center gap-2">
                        {order.publicReference}
                        {order.source === "MANUAL" && (
                          <Badge variant="outline" className="text-[9px] uppercase h-5 px-1 bg-slate-100 text-slate-500">
                            Manual
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{order.recipientPhone}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: net?.color ?? "#ccc" }}
                        />
                        {net?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{order.dataSizeSnapshot}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      GHS {order.sellingPriceSnapshot.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px] font-bold tracking-wider", paymentColors[order.paymentStatus] || "")}
                      >
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold tracking-wider",
                          fulfillmentColors[order.fulfillmentStatus] || ""
                        )}
                      >
                        {order.fulfillmentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No orders match your search.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
