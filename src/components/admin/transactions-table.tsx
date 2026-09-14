"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { decodeCursorState, encodeCursorState } from "@/lib/pagination"
import type { Order } from "@/types/domain"

const statusColors: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
  PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
  REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
}

export function AdminTransactionsTable({
  orders,
  currentPage = 1,
  hasNextPage = false,
  nextCursor,
}: {
  orders: Order[]
  currentPage?: number
  hasNextPage?: boolean
  nextCursor?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  // Derive transactions from real orders
  const transactions = orders
    .map((o) => ({
      id: o.id, // Using order ID as fallback since payment is a separate collection
      orderId: o.publicReference,
      provider: "Mock Payment", // TODO: Update when Paystack is integrated
      amount: o.sellingPriceSnapshot,
      status: (o.paymentStatus || "").toUpperCase() === "SUCCESS" || (o.paymentStatus || "").toUpperCase() === "PAID"
        ? "SUCCESS"
        : (o.fulfillmentStatus || "").toUpperCase(),
      date: new Date(o.createdAt).toLocaleString(),
    }))

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-16 text-center text-muted-foreground text-sm">
          No transactions found.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">Payment ID</th>
                <th className="px-4 py-3 text-left font-medium">Order Ref</th>
                <th className="px-4 py-3 text-left font-medium">Provider</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr
                  key={tx.orderId + idx}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.id}</td>
                  <td className="px-4 py-3 font-mono font-medium">{tx.orderId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.provider}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    GHS {tx.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px] font-bold tracking-wider", statusColors[tx.status] || "")}
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
          <div className="text-xs text-muted-foreground">Page {currentPage}</div>
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
      </CardContent>
    </Card>
  )
}
