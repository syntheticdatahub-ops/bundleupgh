import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUpIcon, PackageIcon, CheckCircleIcon, ClockIcon, XCircleIcon, CoinsIcon } from "lucide-react"
import type { Order } from "@/types/domain"

// An operational order is one where money was actually collected.
// paymentStatus = SUCCESS: customer paid via Paystack.
// paymentStatus = NOT_APPLICABLE: admin manual fulfillment (no customer payment needed).
// All other paymentStatus values (PENDING, FAILED, REFUNDED) are NOT operational orders.
function isOperational(order: Order): boolean {
  // We check for "paid" / "PAID" to gracefully handle the legacy seed data that was pushed to Firestore.
  const status = order.paymentStatus?.toUpperCase() || "";
  return status === "SUCCESS" || status === "PAID" || status === "NOT_APPLICABLE";
}

export function StatsCards({ stats }: { stats: { totalOrders: number; totalRevenue: number; deliveredOrders: number; pendingOrders: number; failedOrders: number; estimatedProfit: number } }) {
  const { totalOrders, totalRevenue, deliveredOrders, pendingOrders, failedOrders, estimatedProfit } = stats;

  const cards = [
    {
      title: "Total Revenue",
      value: `GHS ${totalRevenue.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: "Paid operational orders",
      trendUp: true,
      icon: TrendingUpIcon,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      trend: "Paid operational orders only",
      trendUp: true,
      icon: PackageIcon,
    },
    {
      title: "Delivered",
      value: deliveredOrders.toLocaleString(),
      trend: totalOrders > 0 ? `${((deliveredOrders / totalOrders) * 100).toFixed(1)}% success rate` : "0% success rate",
      trendUp: true,
      icon: CheckCircleIcon,
    },
    {
      title: "Pending Delivery",
      value: pendingOrders.toLocaleString(),
      trend: totalOrders > 0 ? `${((pendingOrders / totalOrders) * 100).toFixed(1)}% of orders` : "0% of orders",
      trendUp: false,
      icon: ClockIcon,
    },
    {
      title: "Failed / Issues",
      value: failedOrders.toLocaleString(),
      trend: totalOrders > 0 ? `${((failedOrders / totalOrders) * 100).toFixed(1)}% of orders` : "0% of orders",
      trendUp: false,
      icon: XCircleIcon,
    },
    {
      title: "Est. Profit",
      value: `GHS ${estimatedProfit.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: "Based on stored profit snapshots",
      trendUp: true,
      icon: CoinsIcon,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className={`text-xs mt-1 ${card.trendUp ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                {card.trend}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
