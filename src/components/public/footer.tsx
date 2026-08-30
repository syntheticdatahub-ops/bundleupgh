"use client"

import Link from "next/link"
import { ZapIcon } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

import Image from "next/image"

function BuiltByKxy() {
  const [open, setOpen] = useState(false)

  const socials = [
    {
      name: "TikTok",
      handle: "@kxystaysup",
      url: "https://tiktok.com/@kxystaysup",
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      ),
      color: "text-white",
      bg: "bg-black",
    },
    {
      name: "Snapchat",
      handle: "@kxystaysup",
      url: "https://snapchat.com/add/kxystaysup",
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.166.006C9.035.006 6.413 1.227 4.911 3.306 3.797 4.83 3.3 6.802 3.3 9.1c0 .63.05 1.27.13 1.9l-.06.03c-.34.15-.73.23-1.15.23-.52 0-1.01-.14-1.38-.28-.06-.02-.11-.03-.17-.03a.38.38 0 0 0-.37.38c0 .2.14.38.35.44.04.01 1.48.34 1.97 1.86.02.05.04.11.04.17 0 .1-.04.19-.12.28-.45.44-1.77 1.08-1.77 2.29 0 .77.57 1.4 1.27 1.4.15 0 .31-.03.47-.08.51-.19 1.01-.3 1.48-.3.4 0 .77.07 1.07.21-.2.9-.32 1.9-.32 2.98 0 .42.34.76.77.76h.01c.06 0 .57-.01 1.38-.13.88-.13 1.78-.42 2.68-.86.77-.39 1.57-.66 2.36-.66.8 0 1.61.27 2.38.66.89.44 1.78.73 2.66.86.81.12 1.32.13 1.38.13h.01c.42 0 .77-.34.77-.77 0-1.08-.12-2.08-.32-2.97.3-.14.66-.21 1.07-.21.47 0 .97.11 1.47.3.16.06.32.09.48.09.7 0 1.27-.63 1.27-1.4 0-1.21-1.32-1.85-1.77-2.29a.44.44 0 0 1-.12-.28c0-.06.02-.12.04-.17.49-1.52 1.93-1.85 1.97-1.86a.44.44 0 0 0 .35-.44.38.38 0 0 0-.37-.38c-.06 0-.11.01-.17.03-.37.14-.86.28-1.38.28-.42 0-.81-.08-1.15-.23l-.06-.03c.08-.63.13-1.27.13-1.9 0-2.3-.5-4.27-1.62-5.8C17.73 1.23 15.2.006 12.166.006z" />
        </svg>
      ),
      color: "text-black",
      bg: "bg-yellow-400",
    },
    {
      name: "Instagram",
      handle: "@kxystaysup",
      url: "https://instagram.com/kxystaysup",
      icon: (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      ),
      color: "text-white",
      bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    },
  ]

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-[13px] text-white/50 hover:text-white/90 transition-colors cursor-pointer select-none font-medium tracking-wide"
      >
        Built by <span className="text-white font-bold">Kxy</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-8 right-0 w-56 rounded-2xl border border-white/10 bg-[#090b0f]/95 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl p-3 z-50"
          >
            {/* Header */}
            <div className="mb-3 px-1">
              <p className="text-xs font-bold text-white">Kxy</p>
              <p className="text-[10px] text-white/50">Find me on the internet</p>
            </div>

            {/* Social links */}
            <div className="flex flex-col gap-1">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/5 transition-colors group"
                >
                  <span className={`flex size-7 items-center justify-center rounded-lg ${s.bg} ${s.color} shrink-0`}>
                    {s.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/90 leading-none group-hover:text-white transition-colors">{s.name}</p>
                    <p className="text-[10px] text-white/50 mt-0.5 truncate">{s.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PublicFooter() {
  return (
    <footer className="relative bg-transparent mt-12 md:mt-24 w-full">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
          
          {/* Logo & Tagline */}
          <div className="flex flex-col items-start gap-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-105">
                <Image src="/logo1.png" alt="BundleUp logo" width={40} height={40} className="h-full w-full object-cover" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white/90 group-hover:text-white transition-colors">BundleUp</span>
            </Link>
            <p className="text-sm text-white/50 max-w-[220px] leading-relaxed">
              Ghana's fastest data reselling platform. Delivered instantly.
            </p>
          </div>

          {/* Links & Contact Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {/* Navigation */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40">Navigation</h4>
              <div className="flex flex-col gap-3.5 text-[14px] text-white/70 font-medium">
                <Link href="/help" className="hover:text-white transition-colors">Help & FAQ</Link>
                <Link href="/track" className="hover:text-white transition-colors">Track Order</Link>
                <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>

            {/* Support */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40">Support</h4>
              <div className="flex flex-col gap-4 text-[14px]">
                <a href="tel:0207959595" className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
                    </svg>
                  </div>
                  <span className="font-medium">0207 959 595</span>
                </a>
                <a href="mailto:syntheticdatahub@gmail.com" className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <span className="font-medium truncate text-xs sm:text-sm">syntheticdatahub@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
          <span className="text-[13px] text-white/40 tracking-wide">
            © {new Date().getFullYear()} BundleUp. All rights reserved.
          </span>
          <BuiltByKxy />
        </div>
      </div>
    </footer>
  )
}
