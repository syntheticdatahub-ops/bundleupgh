import { AdminCustomersTable } from "@/components/admin/customers-table"
import { getCustomerCount, getCustomerPageRows, findCustomersByPhone, getFilteredCustomers } from "@/lib/customers"
import { getSuccessfulOrdersCount } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>> | Record<string, string>
}) {
  const resolvedParams = await Promise.resolve(searchParams ?? {})
  const requestedPage = Number(resolvedParams.page ?? "1")
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const cursor = typeof resolvedParams.cursor === "string" ? resolvedParams.cursor : null
  const searchQuery = typeof resolvedParams.search === "string" ? resolvedParams.search.trim() : null

  // Filters
  const sortBy = resolvedParams.sort || "MOST_ACTIVE"
  const minOrders = Number(resolvedParams.minOrders || "0")
  const maxOrders = resolvedParams.maxOrders ? Number(resolvedParams.maxOrders) : null
  const hasFilters = sortBy !== "MOST_ACTIVE" || minOrders > 0 || maxOrders !== null

  const [totalCustomers, totalOrders] = await Promise.all([
    getCustomerCount(),
    getSuccessfulOrdersCount(),
  ])

  let customers: any[] = []
  let hasNextPage = false
  let nextCursor: string | undefined = undefined

  if (searchQuery) {
    // Global phone search across entire DB
    const found = await findCustomersByPhone(searchQuery)
    found.sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0))
    customers = found.map((customer) => {
      const cPhoneLocal = customer.phone.replace(/\D/g, "")
      const displayPhone = cPhoneLocal.length === 10
        ? `+233 ${cPhoneLocal.slice(1).replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`
        : customer.phone
      return {
        ...customer,
        totalOrders: customer.totalOrders || 0,
        totalSpent: customer.totalSpent || 0,
        lastNetworkId: "-",
        lastOrderDate: "-",
        lastOrderTimestamp: customer.createdAt ? new Date(customer.createdAt).getTime() : 0,
        status: "active",
        displayPhone,
      }
    })
  } else if (hasFilters) {
    // Fetch all, filter & sort in memory, then paginate
    const allFiltered = await getFilteredCustomers(minOrders, maxOrders, sortBy)
    const start = (page - 1) * 25
    customers = allFiltered.slice(start, start + 25)
    hasNextPage = allFiltered.length > start + 25
  } else {
    // Default fast cursor pagination, sorted most-active first
    const { customers: rawRows, hasNextPage: hnp, nextCursor: nc } = await getCustomerPageRows({ page, pageSize: 25, cursor })
    const sorted = [...rawRows].sort((a, b) => {
      if (b.totalOrders !== a.totalOrders) return b.totalOrders - a.totalOrders
      return b.totalSpent - a.totalSpent
    })
    customers = sorted
    hasNextPage = hnp
    nextCursor = nc
  }

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
            <span className="font-bold text-lg">{totalCustomers.toLocaleString()}</span>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Successful Orders</span>
            <span className="font-bold text-lg">{totalOrders.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <AdminCustomersTable
        customers={customers}
        currentPage={page}
        hasNextPage={hasNextPage}
        nextCursor={nextCursor}
      />
    </div>
  )
}
