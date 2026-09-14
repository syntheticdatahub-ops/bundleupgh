"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { notifications as seedNotifications } from "@/data/seed";
import { EmptyState } from "@/components/empty-state";
import { ArrowDownLeftIcon, ShieldAlertIcon, CreditCardIcon, AlertTriangleIcon, SparklesIcon, CheckCircleIcon, LockIcon, RepeatIcon, ClockIcon, TrendingUpIcon, FileTextIcon, ShieldCheckIcon, XIcon, BellIcon, CheckCheckIcon, HandCoinsIcon, SplitIcon, } from "lucide-react";
const iconMap = {
    "arrow-down-left": _jsx(ArrowDownLeftIcon, { className: "size-4" }),
    "shield-alert": _jsx(ShieldAlertIcon, { className: "size-4" }),
    "credit-card": _jsx(CreditCardIcon, { className: "size-4" }),
    "alert-triangle": _jsx(AlertTriangleIcon, { className: "size-4" }),
    sparkles: _jsx(SparklesIcon, { className: "size-4" }),
    "check-circle": _jsx(CheckCircleIcon, { className: "size-4" }),
    lock: _jsx(LockIcon, { className: "size-4" }),
    repeat: _jsx(RepeatIcon, { className: "size-4" }),
    clock: _jsx(ClockIcon, { className: "size-4" }),
    "trending-up": _jsx(TrendingUpIcon, { className: "size-4" }),
    "file-text": _jsx(FileTextIcon, { className: "size-4" }),
    "shield-check": _jsx(ShieldCheckIcon, { className: "size-4" }),
    "hand-coins": _jsx(HandCoinsIcon, { className: "size-4" }),
    split: _jsx(SplitIcon, { className: "size-4" }),
};
const typeColors = {
    transaction: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    security: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    system: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    promotion: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    request: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};
const filters = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Transactions", value: "transaction" },
    { label: "Security", value: "security" },
    { label: "System", value: "system" },
];
export function NotificationsPageClient() {
    const [items, setItems] = React.useState(seedNotifications);
    const [filter, setFilter] = React.useState("all");
    const unreadCount = items.filter((n) => !n.read).length;
    const filtered = items.filter((n) => {
        if (filter === "all")
            return true;
        if (filter === "unread")
            return !n.read;
        return n.type === filter;
    });
    function markAllRead() {
        setItems((prev) => prev.map((n) => (Object.assign(Object.assign({}, n), { read: true }))));
    }
    function toggleRead(id) {
        setItems((prev) => prev.map((n) => (n.id === id ? Object.assign(Object.assign({}, n), { read: true }) : n)));
    }
    function dismiss(id) {
        setItems((prev) => prev.filter((n) => n.id !== id));
    }
    return (_jsxs("div", { className: "mx-auto w-full max-w-3xl space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Notifications" }), unreadCount > 0 && (_jsxs(Badge, { variant: "default", className: "tabular-nums", children: [unreadCount, " unread"] }))] }), unreadCount > 0 && (_jsxs(Button, { variant: "outline", size: "sm", onClick: markAllRead, children: [_jsx(CheckCheckIcon, { className: "size-4" }), "Mark all as read"] }))] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: filters.map((f) => (_jsx(Button, { variant: filter === f.value ? "secondary" : "ghost", size: "sm", onClick: () => setFilter(f.value), children: f.label }, f.value))) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: _jsx(AnimatePresence, { mode: "popLayout", initial: false, children: filtered.length === 0 ? (_jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, children: _jsx(EmptyState, { variant: filter === "all" || filter === "unread" ? "notifications" : "filter", className: "py-12" }) }, "empty")) : (filtered.map((n) => {
                            var _a;
                            return (_jsx(motion.div, { layout: true, initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.2 }, children: _jsxs("div", { className: cn("group relative flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/50", !n.read && "bg-primary/[0.03]"), onClick: () => toggleRead(n.id), children: [!n.read && (_jsx("span", { className: "absolute left-1.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-emerald-500" })), _jsx("div", { className: cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", typeColors[n.type]), children: (_a = iconMap[n.icon]) !== null && _a !== void 0 ? _a : _jsx(BellIcon, { className: "size-4" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: cn("text-sm", !n.read ? "font-semibold" : "font-medium"), children: n.title }), _jsx("p", { className: "mt-0.5 text-sm text-muted-foreground line-clamp-1", children: n.description })] }), _jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: n.time }), _jsxs(Button, { variant: "ghost", size: "icon-xs", className: "opacity-0 transition-opacity group-hover:opacity-100", onClick: (e) => {
                                                        e.stopPropagation();
                                                        dismiss(n.id);
                                                    }, children: [_jsx(XIcon, { className: "size-3" }), _jsx("span", { className: "sr-only", children: "Dismiss" })] })] })] }) }, n.id));
                        })) }) }) })] }));
}
