"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, AlertCircleIcon, ClockIcon, Loader2Icon, CopyIcon, PackageIcon, CreditCardIcon, UserIcon, ServerIcon, } from "lucide-react";
// ─── Status helpers ────────────────────────────────────────────────────────────
const FULFILLMENT_LABELS = {
    PROCESSING: "Processing",
    ON_HOLD: "On Hold",
    SUCCESS: "Delivered",
    FAILED: "Failed",
    REFUNDED: "Refunded",
    PENDING: "Pending",
    REFUND_PENDING: "Refund Pending",
};
const FULFILLMENT_COLORS = {
    SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
    PROCESSING: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
    ON_HOLD: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
    REFUND_PENDING: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
    REFUNDED: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
};
const PAYMENT_LABELS = {
    SUCCESS: "Paid",
    PENDING: "Pending",
    FAILED: "Failed",
    REFUNDED: "Refunded",
    NOT_APPLICABLE: "N/A (Manual)",
};
const PAYMENT_COLORS = {
    SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
    PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
    REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
    NOT_APPLICABLE: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
};
// Status transitions that deserve extra warning in the confirmation dialog
const SENSITIVE_TRANSITIONS = new Set([
    "SUCCESS→FAILED",
    "SUCCESS→REFUNDED",
    "REFUNDED→SUCCESS",
]);
// ─── Small helper components ───────────────────────────────────────────────────
function DetailRow({ label, value, mono = false, copyable = false }) {
    const [copied, setCopied] = useState(false);
    if (value == null || value === "")
        return null;
    const str = String(value);
    const handleCopy = () => {
        navigator.clipboard.writeText(str).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };
    return (_jsxs("div", { className: "flex items-start justify-between gap-4 py-2 border-b last:border-0", children: [_jsx("span", { className: "text-xs text-muted-foreground shrink-0 pt-0.5 min-w-[130px]", children: label }), _jsxs("div", { className: "flex items-start gap-1.5 min-w-0 text-right", children: [_jsx("span", { className: cn("text-xs break-all", mono && "font-mono"), children: str }), copyable && (_jsx("button", { onClick: handleCopy, className: "shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5", title: "Copy", children: copied
                            ? _jsx(CheckCircle2Icon, { className: "size-3 text-green-500" })
                            : _jsx(CopyIcon, { className: "size-3" }) }))] })] }));
}
function SectionHeader({ icon: Icon, label }) {
    return (_jsxs("div", { className: "flex items-center gap-2 mb-2 mt-5 first:mt-0", children: [_jsx(Icon, { className: "size-3.5 text-muted-foreground" }), _jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: label })] }));
}
function FulfillmentBadge({ status }) {
    return (_jsx(Badge, { variant: "secondary", className: cn("text-[10px] font-bold tracking-wider", FULFILLMENT_COLORS[status] || ""), children: FULFILLMENT_LABELS[status] || status }));
}
// ─── Status Update section ─────────────────────────────────────────────────────
const SELECTABLE_STATUSES = [
    { value: "PROCESSING", label: "Processing" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "SUCCESS", label: "Delivered" },
    { value: "FAILED", label: "Failed" },
    { value: "REFUNDED", label: "Refunded" },
];
function StatusUpdateSection({ order, onUpdated, }) {
    const [selected, setSelected] = useState(order.fulfillmentStatus);
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    // Keep selected in sync if parent order updates
    useEffect(() => {
        setSelected(order.fulfillmentStatus);
    }, [order.fulfillmentStatus]);
    const isSensitive = SENSITIVE_TRANSITIONS.has(`${order.fulfillmentStatus}→${selected}`);
    const hasChanged = selected !== order.fulfillmentStatus;
    const handleSave = async () => {
        setSaving(true);
        setConfirmOpen(false);
        try {
            const res = await fetch(`/api/admin/orders/${order.id}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: selected, note }),
            });
            const data = await res.json();
            if (!res.ok || !data.success)
                throw new Error(data.error || "Update failed");
            setToast({ type: "success", message: "Order status updated" });
            setNote("");
            onUpdated(data.order);
        }
        catch (err) {
            setToast({ type: "error", message: err.message || "Unable to update order status. Please try again." });
        }
        finally {
            setSaving(false);
            setTimeout(() => setToast(null), 3500);
        }
    };
    return (_jsxs("div", { className: "border rounded-xl p-4 space-y-3 bg-muted/20", children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Manual Status Override" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: selected, onValueChange: (v) => setSelected(v), children: [_jsx(SelectTrigger, { className: "h-8 text-xs flex-1", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: SELECTABLE_STATUSES.map((s) => (_jsx(SelectItem, { value: s.value, className: "text-xs", children: s.label }, s.value))) })] }), _jsx(Button, { size: "sm", disabled: !hasChanged || saving, onClick: () => setConfirmOpen(true), className: "h-8 text-xs px-3", children: saving ? _jsxs(_Fragment, { children: [_jsx(Loader2Icon, { className: "size-3 animate-spin mr-1" }), "Saving\u2026"] }) : "Save" })] }), _jsx(Textarea, { placeholder: "Optional note (e.g. customer confirmed delivery)", value: note, onChange: (e) => setNote(e.target.value), className: "text-xs h-16 resize-none" }), toast && (_jsxs("div", { className: cn("text-xs px-3 py-2 rounded-lg flex items-center gap-2", toast.type === "success"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"), children: [toast.type === "success"
                        ? _jsx(CheckCircle2Icon, { className: "size-3 shrink-0" })
                        : _jsx(AlertCircleIcon, { className: "size-3 shrink-0" }), toast.message] })), _jsx(Dialog, { open: confirmOpen, onOpenChange: setConfirmOpen, children: _jsxs(DialogContent, { className: "sm:max-w-sm", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-base", children: isSensitive ? "⚠️ Sensitive status change" : "Change order status?" }), _jsxs(DialogDescription, { className: "text-sm leading-relaxed pt-1", children: [_jsx("span", { className: "font-semibold text-foreground", children: FULFILLMENT_LABELS[order.fulfillmentStatus] || order.fulfillmentStatus }), " → ", _jsx("span", { className: "font-semibold text-foreground", children: FULFILLMENT_LABELS[selected] || selected }), isSensitive && (_jsx("span", { className: "block mt-2 text-amber-600 dark:text-amber-400", children: "This transition is potentially irreversible. Double-check before confirming." }))] })] }), _jsx("p", { className: "text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 leading-relaxed", children: "This only changes the BundleUp order status. It will not create a DataMart purchase, trigger a refund, or modify the customer's payment." }), note && (_jsxs("p", { className: "text-xs text-muted-foreground", children: ["Note: ", _jsx("span", { className: "text-foreground", children: note })] })), _jsxs(DialogFooter, { className: "gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setConfirmOpen(false), className: "flex-1", children: "Cancel" }), _jsx(Button, { onClick: handleSave, className: cn("flex-1", isSensitive && "bg-amber-600 hover:bg-amber-700"), children: "Confirm" })] })] }) })] }));
}
function formatDate(iso) {
    if (!iso)
        return "—";
    try {
        return new Date(iso).toLocaleString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    }
    catch (_a) {
        return iso;
    }
}
export function OrderDetailDrawer({ order, networks, open, onClose, onOrderUpdated }) {
    const net = order ? networks.find((n) => n.id === order.networkId) : null;
    return (_jsx(Sheet, { open: open, onOpenChange: (v) => !v && onClose(), children: _jsx(SheetContent, { side: "right", className: "sm:max-w-lg w-full flex flex-col overflow-hidden p-0", children: !order ? (_jsxs("div", { className: "p-6 space-y-4", children: [_jsx(Skeleton, { className: "h-6 w-40" }), _jsx(Skeleton, { className: "h-4 w-32" }), _jsx(Skeleton, { className: "h-48 w-full" })] })) : (_jsxs(_Fragment, { children: [_jsxs(SheetHeader, { className: "border-b px-6 py-4 shrink-0", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(SheetTitle, { className: "font-mono text-base", children: order.publicReference }), _jsx(FulfillmentBadge, { status: order.fulfillmentStatus }), order.source === "MANUAL" && (_jsx(Badge, { variant: "outline", className: "text-[9px] uppercase h-5 px-1 bg-slate-100 text-slate-500", children: "Manual" }))] }), _jsxs(SheetDescription, { children: ["Created ", formatDate(order.createdAt)] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto px-6 py-4 space-y-1", children: [_jsx(StatusUpdateSection, { order: order, onUpdated: onOrderUpdated }), _jsx(SectionHeader, { icon: ClockIcon, label: "Order" }), _jsxs("div", { className: "border rounded-xl px-4 py-1", children: [_jsx(DetailRow, { label: "Order ID", value: order.id, mono: true, copyable: true }), _jsx(DetailRow, { label: "Public Ref", value: order.publicReference, mono: true, copyable: true }), _jsx(DetailRow, { label: "Created", value: formatDate(order.createdAt) }), _jsx(DetailRow, { label: "Last Updated", value: formatDate(order.updatedAt) }), _jsx(DetailRow, { label: "Source", value: order.source || "WEB" })] }), _jsx(SectionHeader, { icon: UserIcon, label: "Customer" }), _jsxs("div", { className: "border rounded-xl px-4 py-1", children: [_jsx(DetailRow, { label: "Recipient Phone", value: order.recipientPhone, mono: true, copyable: true }), _jsx(DetailRow, { label: "Customer ID", value: order.customerId, mono: true, copyable: true })] }), _jsx(SectionHeader, { icon: PackageIcon, label: "Bundle" }), _jsxs("div", { className: "border rounded-xl px-4 py-1", children: [_jsx(DetailRow, { label: "Network", value: (net === null || net === void 0 ? void 0 : net.name) || order.networkId }), _jsx(DetailRow, { label: "Bundle", value: order.bundleNameSnapshot }), _jsx(DetailRow, { label: "Data Size", value: order.dataSizeSnapshot })] }), _jsx(SectionHeader, { icon: CreditCardIcon, label: "Payment" }), _jsxs("div", { className: "border rounded-xl px-4 py-1", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 py-2 border-b", children: [_jsx("span", { className: "text-xs text-muted-foreground min-w-[130px]", children: "Payment Status" }), _jsx(Badge, { variant: "secondary", className: cn("text-[10px] font-bold tracking-wider", PAYMENT_COLORS[order.paymentStatus] || ""), children: PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus })] }), _jsx(DetailRow, { label: "Payment Reference", value: order.paymentReference, mono: true, copyable: true }), _jsx(DetailRow, { label: "Selling Price", value: order.sellingPriceSnapshot != null ? `GHS ${order.sellingPriceSnapshot.toFixed(2)}` : null }), _jsx(DetailRow, { label: "Provider Cost", value: order.providerCostSnapshot != null ? `GHS ${order.providerCostSnapshot.toFixed(2)}` : null }), _jsx(DetailRow, { label: "Profit", value: order.profitSnapshot != null ? `GHS ${order.profitSnapshot.toFixed(2)}` : null })] }), _jsx(SectionHeader, { icon: ServerIcon, label: "DataMart / Fulfillment" }), _jsxs("div", { className: "border rounded-xl px-4 py-1", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 py-2 border-b", children: [_jsx("span", { className: "text-xs text-muted-foreground min-w-[130px]", children: "BundleUp Status" }), _jsx(FulfillmentBadge, { status: order.fulfillmentStatus })] }), _jsx(DetailRow, { label: "Provider Status", value: order.providerStatus, mono: true }), _jsx(DetailRow, { label: "Provider Event", value: order.providerEvent, mono: true }), _jsx(DetailRow, { label: "Provider Ref", value: order.fulfillmentProviderReference || order.providerReference, mono: true, copyable: true }), _jsx(DetailRow, { label: "Transaction ID", value: order.fulfillmentProviderTransactionId, mono: true, copyable: true }), _jsx(DetailRow, { label: "Last Event", value: order.lastProviderEventAt ? formatDate(order.lastProviderEventAt) : null }), _jsx(DetailRow, { label: "Provider Error", value: order.providerError })] })] })] })) }) }));
}
