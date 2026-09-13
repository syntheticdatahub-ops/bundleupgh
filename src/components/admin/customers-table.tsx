"use client"

import { useState, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import type { CustomerPageRow } from "@/lib/customers"

export function AdminCustomersTable({
  customers,
  currentPage,
  hasNextPage,
  nextCursor,
}: {
  customers: CustomerPageRow[]
  currentPage: number
  hasNextPage: boolean
  nextCursor?: string
}) {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  const filtered = customers.filter(
    (c) =>
      c.phone.toLowerCase().includes(query.toLowerCase()) ||
      c.lastNetworkId.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by phone or network…"
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
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-right font-medium">Orders</th>
                <th className="px-4 py-3 text-right font-medium">Total Spent</th>
                <th className="px-4 py-3 text-left font-medium">Last Network</th>
                <th className="px-4 py-3 text-left font-medium">Last Order</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                return (
                  <tr
                    key={customer.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{customer.displayPhone}</td>
                    <td className="px-4 py-3 text-right">{customer.totalOrders}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      GHS {customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {customer.lastNetworkId}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{customer.lastOrderDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold capitalize ${
                          customer.status === "active"
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No customers found.
            </div>
          )}
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
