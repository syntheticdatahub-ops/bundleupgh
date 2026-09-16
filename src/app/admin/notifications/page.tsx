import { getOperationalOrders } from "@/lib/orders"
import { getNetworks } from "@/lib/networks"
import { NotificationsList } from "@/components/admin/notifications-list"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  // Load all paid/operational orders then filter by status
  const [allOrders, networks] = await Promise.all([
    getOperationalOrders(),
    getNetworks(),
  ])

  const failedOrders   = allOrders.filter(o => o.fulfillmentStatus === "FAILED")
  const onHoldOrders   = allOrders.filter(o => o.fulfillmentStatus === "ON_HOLD")
  const processingOrders = allOrders.filter(o => o.fulfillmentStatus === "PROCESSING")

  const totalActionRequired = failedOrders.length + onHoldOrders.length

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Orders that need your attention.
          {totalActionRequired > 0 && (
            <span className="ml-2 font-semibold text-red-600">
              {totalActionRequired} {totalActionRequired === 1 ? "order requires" : "orders require"} action.
            </span>
          )}
        </p>
      </div>

      <NotificationsList 
        failedOrders={failedOrders}
        onHoldOrders={onHoldOrders}
        processingOrders={processingOrders}
        networks={networks}
      />
    </div>
  )
}
