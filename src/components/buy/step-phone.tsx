"use client"

import { motion } from "motion/react"
import { PhoneIcon, PackageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Bundle, Network } from "@/types/domain"

interface Props {
  phone: string
  onChange: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
  detectedNetwork: Network | null
  preselectedBundle?: Bundle | null
  preselectedNetwork?: Network | null
}

const NETWORK_BG: Record<string, string> = {
  mtn: "#ffcc00",
  telecel: "#e20010",
  airteltigo: "#0033a0",
}

export function StepPhone({ phone, onChange, onSubmit, detectedNetwork, preselectedBundle, preselectedNetwork }: Props) {
  const netColor = preselectedNetwork
    ? NETWORK_BG[preselectedNetwork.id.toLowerCase()] ?? preselectedNetwork.color
    : null
  const isLight = preselectedNetwork?.id.toLowerCase() === "mtn"

  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 md:p-8"
    >
      {/* Pre-selected bundle banner */}
      {preselectedBundle && preselectedNetwork && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl p-3 mb-6"
          style={{ backgroundColor: netColor ?? "#888" }}
        >
          <div
            className="size-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
            style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
          >
            <PackageIcon className="size-5" style={{ color: isLight ? "black" : "white" }} />
          </div>
          <div style={{ color: isLight ? "black" : "white" }}>
            <div className="text-xs opacity-75 font-medium">{preselectedNetwork.name} · No Expiry</div>
            <div className="font-bold text-lg leading-none">
              {preselectedBundle.dataSize}
              <span className="text-sm font-normal ml-2">
                GHS {preselectedBundle.sellingPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      <h2 className="text-xl font-semibold mb-1">
        {preselectedBundle ? "Who receives the data?" : "Enter recipient number"}
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        {preselectedBundle
          ? `Enter the ${preselectedNetwork?.name ?? ""} number that will receive the ${preselectedBundle.dataSize}.`
          : "This is the number that will receive the data. It doesn't have to be yours."}
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <PhoneIcon className="absolute left-3.5 top-3.5 size-5 text-muted-foreground" />
          <Input
            placeholder="024 XXX XXXX"
            className="pl-11 h-12 text-lg tracking-wide"
            value={phone}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
            autoFocus
            inputMode="tel"
          />
          {/* Live network detection badge */}
          {detectedNetwork && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-3 text-xs font-bold px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: detectedNetwork.color }}
            >
              {detectedNetwork.name}
            </motion.span>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base"
          disabled={phone.length < 9}
        >
          {preselectedBundle ? `Continue to pay GHS ${preselectedBundle.sellingPrice.toFixed(2)} →` : "Continue →"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        No account required. The data goes directly to the recipient.
      </p>
    </motion.div>
  )
}
