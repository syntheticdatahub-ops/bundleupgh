"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { LockIcon, PencilIcon, CheckIcon, XIcon, AlertTriangleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Bundle, Network } from "@/types/domain"

// ── Props ─────────────────────────────────────────────────────────────────────
//
// onEditRecipient   — called with the new phone string; the flow orchestrator
//                     handles revalidation, network re-detection, and bundle
//                     invalidation. StepReview itself only manages the edit UI.
//
// onEditBundle      — navigates back to bundle selection; the flow orchestrator
//                     preserves the current network and recipient.
//
// NO service fee is shown. Total = bundle selling price exactly.

interface Props {
  phone: string
  selectedNetwork: Network
  selectedBundle: Bundle
  onEditRecipient: (newPhone: string) => void
  onEditBundle: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export function StepReview({
  phone,
  selectedNetwork,
  selectedBundle,
  onEditRecipient,
  onEditBundle,
  onConfirm,
  isLoading,
}: Props) {
  const [editingPhone, setEditingPhone] = useState(false)
  const [draftPhone, setDraftPhone] = useState(phone)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleConfirmEdit = () => {
    if (draftPhone.length < 9) return
    setEditingPhone(false)
    onEditRecipient(draftPhone)
  }

  const handleCancelEdit = () => {
    setDraftPhone(phone)
    setEditingPhone(false)
  }

  const handlePayClick = () => {
    setShowConfirm(true)
  }

  const handleDialogConfirm = () => {
    setShowConfirm(false)
    onConfirm()
  }

  const total = selectedBundle.sellingPrice

  // Format phone for display: "0244785285" → "024 478 5285"
  const displayPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")

  return (
    <motion.div
      key="step-review"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-6 md:p-8"
    >
      <h2 className="text-xl font-semibold mb-6">Review your order</h2>

      <div className="bg-muted/40 border rounded-xl overflow-hidden mb-8">

        {/* Recipient row */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Recipient</p>
              <AnimatePresence mode="wait">
                {editingPhone ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 items-center mt-1">
                      <Input
                        autoFocus
                        value={draftPhone}
                        onChange={(e) => setDraftPhone(e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmEdit()
                          if (e.key === "Escape") handleCancelEdit()
                        }}
                        className="h-8 text-sm w-40"
                        inputMode="tel"
                        placeholder="024 XXX XXXX"
                      />
                      <button
                        onClick={handleConfirmEdit}
                        disabled={draftPhone.length < 9}
                        className="text-primary hover:text-primary/80 disabled:opacity-40 transition-colors"
                        aria-label="Confirm"
                      >
                        <CheckIcon className="size-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Cancel"
                      >
                        <XIcon className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Changing the number may reset your bundle selection.
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-sm"
                  >
                    +233 {phone}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            {!editingPhone && (
              <button
                onClick={() => {
                  setDraftPhone(phone)
                  setEditingPhone(true)
                }}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors shrink-0 mt-5"
              >
                <PencilIcon className="size-3" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Network row — read-only, derived from number */}
        <div className="px-5 py-4 border-b">
          <p className="text-xs text-muted-foreground mb-1">Network</p>
          <span className="flex items-center gap-2 text-sm font-medium">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedNetwork.color }}
            />
            {selectedNetwork.name}
            <span className="text-xs text-muted-foreground font-normal">(detected)</span>
          </span>
        </div>

        {/* Bundle row */}
        <div className="px-5 py-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bundle</p>
              <p className="font-medium text-sm">
                {selectedBundle.dataSize}
                <span className="text-muted-foreground font-normal"> · No Expiry</span>
              </p>
            </div>
            <button
              onClick={onEditBundle}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors shrink-0 mt-5"
            >
              <PencilIcon className="size-3" />
              Edit
            </button>
          </div>
        </div>

        {/* Total — bundle price = total, no service fee */}
        <div className="px-5 py-4 flex justify-between items-center bg-muted/30">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-xl font-bold">GH₵ {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Primary CTA — opens confirmation dialog */}
      <Button
        className="w-full h-14 text-lg font-semibold"
        onClick={handlePayClick}
        disabled={isLoading || editingPhone}
      >
        {isLoading ? "Processing…" : `Pay GH₵ ${total.toFixed(2)} →`}
      </Button>

      <div className="mt-5 flex justify-center items-center gap-1.5 text-xs text-muted-foreground">
        <LockIcon className="size-3" />
        <span>Payments secured by Paystack</span>
      </div>

      {/* ── Confirm Number Dialog ──────────────────────────────────────────── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
              </div>
              <DialogTitle className="text-base">Confirm recipient number</DialogTitle>
            </div>
            <DialogDescription className="text-sm leading-relaxed pt-1">
              You are about to send{" "}
              <span className="font-semibold text-foreground">
                {selectedBundle.dataSize} data
              </span>{" "}
              to:
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 rounded-xl border bg-muted/40 px-5 py-4 text-center">
            <p className="text-2xl font-bold tracking-wider">
              +233 {displayPhone}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedNetwork.color }}
              />
              {selectedNetwork.name} · {selectedBundle.dataSize} · No Expiry
            </p>
          </div>

          <p className="text-xs text-orange-500/90 bg-orange-500/8 border border-orange-500/20 rounded-lg px-4 py-3 leading-relaxed">
            ⚠️ Data bundles <span className="font-semibold">cannot be refunded</span> once
            sent. Please make sure this is the correct number before proceeding.
          </p>

          <DialogFooter className="flex gap-2 mt-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
            >
              Change number
            </Button>
            <Button
              className="flex-1 font-semibold"
              onClick={handleDialogConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Processing…" : "Yes, pay now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
