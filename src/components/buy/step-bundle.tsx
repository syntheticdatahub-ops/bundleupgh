"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowLeftIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Bundle, Network } from "@/types/domain"

interface Props {
  bundles: Bundle[]
  selectedNetwork: Network | null
  bundleId: string | null
  phone?: string
  onSelect: (id: string) => void
  onBack: () => void
  onContinue: (id?: string) => void
}

export function StepBundle({
  bundles,
  selectedNetwork,
  bundleId,
  phone,
  onSelect,
  onBack,
  onContinue,
}: Props) {
  const [isConfirming, setIsConfirming] = useState(false)

  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 md:p-8"
    >
      <motion.div 
        animate={{ opacity: isConfirming ? 0 : 1, y: isConfirming ? -10 : 0 }} 
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            disabled={isConfirming}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-4 mr-1" /> Change number
          </button>
          {selectedNetwork && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ borderColor: selectedNetwork.color, color: selectedNetwork.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedNetwork.color }} />
              {selectedNetwork.name} detected
            </span>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-1">Choose your bundle</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {phone ? `Select a package for +233 ${phone}` : "Select a data package."}
        </p>
      </motion.div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8 relative">
        {bundles.map((bundle) => {
          const isSelected = bundleId === bundle.id
          
          let cardColor = ""
          let textColor = ""
          let mutedColor = "text-muted-foreground"
          let priceColor = "text-primary"
          let tagBg = "bg-primary text-primary-foreground"
          let borderClass = isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
          let hoverClass = !isConfirming ? "hover:border-primary/50" : ""

          if (selectedNetwork) {
            const net = selectedNetwork.id.toLowerCase()
            if (net === "mtn") {
              cardColor = "bg-[#ffcc00]"
              textColor = "text-black"
              mutedColor = "text-black/70"
              priceColor = "text-black"
              tagBg = "bg-black text-[#ffcc00]"
              borderClass = isSelected ? "border-black ring-2 ring-black shadow-md" : "border-transparent"
              hoverClass = !isConfirming ? "hover:ring-1 hover:ring-black/50" : ""
            } else if (net === "telecel") {
              cardColor = "bg-[#e20010]"
              textColor = "text-white"
              mutedColor = "text-white/80"
              priceColor = "text-white"
              tagBg = "bg-white text-[#e20010]"
              borderClass = isSelected ? "border-white ring-2 ring-white shadow-md" : "border-transparent"
              hoverClass = !isConfirming ? "hover:ring-1 hover:ring-white/50" : ""
            } else if (net === "airteltigo") {
              cardColor = "bg-[#0033a0]"
              textColor = "text-white"
              mutedColor = "text-white/80"
              priceColor = "text-white"
              tagBg = "bg-white text-[#0033a0]"
              borderClass = isSelected ? "border-white ring-2 ring-white shadow-md" : "border-transparent"
              hoverClass = !isConfirming ? "hover:ring-1 hover:ring-white/50" : ""
            }
          }

          return (
            <motion.label
              key={bundle.id}
              animate={{ 
                opacity: isConfirming && !isSelected ? 0 : 1,
                scale: isConfirming && isSelected ? 1.05 : 1,
                filter: isConfirming && !isSelected ? "blur(8px)" : "blur(0px)",
                zIndex: isConfirming && isSelected ? 10 : 1
              }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              className={cn(
                "relative flex flex-col p-3 border rounded-xl cursor-pointer transition-all",
                !bundle.active && "opacity-40 pointer-events-none",
                cardColor,
                textColor,
                borderClass,
                hoverClass,
                isConfirming && isSelected && "shadow-2xl"
              )}
            >
              <input
                type="radio"
                name="bundle"
                className="sr-only"
                checked={isSelected}
                onChange={() => {
                  if (bundle.active && !isConfirming) {
                    onSelect(bundle.id)
                    setIsConfirming(true)
                    setTimeout(() => onContinue(bundle.id), 600)
                  }
                }}
                disabled={!bundle.active || isConfirming}
              />

              {bundle.tag && (
                <span className={cn("absolute -top-2 right-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full", tagBg)}>
                  {bundle.tag.replace("-", " ")}
                </span>
              )}

              <div className="flex items-center gap-1 mb-0.5">
                {selectedNetwork && (
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">
                    {selectedNetwork.name}
                  </span>
                )}
              </div>
              <span className="font-bold text-xl leading-none mb-1">{bundle.dataSize}</span>
              <span className={cn("text-[10px] mb-2", mutedColor)}>No Expiry</span>
              
              <div className="mt-auto flex items-end justify-between">
                <span className={cn("font-semibold text-sm", priceColor)}>
                  GHS {bundle.sellingPrice.toFixed(2)}
                </span>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded opacity-80 font-medium", 
                  selectedNetwork?.id === "mtn" ? "bg-black/10" : "bg-white/20"
                )}>
                  Buy
                </span>
              </div>
            </motion.label>
          )
        })}
      </div>
    </motion.div>
  )
}
