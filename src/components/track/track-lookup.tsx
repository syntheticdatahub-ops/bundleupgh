"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  PhoneIcon, SearchIcon, Loader2Icon, ArrowRightIcon,
  XIcon, CheckCircle2Icon, AlertCircleIcon, ClockIcon, PackageSearchIcon,
} from "lucide-react"

// Network colors for the visual indicator
const NETWORK_COLORS: Record<string, string> = {
  mtn: "#FFCC00",
  telecel: "#E20010",
  airteltigo: "#0032A0",
}

const NETWORK_NAMES: Record<string, string> = {
  mtn: "MTN",
  telecel: "Telecel",
  airteltigo: "AirtelTigo",
}

type PublicOrder = {
  id: string;
  orderReference: string;
  network: string;
  bundleName: string;
  bundleSize: string;
  recipientPhoneMasked: string;
  amount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  if (!iso) return "—"
  try {
    return new Intl.DateTimeFormat("en-GH", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function PaymentStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase()
  return (
    <Badge variant="secondary" className={cn(
      "capitalize text-xs font-semibold",
      s === "SUCCESS" ? "text-green-600 bg-green-500/10 dark:text-green-400" :
      s === "FAILED"  ? "text-red-600 bg-red-500/10 dark:text-red-400" :
                        "text-amber-600 bg-amber-500/10 dark:text-amber-400"
    )}>
      {s === "SUCCESS" ? "Paid" : s === "FAILED" ? "Failed" : "Pending"}
    </Badge>
  )
}

function FulfillmentStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase()
  return (
    <Badge variant="secondary" className={cn(
      "capitalize text-xs font-semibold text-center leading-tight whitespace-nowrap",
      (s === "SUCCESS" || s === "DELIVERED") ? "text-green-600 bg-green-500/10 dark:text-green-400" :
      s === "FAILED"    ? "text-red-600 bg-red-500/10 dark:text-red-400" :
      s === "PROCESSING"? "text-blue-600 bg-blue-500/10 dark:text-blue-400" :
      s === "ON_HOLD"   ? "text-purple-600 bg-purple-500/10 dark:text-purple-400" :
      s === "REFUNDED"  ? "text-slate-600 bg-slate-500/10 dark:text-slate-400" :
                          "text-amber-600 bg-amber-500/10 dark:text-amber-400"
    )}>
      {s === "SUCCESS" || s === "DELIVERED" ? "Delivered" :
       s === "FAILED"    ? "Delivery failed" :
       s === "PROCESSING"? "Processing" :
       s === "ON_HOLD"   ? "Verification in progress" :
       s === "REFUNDED"  ? "Refunded" : "Pending"}
    </Badge>
  )
}

export function TrackLookup() {
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<PublicOrder[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<PublicOrder | null>(null)
  const [searchedPhone, setSearchedPhone] = useState("")

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow +, digits, spaces and dashes
    setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length < 9) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setSelectedOrder(null)

    try {
      const res = await fetch(`/api/track?phone=${encodeURIComponent(phone)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data?.error ?? "Unable to retrieve orders right now.")
        return
      }

      setSearchedPhone(phone)
      setResults(data.orders ?? [])
    } catch {
      setError("Unable to retrieve orders right now. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetSearch = () => {
    setResults(null)
    setError(null)
    setPhone("")
    setSelectedOrder(null)
    setSearchedPhone("")
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <AnimatePresence mode="wait">
        {results === null ? (
          <motion.div
            key="search-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-3">Track your order</h1>
              <p className="text-muted-foreground">
                Enter the phone number you used to purchase your data bundle.
              </p>
            </div>

            <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="flex flex-col gap-4">
                  <div className="relative">
                    <PhoneIcon className="absolute left-3.5 top-3.5 size-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="e.g. 0241234567 or +233241234567"
                      className="pl-11 h-12 text-lg"
                      value={phone}
                      onChange={handlePhoneChange}
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2"
                    >
                      <AlertCircleIcon className="size-4 shrink-0" />
                      {error}
                    </motion.p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 text-base"
                    disabled={phone.replace(/\D/g, "").length < 9 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2Icon className="mr-2 size-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="mr-2 size-5" />
                        Find my orders
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  Orders for {searchedPhone}
                </h1>
                <p className="text-muted-foreground">
                  {results.length === 0
                    ? "No orders found for this number."
                    : `${results.length} order${results.length !== 1 ? "s" : ""} found`}
                </p>
              </div>
              <Button variant="outline" onClick={resetSearch}>
                New Search
              </Button>
            </div>

            {results.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <PackageSearchIcon className="size-16 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No orders found for this number.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Make sure you entered the exact number used during purchase.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {results.map((order, i) => {
                  const color = NETWORK_COLORS[order.network] ?? "#888"
                  const netName = NETWORK_NAMES[order.network] ?? order.network

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer"
                    >
                      <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md group">
                        <CardContent className="p-0">
                          <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-6 relative">
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                              <ArrowRightIcon className="size-5 text-primary" />
                            </div>

                            {/* Left: Network & Reference */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-muted-foreground font-mono">{order.orderReference}</span>
                                <span className="text-muted-foreground/50 text-xs">•</span>
                                <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: color }} />
                                <div>
                                  <div className="font-bold text-lg">{order.bundleSize}</div>
                                  <div className="text-sm text-muted-foreground">{netName} Data</div>
                                </div>
                              </div>
                            </div>

                            {/* Middle: Amount */}
                            <div className="md:w-32 md:text-right">
                              <div className="text-xs text-muted-foreground mb-1">Amount paid</div>
                              <div className="font-bold">GHS {order.amount.toFixed(2)}</div>
                            </div>

                            {/* Right: Status badges */}
                            <div className="flex flex-row md:flex-col gap-2 md:w-32 md:items-end">
                              <PaymentStatusBadge status={order.paymentStatus} />
                              <FulfillmentStatusBadge status={order.fulfillmentStatus} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Details Side Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%", scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-[450px] bg-card border-l shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b">
                <h2 className="text-xl font-bold">Order Details</h2>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedOrder(null)}>
                  <XIcon className="size-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Status Header */}
                <div className="flex items-center gap-4">
                  {(selectedOrder.fulfillmentStatus === "SUCCESS" || selectedOrder.fulfillmentStatus === "DELIVERED") ? (
                    <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2Icon className="size-8 text-green-600 dark:text-green-400" />
                    </div>
                  ) : selectedOrder.fulfillmentStatus === "FAILED" ? (
                    <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                      <AlertCircleIcon className="size-8 text-red-600 dark:text-red-400" />
                    </div>
                  ) : selectedOrder.fulfillmentStatus === "ON_HOLD" ? (
                    <div className="size-16 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <ClockIcon className="size-8 text-purple-600 dark:text-purple-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <ClockIcon className="size-8 text-amber-600 dark:text-amber-400 animate-pulse" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold capitalize">
                      {(selectedOrder.fulfillmentStatus === "SUCCESS" || selectedOrder.fulfillmentStatus === "DELIVERED") ? "Delivered" :
                       selectedOrder.fulfillmentStatus === "PROCESSING" ? "Processing" :
                       selectedOrder.fulfillmentStatus === "ON_HOLD" ? "Verification in progress" :
                       selectedOrder.fulfillmentStatus === "FAILED" ? "Delivery failed" : "Pending"}
                    </h3>
                    <p className="text-muted-foreground text-sm">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-muted/30 border rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground text-sm">Order Ref</span>
                    <span className="font-mono text-sm">{selectedOrder.orderReference}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground text-sm">Recipient</span>
                    <span className="font-medium">{selectedOrder.recipientPhoneMasked}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground text-sm">Network</span>
                    <span className="font-medium flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: NETWORK_COLORS[selectedOrder.network] ?? "#888" }}
                      />
                      {NETWORK_NAMES[selectedOrder.network] ?? selectedOrder.network}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground text-sm">Bundle</span>
                    <span className="font-medium">{selectedOrder.bundleSize}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground text-sm">Payment</span>
                    <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Total Paid</span>
                    <span className="font-bold">GHS {selectedOrder.amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Timeline</h4>
                  <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-2.5 before:w-px before:bg-border">
                    <div className="relative">
                      <div className="absolute -left-6 top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
                      <p className="font-medium text-sm">Order Created</p>
                      <p className="text-xs text-muted-foreground mt-1">Payment initiated via Paystack</p>
                    </div>
                    <div className="relative">
                      <div className={cn(
                        "absolute -left-6 top-1 size-3 rounded-full ring-4 ring-background",
                        selectedOrder.paymentStatus === "SUCCESS" ? "bg-primary" : "bg-muted"
                      )} />
                      <p className="font-medium text-sm">Payment Confirmed</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedOrder.paymentStatus === "SUCCESS"
                          ? `GHS ${selectedOrder.amount.toFixed(2)} received`
                          : selectedOrder.paymentStatus === "FAILED"
                          ? "Payment was not completed"
                          : "Awaiting payment confirmation"}
                      </p>
                    </div>
                    <div className="relative">
                      <div className={cn(
                        "absolute -left-6 top-1 size-3 rounded-full ring-4 ring-background",
                        (selectedOrder.fulfillmentStatus === "SUCCESS" || selectedOrder.fulfillmentStatus === "DELIVERED") ? "bg-green-500" :
                        selectedOrder.fulfillmentStatus === "FAILED"    ? "bg-red-500" :
                        selectedOrder.fulfillmentStatus === "ON_HOLD"   ? "bg-purple-500" :
                        selectedOrder.fulfillmentStatus === "PROCESSING" ? "bg-blue-500" : "bg-muted"
                      )} />
                      <p className="font-medium text-sm">Data Delivery</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedOrder.fulfillmentStatus === "SUCCESS" || selectedOrder.fulfillmentStatus === "DELIVERED") ? "Bundle successfully credited to recipient" :
                         selectedOrder.fulfillmentStatus === "FAILED"    ? "Network rejected the top-up request" :
                         selectedOrder.fulfillmentStatus === "ON_HOLD"   ? "Delivery is temporarily on hold while the network verifies the recipient. You don't need to reorder or pay again." :
                         selectedOrder.fulfillmentStatus === "PROCESSING"? "Bundle is being sent to recipient" :
                         "Awaiting confirmation from network"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Delivery Tracker Component integration */}
                {(selectedOrder.fulfillmentStatus === "PROCESSING" || selectedOrder.fulfillmentStatus === "ON_HOLD") && (
                  <LiveDeliveryTracker publicReference={selectedOrder.orderReference} />
                )}
              </div>

              <div className="p-6 border-t bg-muted/10">
                <Button className="w-full" variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function LiveDeliveryTracker({ publicReference }: { publicReference: string }) {
  const [data, setData] = useState<any>(null)
  
  useEffect(() => {
    let active = true
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/track/delivery?reference=${encodeURIComponent(publicReference)}`)
        const json = await res.json()
        if (active) setData(json)
      } catch (e) {}
    }
    fetchStatus()
    const int = setInterval(fetchStatus, 5000)
    return () => {
      active = false
      clearInterval(int)
    }
  }, [publicReference])

  return (
    <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl space-y-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </div>
      <h4 className="font-semibold text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
        <PackageSearchIcon className="size-4" />
        Live Delivery Network
      </h4>
      <div className="text-xs text-muted-foreground">
        Scanner: <span className="font-medium text-foreground">Active</span><br/>
        {data ? (
          <>
            {data.status === "error" || data.status === "unavailable" ? (
              <span className="text-amber-500">{data.message || "Connecting to telecom provider..."}</span>
            ) : (
              <>
                Status: <span className="font-medium text-foreground capitalize">{data.status || "Checking..."}</span><br/>
                {data.message && <span className="text-blue-500/80">{data.message}</span>}
              </>
            )}
          </>
        ) : (
          <span>Connecting to telecom provider...</span>
        )}
      </div>
    </div>
  )
}

