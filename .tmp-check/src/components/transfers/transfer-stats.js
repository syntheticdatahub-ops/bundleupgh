import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowUpRightIcon, ArrowDownLeftIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
const fmt = (n) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
}).format(n);
export function TransferStats({ transfers }) {
    const totalSent = transfers
        .filter((t) => t.type === "sent" && t.status === "completed")
        .reduce((s, t) => s + t.amount, 0);
    const totalReceived = transfers
        .filter((t) => t.type === "received")
        .reduce((s, t) => s + t.amount, 0);
    const scheduled = transfers.filter((t) => t.type === "scheduled");
    const scheduledTotal = scheduled.reduce((s, t) => s + t.amount, 0);
    const cards = [
        {
            label: "Total Sent",
            value: fmt(totalSent),
            icon: ArrowUpRightIcon,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
        },
        {
            label: "Total Received",
            value: fmt(totalReceived),
            icon: ArrowDownLeftIcon,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            label: "Scheduled",
            value: `${scheduled.length} (${fmt(scheduledTotal)})`,
            icon: ClockIcon,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
        },
    ];
    return (_jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: cards.map((card) => (_jsxs("div", { className: "flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10", children: [_jsx("div", { className: cn("flex size-9 shrink-0 items-center justify-center rounded-full", card.bg), children: _jsx(card.icon, { className: cn("size-4", card.color) }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: card.label }), _jsx("p", { className: "tabular-nums text-base font-semibold tracking-tight", children: card.value })] })] }, card.label))) }));
}
