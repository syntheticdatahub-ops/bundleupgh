"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ZapIcon, MenuIcon } from "lucide-react"
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded bg-primary text-primary-foreground">
            <ZapIcon className="size-4" />
          </div>
          <span className="font-bold tracking-tight">BundleUp</span>
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
          <ThemeToggle />
          <Button nativeButton={false} render={<Link href="/buy" />} size="sm" className="ml-2">
            Buy Data
          </Button>
        </nav>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="size-8 rounded-full" />}>
              <MenuIcon className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded bg-primary text-primary-foreground">
                    <ZapIcon className="size-4" />
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
