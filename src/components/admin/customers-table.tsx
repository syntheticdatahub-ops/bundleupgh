"use client"

import { useState, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { decodeCursorState, encodeCursorState } from "@/lib/pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import type { CustomerPageRow } from "@/lib/customers"
import { CustomerDetailDrawer } from "./customer-detail-drawer"

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sortBy = searchParams.get("sort") || "MOST_ACTIVE"
  const minOrders = searchParams.get("minOrders") || ""
  const maxOrders = searchParams.get("maxOrders") || ""

  const applyParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    params.delete("cursor")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchInput.trim()) params.set("search", searchInput.trim())
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname)
  }

  const clearSearch = () => {
    setSearchInput("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname)
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

  const isSearchActive = !!searchParams.get("search")

  return (
    <Card>
      <CardContent className="p-0">
        {/* Search + Filters */}
        <div className="p-4 border-b space-y-3">
          {/* Global Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone number…"
                className="pl-9 h-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="h-9 px-3 rounded-md border bg-muted/50 text-sm hover:bg-muted font-medium text-muted-foreground">
              Find
            </button>
            {isSearchActive && (
              <button type="button" onClick={clearSearch} className="text-xs text-muted-foreground hover:underline">
                Clear
              </button>
            )}
          </form>

          {/* Filters — hidden when a search is active */}
          {!isSearchActive && (
            <div className="flex flex-wrap gap-3 items-center">
              {/* Sort by */}
              <select
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={sortBy}
                onChange={(e) => applyParam("sort", e.target.value === "MOST_ACTIVE" ? "" : e.target.value)}
              >
                <option value="MOST_ACTIVE">Sort: Most Active</option>
                <option value="HIGHEST_SPEND">Sort: Highest Spend</option>
                <option value="NEWEST">Sort: Newest First</option>
                <option value="OLDEST">Sort: Oldest First</option>
              </select>

              {/* Min orders */}
              <select
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={minOrders}
                onChange={(e) => applyParam("minOrders", e.target.value)}
              >
                <option value="">Min Orders: Any</option>
                <option value="1">At least 1 order</option>
                <option value="3">At least 3 orders</option>
                <option value="5">At least 5 orders</option>
                <option value="10">At least 10 orders</option>
              </select>

              {/* Max orders */}
              <select
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={maxOrders}
                onChange={(e) => applyParam("maxOrders", e.target.value)}
              >
                <option value="">Max Orders: Any</option>
                <option value="1">Only 1 order (first-timers)</option>
                <option value="2">Up to 2 orders</option>
                <option value="5">Up to 5 orders</option>
              </select>

              {(minOrders || maxOrders || sortBy !== "MOST_ACTIVE") && (
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("sort")
                    params.delete("minOrders")
                    params.delete("maxOrders")
                    params.delete("page")
                    params.delete("cursor")
                    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname)
                  }}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Customer Since</th>
                <th className="px-4 py-3 text-right font-medium">Orders</th>
                <th className="px-4 py-3 text-right font-medium">Spent</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                return (
                  <tr
                    key={customer.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCustomerPhone(customer.phone)
                      setDrawerOpen(true)
                    }}
                  >
                    <td className="px-4 py-3 font-medium">{customer.displayPhone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{customer.totalOrders}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">GH₵ {customer.totalSpent.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-blue-600 hover:underline">View details</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {isSearchActive ? `No customers found matching "${searchParams.get("search")}".` : "No customers found."}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
          <span className="text-sm text-muted-foreground">Page {currentPage}</span>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => changePage(currentPage - 1)}
              className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={!hasNextPage}
              onClick={() => changePage(currentPage + 1)}
              className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>

      <CustomerDetailDrawer
        phone={selectedCustomerPhone}
        open={drawerOpen}
        onOpenChange={(v) => {
          setDrawerOpen(v)
          if (!v) setTimeout(() => setSelectedCustomerPhone(null), 300)
        }}
      />
    </Card>
  )
}
