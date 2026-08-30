"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDownIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Bundle, Network } from "@/types/domain"

interface Props {
  networks: Network[]
  bundles: Bundle[]
}

const NETWORK_COLORS: Record<string, { bg: string; text: string; card: string; pill: string }> = {
  mtn:       { bg: "#ffcc00", text: "text-black",  card: "bg-[#ffcc00] hover:bg-[#f5c200]", pill: "bg-black/10 text-black" },
  telecel:   { bg: "#e20010", text: "text-white",  card: "bg-[#e20010] hover:bg-[#c9000e]", pill: "bg-white/20 text-white" },
  airteltigo:{ bg: "#0033a0", text: "text-white",  card: "bg-[#0033a0] hover:bg-[#002b85]", pill: "bg-white/20 text-white" },
}

export function NetworksSection({ networks, bundles }: Props) {
  const [openNetworkId, setOpenNetworkId] = useState<string | null>(null)
  const router = useRouter()

  const handleNetworkClick = (id: string) => {
    setOpenNetworkId(prev => prev === id ? null : id)
  }

  const handleBundleClick = (bundle: Bundle) => {
    router.push(`/buy?bundleId=${bundle.id}`)
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Supported Networks</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We provide instant data top-ups for all major networks in Ghana. Click a network to browse packages.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {networks.map((network, index) => {
            const colors = NETWORK_COLORS[network.id.toLowerCase()] ?? {
              bg: network.color ?? "#888",
              text: "text-white",
              card: "hover:opacity-90",
              pill: "bg-white/20 text-white",
            }
            const isOpen = openNetworkId === network.id
            const networkBundles = bundles
              .filter(b => b.networkId === network.id)
              .sort((a, b) => a.sellingPrice - b.sellingPrice)

            return (
              <motion.div
                key={network.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              >
                {/* Network Card / Header */}
                <button
                  onClick={() => handleNetworkClick(network.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-200 cursor-pointer",
                    colors.card,
                    colors.text,
                    isOpen && "rounded-b-none"
                  )}
                  style={{ backgroundColor: isOpen ? undefined : undefined }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="size-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner"
                      style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
                    >
                      {network.name[0]}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg leading-none">{network.name}</div>
                      <div className="text-sm opacity-75 mt-0.5 flex items-center gap-1.5">
                        <span className="relative flex size-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-50" />
                          <span className="relative inline-flex rounded-full size-2 bg-current" />
                        </span>
                        Systems Operational · {networkBundles.length} packages
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={cn("text-sm font-medium px-3 py-1 rounded-full", colors.pill)}>
                      Browse packages
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDownIcon className="size-5 opacity-70" />
                    </motion.div>
                  </div>
                </button>

                {/* Bundle Dropdown */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="rounded-b-2xl p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"
                        style={{ backgroundColor: colors.bg }}
                      >
                        {networkBundles.length === 0 ? (
                          <p className={cn("col-span-4 text-center py-4 text-sm opacity-70", colors.text)}>
                            No bundles available right now. Check back after a catalog sync.
                          </p>
                        ) : (
                          networkBundles.map((bundle) => (
                            <motion.button
                              key={bundle.id}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleBundleClick(bundle)}
                              className={cn(
                                "flex flex-col items-start p-3 rounded-xl cursor-pointer text-left transition-all",
                                colors.text,
                                "bg-black/10 hover:bg-black/20"
                              )}
                            >
                              <span className="font-bold text-lg leading-none">{bundle.dataSize}</span>
                              <span className="text-[10px] opacity-70 mt-0.5 mb-2">No Expiry</span>
                              <span className="font-semibold text-sm mt-auto">
                                GHS {bundle.sellingPrice.toFixed(2)}
                              </span>
                            </motion.button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
