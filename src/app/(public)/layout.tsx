import { PublicNavbar } from "@/components/public/navbar"
import { PublicFooter } from "@/components/public/footer"
import { SupportWidget } from "@/components/support/support-widget"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <SupportWidget />
    </div>
  )
}
