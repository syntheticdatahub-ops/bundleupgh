"use client"

import { motion } from "motion/react"
import { CheckCircle2Icon, AlertCircleIcon, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Network, Bundle } from "@/types/domain"

type FlowStatus = "processing" | "success" | "failed"

interface Props {
  status: FlowStatus
  orderId?: string
  phone: string
  selectedNetwork?: Network
  selectedBundle?: Bundle
  onRetry?: () => void
  onGoBack?: () => void
}

export function StepStatus({
  status,
  orderId,
  phone,
  selectedNetwork,
  selectedBundle,
  onRetry,
  onGoBack,
}: Props) {
  return (
    <motion.div
      key={`step-status-${status}`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-8 flex flex-col items-center text-center"
    >
      {status === "processing" && (
        <>
          <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Loader2Icon className="size-10 animate-spin text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Redirecting to payment…</h2>
          <p className="text-muted-foreground mb-8">
            You should be on the Paystack payment page. If you were redirected back or cancelled, you can return to your order.
          </p>
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack} className="h-11 px-6">
              ← Back to review order
            </Button>
          )}
        </>
      )}

      {status === "success" && (
        <>
          <div className="relative size-28 mb-10 mt-4 flex items-center justify-center">
            {/* Outer bursting rings */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.5, 2], opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, ease: "easeOut", repeat: Infinity, repeatDelay: 1 }}
              className="absolute inset-0 rounded-full bg-green-500/20"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }}
              className="absolute inset-0 bg-green-500/10 rounded-full blur-xl"
            />
            
            {/* Main Circle & Drawing Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 250 }}
              className="relative size-full bg-gradient-to-tr from-green-600/20 to-emerald-400/20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)] ring-1 ring-green-500/30"
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-12 text-green-500"
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                  d="M5 12l5 5L20 7"
                />
              </motion.svg>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-foreground">
              Boom! Connected. 🚀
            </h2>
            <p className="text-base text-muted-foreground mb-8 max-w-[280px] mx-auto leading-relaxed">
              Congratulations! Your{" "}
              <strong className="text-foreground">{selectedBundle?.dataSize}</strong> bundle is locked and loaded for{" "}
              <span className="font-semibold text-foreground">+233 {phone}</span>.
            </p>
          </motion.div>

          {orderId && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-muted/30 border border-border/50 rounded-xl px-5 py-3 text-xs font-mono text-muted-foreground mb-8 flex items-center justify-center gap-2"
            >
              <span className="uppercase tracking-widest text-[10px] font-bold text-foreground/50">Ref</span>
              <span className="text-foreground/80">{orderId}</span>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col gap-3 w-full max-w-xs"
          >
            <Button className="h-12 font-bold shadow-lg shadow-primary/20" nativeButton={false} render={<Link href="/buy" />}>
              Buy More Data
            </Button>
            <Button variant="outline" className="h-12 border-border/50 hover:bg-muted/50" nativeButton={false} render={<Link href="/track" />}>
              Track Order
            </Button>
          </motion.div>
        </>
      )}

      {status === "failed" && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="size-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6"
          >
            <AlertCircleIcon className="size-10 text-red-600 dark:text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            Your payment was not completed or the data could not be sent. You have not been charged.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {onRetry && (
              <Button onClick={onRetry}>Try again</Button>
            )}
            <Button variant="outline" nativeButton={false} render={<Link href="/help" />}>
              Get help
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}
