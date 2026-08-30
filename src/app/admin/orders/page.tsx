import { AdminOrdersTable } from "@/components/admin/orders-table"
import { getOrders } from "@/lib/orders"
import { getNetworks } from "@/lib/networks"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const orders = await getOrders()
  const networks = await getNetworks()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">All transactions across every network.</p>
      </div>
      <AdminOrdersTable initialOrders={orders} networks={networks} />
    </div>
  )
}
