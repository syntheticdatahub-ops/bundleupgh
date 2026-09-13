import { AdminCustomersTable } from "@/components/admin/customers-table"
import { getCustomerCount, getCustomerPageRows } from "@/lib/customers"
import { getSuccessfulOrdersCount } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; cursor?: string }> | { page?: string; cursor?: string }
}) {
  const resolvedParams = await Promise.resolve(searchParams ?? {})
  const requestedPage = Number(resolvedParams.page ?? "1")
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const cursor = typeof resolvedParams.cursor === "string" ? resolvedParams.cursor : null

  const totalCustomers = await getCustomerCount()
  const totalOrders = await getSuccessfulOrdersCount()
  const { customers: pageRows, hasNextPage, nextCursor } = await getCustomerPageRows({
    page,
    pageSize: 25,
    cursor,
  })

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
            <span className="font-bold">{totalCustomers}</span>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Total Orders</span>
            <span className="font-bold">{totalOrders}</span>
          </div>
        </div>
      </div>
      <AdminCustomersTable
        customers={pageRows}
        currentPage={page}
        hasNextPage={hasNextPage}
        nextCursor={nextCursor}
      />
    </div>
  )
}
