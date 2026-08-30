import { StatsCards } from "@/components/admin/overview/stats-cards"
import { RevenueChart } from "@/components/admin/overview/revenue-chart"
import { NetworkBreakdown } from "@/components/admin/overview/network-breakdown"
import { RecentOrdersWidget } from "@/components/admin/overview/recent-orders-widget"
import { getOrders } from "@/lib/orders"
import { getNetworks } from "@/lib/networks"
import { AutoRefresh } from "@/components/admin/auto-refresh"

export const dynamic = "force-dynamic"

export default async function AdminOverview() {
  const orders = await getOrders()
  const networks = await getNetworks()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AutoRefresh interval={10000} />
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>
      
      <StatsCards orders={orders} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart orders={orders} />
        </div>
        <div className="lg:col-span-3">
          <NetworkBreakdown orders={orders} networks={networks} />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1">
        <RecentOrdersWidget orders={orders} networks={networks} />
      </div>
    </div>
  )
}
