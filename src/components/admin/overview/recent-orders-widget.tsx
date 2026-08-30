import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import type { Order, Network } from "@/types/domain"

const fulfillmentColors: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
  PROCESSING: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
  PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
  REFUND_PENDING: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
  REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
}

export function RecentOrdersWidget({ orders, networks }: { orders: Order[], networks: Network[] }) {
  // Sort descending by date, take first 5
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  if (recentOrders.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer transactions</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center pt-6">
          <div className="text-center text-muted-foreground text-sm">
            No orders yet.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer transactions</CardDescription>
        </div>
        <Link href="/admin/orders" className="text-sm font-medium text-primary flex items-center hover:underline">
          View all <ArrowRightIcon className="ml-1 size-4" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-4 pt-4">
          {recentOrders.map((order) => {
            const net = networks.find(n => n.id === order.networkId)
            
            // Mask phone number partially for privacy
            const maskedPhone = order.recipientPhone.length > 6 
              ? `${order.recipientPhone.substring(0, 5)} ••••` 
              : order.recipientPhone;

            return (
              <div key={order.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {net && (
                    <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: net.color }} />
                  )}
                  <div>
                    <div className="text-sm font-medium leading-none mb-1">{maskedPhone}</div>
                    <div className="text-xs text-muted-foreground">{net?.name} • {order.dataSizeSnapshot}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-sm font-medium">GHS {order.sellingPriceSnapshot.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "bg-opacity-10 hidden sm:inline-flex text-[10px] tracking-wider font-bold",
                      fulfillmentColors[order.fulfillmentStatus] || ""
                    )}
                  >
                    {order.fulfillmentStatus}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
