import { getBundles } from "@/lib/bundles"
import { getNetworks } from "@/lib/networks"
import { ManualFulfillmentClient } from "./client"

export const dynamic = "force-dynamic"

export default async function ManualFulfillmentPage() {
  const networks = await getNetworks()
  const activeNetworks = networks.filter((n) => n.active)
  
  const allBundles = await getBundles() // Already filters by active and providerAvailable

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manual Fulfillment</h1>
        <p className="text-muted-foreground">
          Manually trigger a DataMart fulfillment for a customer without requiring a payment flow.
        </p>
      </div>

      <ManualFulfillmentClient networks={activeNetworks} bundles={allBundles} />
    </div>
  )
}
