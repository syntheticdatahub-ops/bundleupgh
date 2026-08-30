import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUpIcon, PackageIcon, CheckCircleIcon, ClockIcon, XCircleIcon, CoinsIcon } from "lucide-react"
import type { Order } from "@/types/domain"

export function StatsCards({ orders }: { orders: Order[] }) {
  const totalOrders = orders.length;
  
  let successfulOrders = 0;
  let pendingOrders = 0;
  let failedOrders = 0;
  let totalRevenue = 0;
  let estimatedProfit = 0;
  
  for (const order of orders) {
    const paymentSuccessful = order.paymentStatus === "SUCCESS";
    const fulfillmentSuccessful = order.fulfillmentStatus === "SUCCESS";
    const isSuccessful = paymentSuccessful || fulfillmentSuccessful;
    const isPending = order.paymentStatus === "PENDING" || order.fulfillmentStatus === "PENDING" || order.fulfillmentStatus === "PROCESSING";
    const isFailed = order.paymentStatus === "FAILED" || order.fulfillmentStatus === "FAILED" || order.fulfillmentStatus === "REFUNDED" || order.fulfillmentStatus === "REFUND_PENDING";

    if (isSuccessful) {
      successfulOrders++;
      totalRevenue += order.sellingPriceSnapshot;
      estimatedProfit += order.profitSnapshot;
    } else if (isPending) {
      pendingOrders++;
    } else if (isFailed) {
      failedOrders++;
    }
  }

  const cards = [
    {
      title: "Total Revenue",
      value: `GHS ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: "All time",
      trendUp: true,
      icon: TrendingUpIcon,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      trend: "All time",
      trendUp: true,
      icon: PackageIcon,
    },
    {
      title: "Successful Orders",
      value: successfulOrders.toLocaleString(),
      trend: totalOrders > 0 ? `${((successfulOrders / totalOrders) * 100).toFixed(1)}% success rate` : "0% success rate",
      trendUp: true,
      icon: CheckCircleIcon,
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toLocaleString(),
      trend: totalOrders > 0 ? `${((pendingOrders / totalOrders) * 100).toFixed(1)}% of orders` : "0% of orders",
      trendUp: false,
      icon: ClockIcon,
    },
    {
      title: "Failed Orders",
      value: failedOrders.toLocaleString(),
      trend: totalOrders > 0 ? `${((failedOrders / totalOrders) * 100).toFixed(1)}% of orders` : "0% of orders",
      trendUp: false,
      icon: XCircleIcon,
    },
    {
      title: "Est. Profit",
      value: `GHS ${estimatedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: "All time",
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
