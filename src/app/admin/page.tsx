import { StatsCards } from "@/components/admin/overview/stats-cards"
import { RevenueChart } from "@/components/admin/overview/revenue-chart"
import { NetworkBreakdown } from "@/components/admin/overview/network-breakdown"
import { RecentOrdersWidget } from "@/components/admin/overview/recent-orders-widget"
import { getNetworkBreakdownStats, getOperationalOrderMetrics, getOperationalOrders, getRecentOrders, getStuckOrders } from "@/lib/orders"
import { getNetworks } from "@/lib/networks"
import { AutoRefresh } from "@/components/admin/auto-refresh"
import { MaintenanceCard } from "@/components/admin/maintenance-card"

import { unstable_cache } from "next/cache"

const getCachedOperationalOrders = unstable_cache(
  async () => getOperationalOrders(),
  ['admin-overview-operational-orders'],
  { revalidate: 60 } // Cache for 60 seconds
)

const getCachedRecentOrders = unstable_cache(
  async () => getRecentOrders(5),
  ['admin-overview-recent-orders'],
  { revalidate: 60 }
)

const getCachedNetworks = unstable_cache(
  async () => getNetworks(),
  ['admin-overview-networks'],
  { revalidate: 3600 } // Networks rarely change, cache for 1 hour
)

const getCachedStuckOrders = unstable_cache(
  async () => getStuckOrders(),
  ['admin-overview-stuck-orders'],
  { revalidate: 60 }
)

export const dynamic = "force-dynamic"

export default async function AdminOverview({ searchParams }: { searchParams?: Promise<{ period?: string }> | { period?: string } }) {
  const resolvedParams = await Promise.resolve(searchParams ?? {})
  const period = typeof resolvedParams.period === "string" ? resolvedParams.period : "all"

  const [operationalOrders, recentOrders, networks, stuckOrders] = await Promise.all([
    getCachedOperationalOrders(),
    getCachedRecentOrders(),
    getCachedNetworks(),
    getCachedStuckOrders(),
  ]);

  let filteredOrders = operationalOrders;
  if (period === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filteredOrders = operationalOrders.filter(o => new Date(o.createdAt) >= today);
  } else if (period === "month") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    filteredOrders = operationalOrders.filter(o => new Date(o.createdAt) >= startOfMonth);
  }

  const metrics = getOperationalOrderMetrics(filteredOrders);
  const networkStats = getNetworkBreakdownStats(networks, filteredOrders);
  

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AutoRefresh interval={10000} />
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <div className="flex gap-2">
          <a href="?period=today" className={`px-3 py-1 text-sm rounded-md border ${period === "today" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>Today</a>
          <a href="?period=month" className={`px-3 py-1 text-sm rounded-md border ${period === "month" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>This Month</a>
          <a href="?period=all" className={`px-3 py-1 text-sm rounded-md border ${period === "all" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>All Time</a>
        </div>
      </div>

      <MaintenanceCard />
      
      {stuckOrders.length > 0 && (
        <div className="border border-red-500/20 bg-red-500/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-red-600 dark:text-red-400">Action Required: {stuckOrders.length} stuck order(s)</h3>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
              Customers have paid, but delivery is FAILED or ON_HOLD.
            </p>
          </div>
          <a href="/admin/orders?fulfillmentFilter=FAILED" className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
            Review Orders
          </a>
        </div>
      )}

      <StatsCards stats={metrics} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart orders={filteredOrders} />
        </div>
        <div className="lg:col-span-3">
          <NetworkBreakdown stats={networkStats} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <RecentOrdersWidget orders={recentOrders} networks={networks} />
      </div>
    </div>
  )
}

