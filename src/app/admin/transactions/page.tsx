import { AdminTransactionsTable } from "@/components/admin/transactions-table"
import { getOrdersPage } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; cursor?: string }> | { page?: string; cursor?: string }
}) {
  const resolvedParams = await Promise.resolve(searchParams ?? {})
  const requestedPage = Number(resolvedParams.page ?? "1")
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const cursor = typeof resolvedParams.cursor === "string" ? resolvedParams.cursor : null

  const { orders, hasNextPage, nextCursor } = await getOrdersPage({
    page,
    pageSize: 25,
    cursor,
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Payment records linked to orders.</p>
      </div>
      <AdminTransactionsTable
        orders={orders}
        currentPage={page}
        hasNextPage={hasNextPage}
        nextCursor={nextCursor}
      />
    </div>
  )
}
