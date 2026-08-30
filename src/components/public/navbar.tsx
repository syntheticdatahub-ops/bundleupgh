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

        {/* Mobile Nav — theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={
                <button
                  type="button"
                  className="flex size-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  <MenuIcon className="size-6" />
                  <span className="sr-only">Toggle menu</span>
                </button>
              }
            />
            <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-border/60 bg-background/90 backdrop-blur-xl">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl">
                    <Image src="/logo1.png" alt="BundleUp logo" width={36} height={36} className="h-full w-full object-cover" />
                  </div>
                  <span className="font-bold">BundleUp</span>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-foreground/80",
                      pathname === link.href ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    {link.title}
                  </Link>
                ))}
                <Button nativeButton={false} render={<Link href="/buy" />} className="mt-4 w-full">
                  Buy Data
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
