import { AdminOrdersTable } from "@/components/admin/orders-table"
import { getOrdersPage } from "@/lib/orders"
import { getNetworks } from "@/lib/networks"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; cursor?: string }> | { page?: string; cursor?: string }
}) {
  const resolvedParams = await Promise.resolve(searchParams ?? {})
  const requestedPage = Number(resolvedParams.page ?? "1")
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const cursor = typeof resolvedParams.cursor === "string" ? resolvedParams.cursor : null
  const searchQuery = typeof (resolvedParams as any).search === "string" ? (resolvedParams as any).search.trim() : null
  const reference = typeof (resolvedParams as any).reference === "string" ? (resolvedParams as any).reference.trim().toUpperCase() : null
  
  const paymentFilter = typeof (resolvedParams as any).payment === "string" ? (resolvedParams as any).payment : "OPERATIONAL"
  const fulfillmentFilter = typeof (resolvedParams as any).fulfillment === "string" ? (resolvedParams as any).fulfillment : "ALL"
  const networkFilter = typeof (resolvedParams as any).network === "string" ? (resolvedParams as any).network : "ALL"

  let orders: any[] = []
  let hasNextPage = false
  let nextCursor: string | undefined = undefined

  const activeSearch = searchQuery || reference;

  if (activeSearch) {
    const { getOrderByPublicReference, findOrdersByRecipientPhone } = await import("@/lib/orders")
    
    if (activeSearch.startsWith("BU-")) {
      const order = await getOrderByPublicReference(activeSearch.toUpperCase())
      if (order) orders = [order]
    } else {
      orders = await findOrdersByRecipientPhone(activeSearch)
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  } else {
    // If ANY filter is non-default, we fetch matching orders and paginate in memory
    // Otherwise we use standard fast cursor pagination
    const hasFilters = paymentFilter !== "OPERATIONAL" || fulfillmentFilter !== "ALL" || networkFilter !== "ALL"
    
    if (hasFilters) {
      const { getFilteredOrders } = await import("@/lib/orders")
      const allMatching = await getFilteredOrders(paymentFilter, fulfillmentFilter, networkFilter)
      const start = (page - 1) * 25
      orders = allMatching.slice(start, start + 25)
      hasNextPage = allMatching.length > start + 25
    } else {
      const result = await getOrdersPage({ page, pageSize: 25, cursor })
      orders = result.orders
      hasNextPage = result.hasNextPage
      nextCursor = result.nextCursor
    }
  }
  
  const networks = await getNetworks()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">All transactions across every network.</p>
      </div>
      <AdminOrdersTable
        initialOrders={orders}
        networks={networks}
        currentPage={page}
        hasNextPage={hasNextPage}
        nextCursor={nextCursor}
      />
    </div>
  )
}
