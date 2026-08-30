"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { normalizePhone } from "@/lib/phone"
import type { Customer, Order } from "@/types/domain"

export function AdminCustomersTable({ customers, orders }: { customers: Customer[], orders: Order[] }) {
  const [query, setQuery] = useState("")
  
  const enrichedCustomers = customers.map((c) => {
    // Normalize both customer phone and order phones to match reliably
    const cPhoneLocal = normalizePhone?.(c.phone) || c.phone.replace(/\D/g, "");
    
    const customerOrders = orders.filter(o => {
      const oPhoneLocal = normalizePhone?.(o.recipientPhone) || o.recipientPhone.replace(/\D/g, "");
      return oPhoneLocal === cPhoneLocal || oPhoneLocal.includes(cPhoneLocal.slice(-9));
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const successfulOrders = customerOrders.filter(o => o.fulfillmentStatus === "SUCCESS");
    
    return {
      ...c,
      totalOrders: successfulOrders.length,
      totalSpent: successfulOrders.reduce((sum, o) => sum + (o.sellingPriceSnapshot || 0), 0),
      lastNetworkId: customerOrders[0]?.networkId || "Unknown",
      lastOrderDate: customerOrders[0] ? new Date(customerOrders[0].createdAt).toLocaleDateString() : "Never",
      lastOrderTimestamp: customerOrders[0] ? new Date(customerOrders[0].createdAt).getTime() : 0,
      status: successfulOrders.length > 0 ? "active" : "inactive",
      displayPhone: cPhoneLocal.length === 10 ? `+233 ${cPhoneLocal.slice(1).replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}` : c.phone,
    }
  }).sort((a, b) => b.lastOrderTimestamp - a.lastOrderTimestamp)

  const filtered = enrichedCustomers.filter(
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
      </CardContent>
    </Card>
  )
}
