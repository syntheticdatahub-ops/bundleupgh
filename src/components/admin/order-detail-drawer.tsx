"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  ClockIcon,
  Loader2Icon,
  CopyIcon,
  ChevronRightIcon,
  PackageIcon,
  CreditCardIcon,
  UserIcon,
  ServerIcon,
} from "lucide-react"
import type { Order, Network } from "@/types/domain"

// ─── Status helpers ────────────────────────────────────────────────────────────

const FULFILLMENT_LABELS: Record<string, string> = {
  PROCESSING: "Processing",
  ON_HOLD: "On Hold",
  SUCCESS: "Delivered",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PENDING: "Pending",
  REFUND_PENDING: "Refund Pending",
}

const FULFILLMENT_COLORS: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
  PROCESSING: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
  ON_HOLD: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
  REFUND_PENDING: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
  REFUNDED: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
}

const PAYMENT_LABELS: Record<string, string> = {
  SUCCESS: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  NOT_APPLICABLE: "N/A (Manual)",
}

const PAYMENT_COLORS: Record<string, string> = {
  SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
  PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
  REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
  NOT_APPLICABLE: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
}

// Status transitions that deserve extra warning in the confirmation dialog
const SENSITIVE_TRANSITIONS = new Set([
  "SUCCESS→FAILED",
  "SUCCESS→REFUNDED",
  "REFUNDED→SUCCESS",
])

// ─── Small helper components ───────────────────────────────────────────────────

function DetailRow({ label, value, mono = false, copyable = false }: {
  label: string
  value?: string | number | null
  mono?: boolean
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)
  if (value == null || value === "") return null

  const str = String(value)

  const handleCopy = () => {
    navigator.clipboard.writeText(str).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 pt-0.5 min-w-[130px]">{label}</span>
      <div className="flex items-start gap-1.5 min-w-0 text-right">
        <span className={cn("text-xs break-all", mono && "font-mono")}>{str}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            title="Copy"
          >
            {copied
              ? <CheckCircle2Icon className="size-3 text-green-500" />
              : <CopyIcon className="size-3" />
            }
          </button>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, label }: { icon: React.FC<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-5 first:mt-0">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

function FulfillmentBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={cn("text-[10px] font-bold tracking-wider", FULFILLMENT_COLORS[status] || "")}>
      {FULFILLMENT_LABELS[status] || status}
    </Badge>
  )
}

// ─── Status Update section ─────────────────────────────────────────────────────

