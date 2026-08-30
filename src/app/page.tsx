import { PublicNavbar } from "@/components/public/navbar"
import { PublicFooter } from "@/components/public/footer"
import { HeroSection } from "@/components/public/hero-section"
import { HowItWorks } from "@/components/public/how-it-works"
import { NetworksSection } from "@/components/public/networks-section"
import { SupportWidget } from "@/components/support/support-widget"
import { getBundles } from "@/lib/bundles"
import { getNetworks } from "@/lib/networks"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [networks, bundles] = await Promise.all([getNetworks(), getBundles()])
  const activeNetworks = networks.filter((n) => n.active)

  return (
    <div className="flex min-h-svh flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <NetworksSection networks={activeNetworks} bundles={bundles} />
      </main>
      <PublicFooter />
      <SupportWidget />
    </div>
  )
}
