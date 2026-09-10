"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  MessageCircleMoreIcon,
  XIcon,
  LoaderIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  PhoneIcon,
  ArrowRightIcon,
} from "lucide-react"

const SUPPORT_PHONE = "0207 959 595"
const SUPPORT_MESSAGE_PREFIX = "Hi BundleUp Support, I need help with my order."

type ChatOption = "track" | "missing" | "payment" | "other" | "none"

type SupportOrder = {
  id: string
  orderReference: string
  network: string
  bundleName: string
  bundleSize: string
  recipientPhoneMasked: string
  amount: number
  paymentStatus: string
  fulfillmentStatus: string
  createdAt: string
}

type SupportState = {
  option: ChatOption
  phone: string
  orders: SupportOrder[]
  selectedOrder: SupportOrder | null
  status: "idle" | "checking" | "ready" | "error"
  message: string
  escalation: boolean
}

function formatDate(dateString: string) {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function getStatusText(payment: string, fulfillment: string) {
  const paymentUpper = payment?.toUpperCase() ?? "PENDING"
  const fulfillmentUpper = fulfillment?.toUpperCase() ?? "PENDING"

  if (paymentUpper === "SUCCESS" && fulfillmentUpper === "SUCCESS") {
    return "Your payment was successful and your data has been delivered successfully. ✅"
  }

  if (paymentUpper === "SUCCESS" && fulfillmentUpper === "PROCESSING") {
    return "Your payment was successful. Your data bundle is currently being processed by our network provider. You don't need to make another payment. We'll update the order once fulfillment is complete."
  }

  if (paymentUpper === "SUCCESS" && fulfillmentUpper === "ON_HOLD") {
    return "Your payment was successful. Your phone number is currently going through a one-time verification by the telecom provider. The data will be delivered automatically once it clears. Please do not re-order or pay again."
  }

  if (paymentUpper === "SUCCESS" && fulfillmentUpper === "FAILED") {
    return "Your payment was successful, but we're having trouble completing the data delivery. Your order has been flagged for attention. Please contact support so we can assist you."
  }

  if (paymentUpper === "PENDING") {
    return "Your payment is still being processed. Please wait for the payment confirmation before trying again."
  }

  if (paymentUpper === "FAILED") {
    return "Your payment was not completed. No successful payment has been recorded for this order."
  }

  if (fulfillmentUpper === "PROCESSING") {
    return "Your payment was successful and your order is currently being processed. You don't need to pay again."
  }

  if (fulfillmentUpper === "SUCCESS") {
    return "According to your order, the bundle has already been marked as delivered. If you still haven't received the data, please contact support."
  }

  if (fulfillmentUpper === "FAILED") {
    return "Your payment was successful, but the data delivery failed. Our support team needs to investigate this order."
  }

  return "We found your order and are reviewing the current status."
}

function buildWhatsAppLink(order?: SupportOrder | null, issue?: string) {
  const supportNumber = SUPPORT_PHONE
  if (!supportNumber) {
    return ""
  }

  const lines = [
    SUPPORT_MESSAGE_PREFIX,
    "",
    "Order: " + (order?.orderReference ? `#${order.orderReference}` : "Not available"),
    "Phone: " + (order?.recipientPhoneMasked || "Not available"),
    "Bundle: " + (order ? `${order.bundleName} ${order.bundleSize}` : "Not available"),
    "Payment: " + (order?.paymentStatus ? order.paymentStatus : "Not available"),
    "Fulfillment: " + (order?.fulfillmentStatus ? order.fulfillmentStatus : "Not available"),
    "",
    issue ? `Issue: ${issue}` : "Issue: I need help with my order.",
  ]

  const text = encodeURIComponent(lines.join("\n"))
  return `https://wa.me/${supportNumber.replace(/\D/g, "")}?text=${text}`
}

function QuickAction({ children, onClick, active }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2 text-left text-sm font-medium transition-all duration-200",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background/80 text-foreground hover:bg-muted/80"
      )}
    >
      {children}
    </button>
  )
}