const SELECTABLE_STATUSES: { value: string; label: string }[] = [
  { value: "PROCESSING", label: "Processing" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "SUCCESS", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
]

function StatusUpdateSection({
  order,
  onUpdated,
}: {
  order: Order
  onUpdated: (updated: Order) => void
}) {
  const [selected, setSelected] = useState(order.fulfillmentStatus)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Keep selected in sync if parent order updates
  useEffect(() => {
    setSelected(order.fulfillmentStatus)
  }, [order.fulfillmentStatus])

  const isSensitive = SENSITIVE_TRANSITIONS.has(`${order.fulfillmentStatus}→${selected}`)
  const hasChanged = selected !== order.fulfillmentStatus

  const handleSave = async () => {
    setSaving(true)
    setConfirmOpen(false)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selected, note }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Update failed")
      setToast({ type: "success", message: "Order status updated" })
      setNote("")
      onUpdated(data.order)
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Unable to update order status. Please try again." })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3500)
    }
  }

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-muted/20">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manual Status Override</span>

      <div className="flex items-center gap-2">
        <Select value={selected} onValueChange={(v) => setSelected(v as Order["fulfillmentStatus"])}>
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SELECTABLE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-xs">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          disabled={!hasChanged || saving}
          onClick={() => setConfirmOpen(true)}
          className="h-8 text-xs px-3"
        >
          {saving ? <><Loader2Icon className="size-3 animate-spin mr-1" />Saving…</> : "Save"}
        </Button>
      </div>

      <Textarea
        placeholder="Optional note (e.g. customer confirmed delivery)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="text-xs h-16 resize-none"
      />

      {toast && (
        <div className={cn(
          "text-xs px-3 py-2 rounded-lg flex items-center gap-2",
          toast.type === "success"
            ? "bg-green-500/10 text-green-600 dark:text-green-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        )}>
          {toast.type === "success"
            ? <CheckCircle2Icon className="size-3 shrink-0" />
            : <AlertCircleIcon className="size-3 shrink-0" />
          }
          {toast.message}
        </div>
      )}

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {isSensitive ? "⚠️ Sensitive status change" : "Change order status?"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-1">
              <span className="font-semibold text-foreground">
                {FULFILLMENT_LABELS[order.fulfillmentStatus] || order.fulfillmentStatus}
              </span>
              {" → "}
              <span className="font-semibold text-foreground">
                {FULFILLMENT_LABELS[selected] || selected}
              </span>
              {isSensitive && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  This transition is potentially irreversible. Double-check before confirming.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 leading-relaxed">
            This only changes the BundleUp order status. It will not create a DataMart purchase, 
            trigger a refund, or modify the customer&apos;s payment.
          </p>
          {note && (
            <p className="text-xs text-muted-foreground">Note: <span className="text-foreground">{note}</span></p>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className={cn("flex-1", isSensitive && "bg-amber-600 hover:bg-amber-700")}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Main drawer ───────────────────────────────────────────────────────────────

interface Props {
  order: Order | null
  networks: Network[]
  open: boolean
  onClose: () => void
  onOrderUpdated: (updated: Order) => void
}

function formatDate(iso?: string) {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  } catch { return iso }
}

export function OrderDetailDrawer({ order, networks, open, onClose, onOrderUpdated }: Props) {
  const net = order ? networks.find((n) => n.id === order.networkId) : null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="sm:max-w-lg w-full flex flex-col overflow-hidden p-0">
        {!order ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            {/* Sticky header */}
            <SheetHeader className="border-b px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <SheetTitle className="font-mono text-base">{order.publicReference}</SheetTitle>
                <FulfillmentBadge status={order.fulfillmentStatus} />
                {order.source === "MANUAL" && (
                  <Badge variant="outline" className="text-[9px] uppercase h-5 px-1 bg-slate-100 text-slate-500">Manual</Badge>
                )}
              </div>
              <SheetDescription>
                Created {formatDate(order.createdAt)}
              </SheetDescription>
            </SheetHeader>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">

              {/* Status update control */}
              <StatusUpdateSection order={order} onUpdated={onOrderUpdated} />

              {/* Order timestamps */}
              <SectionHeader icon={ClockIcon} label="Order" />
              <div className="border rounded-xl px-4 py-1">
                <DetailRow label="Order ID" value={order.id} mono copyable />
                <DetailRow label="Public Ref" value={order.publicReference} mono copyable />
                <DetailRow label="Created" value={formatDate(order.createdAt)} />
                <DetailRow label="Last Updated" value={formatDate(order.updatedAt)} />
                <DetailRow label="Source" value={order.source || "WEB"} />
              </div>

              {/* Customer */}
              <SectionHeader icon={UserIcon} label="Customer" />
              <div className="border rounded-xl px-4 py-1">
                <DetailRow label="Recipient Phone" value={order.recipientPhone} mono copyable />
                <DetailRow label="Customer ID" value={order.customerId} mono copyable />
              </div>

              {/* Bundle */}
              <SectionHeader icon={PackageIcon} label="Bundle" />
              <div className="border rounded-xl px-4 py-1">
                <DetailRow label="Network" value={net?.name || order.networkId} />
                <DetailRow label="Bundle" value={order.bundleNameSnapshot} />
                <DetailRow label="Data Size" value={order.dataSizeSnapshot} />
              </div>

              {/* Payment */}
              <SectionHeader icon={CreditCardIcon} label="Payment" />
              <div className="border rounded-xl px-4 py-1">
                <div className="flex items-start justify-between gap-4 py-2 border-b">
                  <span className="text-xs text-muted-foreground min-w-[130px]">Payment Status</span>
                  <Badge variant="secondary" className={cn("text-[10px] font-bold tracking-wider", PAYMENT_COLORS[order.paymentStatus] || "")}>
                    {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                  </Badge>
                </div>
                <DetailRow label="Payment Reference" value={order.paymentReference} mono copyable />
                <DetailRow label="Selling Price" value={order.sellingPriceSnapshot != null ? `GHS ${order.sellingPriceSnapshot.toFixed(2)}` : null} />
                <DetailRow label="Provider Cost" value={order.providerCostSnapshot != null ? `GHS ${order.providerCostSnapshot.toFixed(2)}` : null} />
                <DetailRow label="Profit" value={order.profitSnapshot != null ? `GHS ${order.profitSnapshot.toFixed(2)}` : null} />
              </div>

              {/* DataMart / Fulfillment */}
              <SectionHeader icon={ServerIcon} label="DataMart / Fulfillment" />
              <div className="border rounded-xl px-4 py-1">
                <div className="flex items-start justify-between gap-4 py-2 border-b">
                  <span className="text-xs text-muted-foreground min-w-[130px]">BundleUp Status</span>
                  <FulfillmentBadge status={order.fulfillmentStatus} />
                </div>
                <DetailRow label="Provider Status" value={order.providerStatus} mono />
                <DetailRow label="Provider Event" value={order.providerEvent} mono />
                <DetailRow label="Provider Ref" value={order.fulfillmentProviderReference || order.providerReference} mono copyable />
                <DetailRow label="Transaction ID" value={order.fulfillmentProviderTransactionId} mono copyable />
                <DetailRow label="Last Event" value={order.lastProviderEventAt ? formatDate(order.lastProviderEventAt) : null} />
                <DetailRow label="Provider Error" value={order.providerError} />
              </div>

            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
