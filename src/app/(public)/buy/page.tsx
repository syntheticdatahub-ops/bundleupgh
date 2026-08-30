import { Suspense } from "react"
import { BuyFlow } from "@/components/buy/buy-flow"
import { getNetworks } from "@/lib/networks"
import { getBundles } from "@/lib/bundles"
import { GlobeBackground } from "@/components/buy/globe-background"

export const dynamic = "force-dynamic";

export default async function BuyPage() {
  const networks = await getNetworks();
  const bundles = await getBundles();

  return (
    <div className="relative bg-muted/10 min-h-svh overflow-hidden">
      <GlobeBackground />
      <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading...</div>}>
        <BuyFlow initialNetworks={networks} initialBundles={bundles} />
      </Suspense>
    </div>
  )
}
