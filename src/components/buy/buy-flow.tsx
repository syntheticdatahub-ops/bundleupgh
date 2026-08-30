"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "motion/react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { detectNetworkCode } from "@/lib/phone"
import { StepPhone } from "./step-phone"
import { StepNetwork } from "./step-network"
import { StepBundle } from "./step-bundle"
import { StepReview } from "./step-review"
import { StepStatus } from "./step-status"
import type { Bundle, Network } from "@/types/domain"

const STEPS_DETECTED   = ["Number", "Bundle", "Review", "Done"] as const
const STEPS_UNDETECTED = ["Number", "Network", "Bundle", "Review", "Done"] as const

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="px-6 pt-6 pb-0">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              i < current ? "bg-primary" : i === current - 1 ? "bg-primary/50" : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-right">
        Step {Math.min(current, total)} of {total}
      </p>
    </div>
  )
}

export function BuyFlow({ 
  initialNetworks, 
  initialBundles 
}: { 
  initialNetworks: Network[]
  initialBundles: Bundle[] 
}) {
  const searchParams = useSearchParams()
  const initialPhone = searchParams.get("phone") || ""
  const preselectedBundleId = searchParams.get("bundleId") || null

  const allNetworks = initialNetworks;

  // If a bundleId was passed in the URL, pre-resolve network from it
  const preselectedBundle = preselectedBundleId
    ? initialBundles.find(b => b.id === preselectedBundleId) ?? null
    : null
  const preselectedNetworkId = preselectedBundle?.networkId ?? null

  // Core state
  const [phone, setPhone] = useState(initialPhone)
  const [networkId, setNetworkId] = useState<string | null>(preselectedNetworkId)
  const [bundleId, setBundleId] = useState<string | null>(preselectedBundleId)

  type StepName = "phone" | "network" | "bundle" | "review" | "status"
  const [stepName, setStepName] = useState<StepName>("phone")

  const [flowStatus, setFlowStatus] = useState<"processing" | "success" | "failed" | null>(null)
  const [orderId, setOrderId] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const detectedNetworkCode = detectNetworkCode(phone)
  const detectedNetwork = allNetworks.find(n => n.code === detectedNetworkCode) || null;
  const selectedNetwork = networkId ? allNetworks.find(n => n.id === networkId) || null : null;
  const availableBundles = networkId
    ? initialBundles
        .filter(b => b.networkId === networkId)
        .sort((a, b) => a.sellingPrice - b.sellingPrice)
    : [];
  const selectedBundle = bundleId ? initialBundles.find(b => b.id === bundleId) || null : null;

  // When a bundle is pre-selected from homepage, we always know the network — use shorter steps
  const bundlePreloaded = !!preselectedBundleId && !!preselectedBundle
  const networkKnown = bundlePreloaded ? true : !!detectedNetwork
  const steps = networkKnown ? STEPS_DETECTED : STEPS_UNDETECTED
  const stepIndex: Record<StepName, number> = networkKnown
    ? { phone: 1, network: 1, bundle: 2, review: 3, status: 4 }
    : { phone: 1, network: 2, bundle: 3, review: 4, status: 5 }

  useEffect(() => {
    if (initialPhone.length >= 9) {
      const code = detectNetworkCode(initialPhone)
      const net = allNetworks.find(n => n.code === code)
      if (bundlePreloaded) {
        // Bundle pre-selected from homepage — just need phone, go to review
        setNetworkId(preselectedNetworkId)
        setStepName("review")
      } else if (net) {
        setNetworkId(net.id)
        setStepName("bundle")
      } else {
        setStepName("network")
      }
    } else if (!bundlePreloaded && initialPhone.length >= 3) {
      const code = detectNetworkCode(initialPhone)
      const net = allNetworks.find(n => n.code === code)
      if (net) setNetworkId(net.id)
    }
  }, [initialPhone, allNetworks])

  const handlePhoneChange = (val: string) => {
    setPhone(val)
    // Only auto-detect network and clear bundle if the bundle wasn't pre-selected from homepage
    if (!bundlePreloaded) {
      const code = val.length >= 3 ? detectNetworkCode(val) : null
      const net = allNetworks.find(n => n.code === code)
      setNetworkId(net?.id ?? null)
      setBundleId(null)
    }
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length < 9) return

    if (bundlePreloaded) {
      // Bundle already chosen from homepage — go straight to review
      setStepName("review")
      return
    }

    const code = detectNetworkCode(phone)
    const net = allNetworks.find(n => n.code === code)
    if (net) {
      setNetworkId(net.id)
      setStepName("bundle")
    } else {
      setStepName("network")
    }
  }

  const handleRecipientChange = (newPhone: string) => {
    setPhone(newPhone)
    const code = detectNetworkCode(newPhone)
    const net = allNetworks.find(n => n.code === code)
    setNetworkId(net?.id ?? null)

    if (bundleId) {
      const currentBundle = initialBundles.find(b => b.id === bundleId)
      if (!currentBundle || currentBundle.networkId !== (net?.id ?? "")) {
        setBundleId(null)
        if (net) {
          setStepName("bundle")
        } else {
          setStepName("network")
        }
        return
      }
    }
    setStepName("review")
  }

  const handleConfirmOrder = async () => {
    if (!networkId || !bundleId) return
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientPhone: phone, networkId, bundleId }),
      })

      if (!res.ok) {
        setFlowStatus("failed")
        setStepName("status")
        return
      }

      const data = await res.json()
      setOrderId(data.orderId)

      const initRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderId }),
      })

      const initData = await initRes.json()
      if (!initRes.ok || !initData?.authorization_url) {
        setFlowStatus("failed")
        setStepName("status")
        return
      }

      setFlowStatus("processing")
      setStepName("status")
      window.location.href = initData.authorization_url
    } catch {
      setFlowStatus("failed")
      setStepName("status")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setFlowStatus(null)
    setStepName("review")
    setIsSubmitting(false)
  }

  const handleBundleSelect = (id: string) => {
    setBundleId(id)
  }

  const handleBundleContinue = (selected: Bundle) => {
    setBundleId(selected.id)
    setStepName("review")
  }

  const showProgress = stepName !== "status"

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm">
          {showProgress && (
            <ProgressBar current={stepIndex[stepName]} total={steps.length} />
          )}

          <AnimatePresence mode="wait">
            {stepName === "phone" && (
              <StepPhone
                key="phone"
                phone={phone}
                detectedNetwork={detectedNetwork}
                preselectedBundle={preselectedBundle}
                preselectedNetwork={preselectedBundle ? allNetworks.find(n => n.id === preselectedBundle.networkId) ?? null : null}
                onChange={handlePhoneChange}
                onSubmit={handlePhoneSubmit}
              />
            )}

            {stepName === "network" && (
              <StepNetwork
                key="network"
                phone={phone}
                networks={allNetworks}
                networkId={networkId}
                detectedNetworkId={detectedNetwork?.id ?? null}
                onChange={setNetworkId}
                onBack={() => setStepName("phone")}
                onContinue={() => setStepName("bundle")}
              />
            )}

            {stepName === "bundle" && (
              <StepBundle
                key="bundle"
                bundles={availableBundles}
                selectedNetwork={selectedNetwork}
                bundleId={bundleId}
                phone={phone}
                onSelect={handleBundleSelect}
                onBack={() =>
                  detectedNetwork ? setStepName("phone") : setStepName("network")
                }
                onContinue={(id) => {
                  const targetId = id || bundleId
                  if (!targetId) return
                  const b = initialBundles.find(b => b.id === targetId)
                  if (b) handleBundleContinue(b)
                }}
              />
            )}

            {stepName === "review" && selectedNetwork && selectedBundle && (
              <StepReview
                key="review"
                phone={phone}
                selectedNetwork={selectedNetwork}
                selectedBundle={selectedBundle}
                onEditRecipient={handleRecipientChange}
                onEditBundle={() => setStepName("bundle")}
                onConfirm={handleConfirmOrder}
                isLoading={isSubmitting}
              />
            )}

            {stepName === "status" && flowStatus && (
              <StepStatus
                key="status"
                status={flowStatus}
                orderId={orderId}
                phone={phone}
                selectedNetwork={selectedNetwork ?? undefined}
                selectedBundle={selectedBundle ?? undefined}
                onRetry={handleRetry}
                onGoBack={flowStatus === "processing" ? handleRetry : undefined}
              />
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}
