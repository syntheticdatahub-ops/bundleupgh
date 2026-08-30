import { AdminTransactionsTable } from "@/components/admin/transactions-table"
import { getOrders } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function AdminTransactionsPage() {
  const orders = await getOrders()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Payment records linked to orders.</p>
      </div>
      <AdminTransactionsTable orders={orders} />
    </div>
  )
}
