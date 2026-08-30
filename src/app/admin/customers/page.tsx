import { AdminCustomersTable } from "@/components/admin/customers-table"
import { getCustomers } from "@/lib/customers"
import { getOrders } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage() {
  const customers = await getCustomers()
  const orders = await getOrders()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Accounts built from phone-number purchase history.</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm bg-muted/40 border px-4 py-2 rounded-lg">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Total Customers</span>
            <span className="font-bold">{customers.length}</span>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Total Orders</span>
            <span className="font-bold">{orders.filter(o => o.fulfillmentStatus === "SUCCESS").length}</span>
          </div>
        </div>
      </div>
      <AdminCustomersTable customers={customers} orders={orders} />
    </div>
  )
}
