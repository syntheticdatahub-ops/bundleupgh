"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MenuIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Buy Data", href: "/buy" },
  { title: "Track Order", href: "/track" },
  { title: "Help", href: "/help" },
]

export function PublicNavbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto flex h-16 md:h-18 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-black/30">
            <Image src="/logo1.png" alt="BundleUp logo" width={40} height={40} className="h-full w-full object-cover" />
          </div>
          <span className="font-bold text-base tracking-tight">BundleUp</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === link.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {link.title}
            </Link>
          ))}
          <Button nativeButton={false} render={<Link href="/buy" />} size="sm" className="ml-2">
            Buy Data
          </Button>
        </nav>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={
                <button
                  type="button"
                  className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/8 hover:shadow-[0_12px_35px_rgba(15,23,42,0.28)]"
                >
                  <MenuIcon className="size-4" />
                  <span className="sr-only">Toggle menu</span>
                </button>
              }
            />
            <SheetContent side="right" className="w-[86vw] max-w-[360px] rounded-l-[28px] border border-white/10 bg-[#070a0e]/95 p-0 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/5 px-6 pb-5 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-sm">
                    <Image src="/logo1.png" alt="BundleUp logo" width={36} height={36} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-lg font-semibold tracking-tight">BundleUp</span>
                </div>
                {/* Custom close button logic is handled by Sheet primitive natively, so we just let it render its own or style a specific trigger if we want, but removing the manual one avoids double-close buttons. The primitive provides a perfectly placed X. */}
              </div>

              <div className="flex flex-col space-y-6 px-8 py-8">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="group flex items-center gap-4 text-base transition-all duration-300"
                    >
                      {/* Active Indicator (Glowing dot or empty space for alignment) */}
                      <div className="flex w-3 items-center justify-center">
                        {isActive ? (
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-transparent transition-colors group-hover:bg-white/10" />
                        )}
                      </div>
                      
                      <span
                        className={cn(
                          "font-medium tracking-wide transition-colors duration-300",
                          isActive ? "text-white" : "text-white/50 group-hover:text-white/80"
                        )}
                      >
                        {link.title}
                      </span>
                    </Link>
                  );
                })}

                <div className="pt-6">
                  <Button
                    nativeButton={false}
                    render={<Link href="/buy" />}
                    className="w-full h-12 rounded-2xl bg-blue-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.24)] transition-all hover:scale-[1.02] hover:bg-blue-500 hover:shadow-[0_12px_40px_rgba(37,99,235,0.35)]"
                  >
                    Buy Data →
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