export function SupportWidget() {
  const [open, setOpen] = React.useState(false)
  const [state, setState] = React.useState<SupportState>({
    option: "none",
    phone: "",
    orders: [],
    selectedOrder: null,
    status: "idle",
    message: "",
    escalation: false,
  })

  const [inputValue, setInputValue] = React.useState("")

  React.useEffect(() => {
    if (!open) {
      setState({ option: "none", phone: "", orders: [], selectedOrder: null, status: "idle", message: "", escalation: false })
      setInputValue("")
    }
  }, [open])

  async function checkOrderByPhone(phone: string) {
    if (!phone.trim()) {
      setState((prev) => ({ ...prev, status: "error", message: "Please enter the phone number you used for your order." }))
      return
    }

    setState((prev) => ({ ...prev, status: "checking", message: "Checking your order..." }))

    try {
      const res = await fetch("/api/support/order-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      })

      const data = await res.json()
      if (!res.ok || !data?.orders) {
        throw new Error(data?.error || "Unable to check orders.")
      }

      const nextOrders = data.orders ?? []
      if (!nextOrders.length) {
        setState((prev) => ({
          ...prev,
          phone,
          orders: [],
          selectedOrder: null,
          status: "ready",
          message: "I couldn't find an order associated with that number. Please make sure you're using the same phone number you used during checkout.",
          escalation: false,
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        phone,
        orders: nextOrders,
        selectedOrder: nextOrders.length === 1 ? nextOrders[0] : null,
        status: "ready",
        message: `I found ${nextOrders.length} recent order${nextOrders.length > 1 ? "s" : ""} for this number.`,
        escalation: false,
      }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        status: "error",
        message: "I'm having trouble checking orders right now. Please try again in a moment or contact support.",
      }))
    }
  }

  function openWhatsApp(order?: SupportOrder | null, issueText = "I need help with my order.") {
    const link = buildWhatsAppLink(order, issueText)
    if (!link) {
      setState((prev) => ({ ...prev, escalation: false, message: "Support is currently unavailable. Please try again in a moment." }))
      return
    }

    window.open(link, "_blank", "noopener,noreferrer")
  }

  function renderOrderSummary(order: SupportOrder) {
    return (
      <div className="space-y-3 rounded-xl border bg-muted/30 p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Order</div>
            <div className="font-semibold">#{order.orderReference}</div>
          </div>
          <div className="text-right text-xs text-muted-foreground">{formatDate(order.createdAt)}</div>
        </div>

        <div className="space-y-1 text-sm">
          <div><span className="text-muted-foreground">Bundle</span> <span className="font-medium">{order.bundleName || order.bundleSize}</span></div>
          <div><span className="text-muted-foreground">Number</span> <span className="font-medium">{order.recipientPhoneMasked}</span></div>
          <div><span className="text-muted-foreground">Payment</span> <span className="font-medium">{order.paymentStatus === "SUCCESS" ? "✓ Successful" : order.paymentStatus}</span></div>
          <div><span className="text-muted-foreground">Data delivery</span> <span className="font-medium">{order.fulfillmentStatus}</span></div>
        </div>

        <p className="text-sm text-foreground">{getStatusText(order.paymentStatus, order.fulfillmentStatus)}</p>
      </div>
    )
  }

  return (
    <>
      <div className="fixed right-4 bottom-4 z-50">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mb-3 w-[calc(100vw-1.5rem)] max-w-[380px] overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">BundleUp Support</div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Automated support available now
                  </div>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                  <XIcon className="size-4" />
                </button>
              </div>

              <div className="flex max-h-[560px] min-h-[420px] flex-col gap-3 overflow-y-auto p-4">
                <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm text-foreground">
                  👋 Hey! Welcome to BundleUp Support.
                  <div className="mt-1">How can we help you today?</div>
                </div>

                {state.option === "none" && (
                  <div className="grid gap-2">
                    <QuickAction onClick={() => setState((prev) => ({ ...prev, option: "track" }))}>Track my order</QuickAction>
                    <QuickAction onClick={() => setState((prev) => ({ ...prev, option: "missing" }))}>My data hasn't arrived</QuickAction>
                    <QuickAction onClick={() => setState((prev) => ({ ...prev, option: "payment" }))}>Payment issue</QuickAction>
                    <QuickAction onClick={() => setState((prev) => ({ ...prev, option: "other" }))}>Something else</QuickAction>
                  </div>
                )}

                {state.option === "track" && state.status === "idle" && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm">Sure — enter the phone number you used for your order.</div>
                    <div className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        placeholder="024 XXX XXXX"
                        className="h-10"
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => {
                        setState((prev) => ({ ...prev, phone: inputValue.trim() }))
                        checkOrderByPhone(inputValue.trim())
                      }}
                    >
                      Check Order
                    </Button>
                  </div>
                )}

                {state.option === "missing" && state.status === "idle" && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm">I&apos;m sorry about that. Let&apos;s check your order first. Enter the phone number you used for the purchase.</div>
                    <div className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        placeholder="024 XXX XXXX"
                        className="h-10"
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => {
                        setState((prev) => ({ ...prev, phone: inputValue.trim() }))
                        checkOrderByPhone(inputValue.trim())
                      }}
                    >
                      Check Order
                    </Button>
                  </div>
                )}

                {state.option === "payment" && state.status === "idle" && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm">I can help you check your payment. What happened?</div>
                    <div className="grid gap-2">
                      <QuickAction onClick={() => { setState((prev) => ({ ...prev, option: "track" })); setInputValue(prev => prev || ""); }}>I was charged but no data</QuickAction>
                      <QuickAction onClick={() => { setState((prev) => ({ ...prev, option: "track" })); setInputValue(prev => prev || ""); }}>My payment failed</QuickAction>
                      <QuickAction onClick={() => { setState((prev) => ({ ...prev, option: "track" })); setInputValue(prev => prev || ""); }}>I was charged twice</QuickAction>
                      <QuickAction onClick={() => setState((prev) => ({ ...prev, option: "other" }))}>Something else</QuickAction>
                    </div>
                  </div>
                )}

                {state.option === "other" && state.status === "idle" && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm">Tell us what happened and we&apos;ll help you out.</div>
                    <textarea
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      placeholder="Describe your issue"
                      className="min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
                    />
                    <Button
                      type="button"
                      className="w-full"
                      onClick={() => {
                        setState((prev) => ({
                          ...prev,
                          status: "ready",
                          message: "Thanks for explaining. I may not be able to resolve that automatically. Would you like to contact BundleUp Support?",
                          escalation: true,
                        }))
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                )}

                {state.status === "checking" && (
                  <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    <LoaderIcon className="size-4 animate-spin" />
                    {state.message || "Checking your order..."}
                  </div>
                )}

                {state.status === "error" && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                      <div className="flex items-center gap-2"><AlertCircleIcon className="size-4" /> {state.message}</div>
                    </div>
                    <div className="grid gap-2">
                      <Button type="button" variant="outline" onClick={() => checkOrderByPhone(state.phone || inputValue)}>
                        Try Again
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => openWhatsApp(undefined, "I need help with my order.")}>Contact Support</Button>
                    </div>
                  </div>
                )}

                {state.message && state.status === "ready" && !state.status.startsWith("check") && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm">{state.message}</div>

                    {state.orders.length > 0 && !state.selectedOrder && (
                      <div className="space-y-2">
                        {state.orders.map((order) => (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => {
                              setState((prev) => ({ ...prev, selectedOrder: order }))
                            }}
                            className="w-full rounded-xl border bg-background px-3 py-2 text-left"
                          >
                            <div className="flex items-center justify-between gap-2 text-sm">
                              <span className="font-medium">{order.bundleName || order.bundleSize}</span>
                              <span className="text-muted-foreground">GH₵{order.amount}</span>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Payment: {order.paymentStatus} &nbsp;•&nbsp; Delivery: {order.fulfillmentStatus}
                            </div>
                            <div className="mt-1 text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {state.selectedOrder && renderOrderSummary(state.selectedOrder)}

                    {state.selectedOrder && (
                      <div className="grid gap-2">
                        <Button type="button" variant="secondary" onClick={() => openWhatsApp(state.selectedOrder, `Issue: ${state.option === "missing" ? "My data hasn't arrived" : state.option === "payment" ? "Payment issue" : "I need help with my order."}`)}>
                          Contact Support
                        </Button>
                      </div>
                    )}

                    {state.escalation && (
                      <div className="grid gap-2">
                        <Button type="button" variant="secondary" onClick={() => openWhatsApp(undefined, inputValue || "I need help with my order.")}>
                          Contact Support
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setState((prev) => ({ ...prev, option: "none", status: "idle", message: "", escalation: false }))}>
                          Back to Help
                        </Button>
                      </div>
                    )}

                    {!state.selectedOrder && !state.escalation && state.orders.length === 0 && (
                      <div className="grid gap-2">
                        <Button type="button" variant="outline" onClick={() => setState((prev) => ({ ...prev, option: "track", status: "idle", message: "", selectedOrder: null, orders: [] }))}>
                          Try Another Number
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => openWhatsApp(undefined, "I need help with my order.")}>Contact Support</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          animate={{
            y: [0, -7, 0],
            boxShadow: [
              "0 0 0 rgba(16,185,129,0)",
              "0 0 18px rgba(16,185,129,0.75)",
              "0 0 28px rgba(45,212,191,0.9)",
            ],
          }}
          transition={{
            y: { duration: 2.1, repeat: Infinity, ease: "easeInOut" },
            boxShadow: { duration: 2.1, repeat: Infinity, ease: "easeInOut" },
          }}
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 text-white ring-2 ring-white/20 shadow-[0_0_22px_rgba(16,185,129,0.7)] transition-all hover:shadow-[0_0_30px_rgba(45,212,191,0.95)]"
          aria-label="Open BundleUp support"
        >
          <MessageCircleMoreIcon className="size-6" />
        </motion.button>
      </div>
    </>
  )
}
