"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { XIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
const fmt = (n) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
}).format(n);
function statusBadge(status) {
    switch (status) {
        case "completed":
            return _jsx(Badge, { variant: "default", children: "Completed" });
        case "pending":
            return (_jsx(Badge, { variant: "outline", className: "text-amber-500 dark:text-amber-400", children: "Pending" }));
        case "scheduled":
            return (_jsx(Badge, { variant: "outline", className: "text-amber-500 dark:text-amber-400", children: "Scheduled" }));
    }
}
export function TransferList({ transfers, onCancel }) {
    return (_jsx("div", { className: "overflow-hidden rounded-xl ring-1 ring-foreground/10", children: _jsx("div", { className: "divide-y", children: _jsxs(AnimatePresence, { mode: "popLayout", initial: false, children: [transfers.length === 0 && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx(EmptyState, { variant: "filter", className: "py-10" }) }, "empty")), transfers.map((transfer, i) => (_jsxs(motion.div, { layout: true, initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, scale: 0.95 }, transition: {
                            duration: 0.2,
                            delay: i * 0.03,
                            layout: { duration: 0.2 },
                        }, className: "group flex items-center gap-3 px-4 py-3", children: [_jsx(Image, { src: transfer.contactAvatar, alt: transfer.contactName, width: 40, height: 40, className: "size-10 shrink-0 rounded-full object-cover", unoptimized: true }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate text-sm font-medium", children: transfer.contactName }), transfer.note && (_jsx("p", { className: "truncate text-xs italic text-muted-foreground", children: transfer.note }))] }), _jsxs("div", { className: "shrink-0 text-right", children: [_jsxs("p", { className: cn("tabular-nums text-sm font-semibold", transfer.type === "sent" && "text-rose-500", transfer.type === "received" && "text-emerald-500", transfer.type === "scheduled" && "text-amber-500"), children: [transfer.type === "sent" && "-", transfer.type === "received" && "+", fmt(transfer.amount)] }), _jsx("p", { className: "text-xs text-muted-foreground", children: transfer.date })] }), _jsx("div", { className: "hidden shrink-0 sm:block", children: statusBadge(transfer.status) }), _jsx("div", { className: "w-16 shrink-0 text-right", children: transfer.status === "scheduled" ? (_jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 gap-1 text-xs opacity-0 transition-opacity group-hover:opacity-100", onClick: () => onCancel(transfer.id), children: [_jsx(XIcon, { className: "size-3" }), "Cancel"] })) : null })] }, transfer.id)))] }) }) }));
}
