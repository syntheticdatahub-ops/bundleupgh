import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Order, Network } from "@/types/domain"

export function NetworkBreakdown({ orders, networks }: { orders: Order[], networks: Network[] }) {
  const successfulOrders = orders.filter((o) => o.fulfillmentStatus === "SUCCESS");

  const stats = networks.map((net) => {
    const netOrders = successfulOrders.filter((o) => o.networkId === net.id);
    const revenue = netOrders.reduce((sum, o) => sum + o.sellingPriceSnapshot, 0);
    return {
      network: net.name,
      color: net.color,
      orders: netOrders.length,
      revenue,
    };
  }).sort((a, b) => b.orders - a.orders);

  const maxOrders = Math.max(...stats.map(n => n.orders), 1);

  if (successfulOrders.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Network Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground text-sm">
            No successful orders to break down yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Network Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-6">
          {stats.map((stat) => (
            <div key={stat.network} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="size-3 rounded-full" 
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="font-medium">{stat.network}</span>
                </div>
                <div className="font-medium">
                  {stat.orders} <span className="text-muted-foreground font-normal">orders</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ 
                    backgroundColor: stat.color,
                    width: `${(stat.orders / maxOrders) * 100}%` 
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                GHS {stat.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} revenue
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
