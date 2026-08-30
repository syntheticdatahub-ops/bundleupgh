import { AdminBundlesTable } from "@/components/admin/bundles-table"
import { getAllBundles } from "@/lib/bundles"
import { getNetworks } from "@/lib/networks"
import { SyncBundlesButton } from "@/components/admin/sync-bundles-button"

export const dynamic = "force-dynamic"

export default async function AdminBundlesPage() {
  const bundles = await getAllBundles()
  const networks = await getNetworks()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bundles</h1>
          <p className="text-muted-foreground">Manage data plans and pricing.</p>
        </div>
        <SyncBundlesButton />
      </div>
      <AdminBundlesTable bundles={bundles} networks={networks} />
    </div>
  )
}
