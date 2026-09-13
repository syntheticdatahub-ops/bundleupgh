import { PublicNavbar } from "@/components/public/navbar"
import { PublicFooter } from "@/components/public/footer"
import { SupportWidget } from "@/components/support/support-widget"
import { redirect } from "next/navigation"
import { getMaintenanceState } from "@/lib/maintenance"

export const dynamic = "force-dynamic"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const state = await getMaintenanceState()

  if (state.enabled) {
    redirect("/maintenance")
  }

  return (
    <div className="flex min-h-svh flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <SupportWidget />
    </div>
  )
}
