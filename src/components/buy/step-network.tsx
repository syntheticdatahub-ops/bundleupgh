"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowLeftIcon, CheckCircle2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Network } from "@/types/domain"

interface Props {
  phone: string
  networks: Network[]
  networkId: string | null
  detectedNetworkId: string | null
  onChange: (id: string) => void
  onBack: () => void
  onContinue: () => void
}

export function StepNetwork({
  phone,
  networks,
  networkId,
  detectedNetworkId,
  onChange,
  onBack,
  onContinue,
}: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    if (detectedNetworkId && id !== detectedNetworkId) {
      setPendingId(id)
    } else {
      onChange(id)
      setTimeout(onContinue, 350)
    }
  }

  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 md:p-8 relative"
    >
      <button
        onClick={onBack}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeftIcon className="size-4 mr-1" /> Change number
      </button>

      <h2 className="text-xl font-semibold mb-1">Select network</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Confirm the network for <span className="font-medium text-foreground">+233 {phone}</span>.
      </p>

      <div className="grid gap-3 mb-4">
        {networks.map((network) => (
          <label
            key={network.id}
            className={cn(
              "relative flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all hover:bg-muted/50",
              networkId === network.id
                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                : "border-border"
            )}
          >
            <input
              type="radio"
              name="network"
              className="sr-only"
              checked={networkId === network.id}
              onChange={() => handleSelect(network.id)}
            />
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: network.color }} />
              <div>
                <span className="font-semibold text-base">{network.name}</span>
                {detectedNetworkId === network.id && (
                  <span className="ml-2 text-xs text-muted-foreground">(detected)</span>
                )}
              </div>
            </div>
            {networkId === network.id && <CheckCircle2Icon className="text-primary size-5" />}
          </label>
        ))}
      </div>

      {/* Network change confirmation overlay */}
      <AnimatePresence>
        {pendingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 16, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="bg-card border shadow-2xl rounded-2xl p-6 w-full max-w-sm relative overflow-hidden"
            >
              {/* Amber accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />

              <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                This number looks like a{" "}
                <strong className="text-foreground">
                  {networks.find((n) => n.id === detectedNetworkId)?.name}
                </strong>{" "}
                number. Selecting the wrong network will cause the transaction to fail.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    onChange(pendingId)
                    setPendingId(null)
                    setTimeout(onContinue, 350)
                  }}
                >
                  Yes, use {networks.find((n) => n.id === pendingId)?.name}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setPendingId(null)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
