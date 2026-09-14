"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import Link from "next/link";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { notifications } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowDownLeftIcon, ShieldAlertIcon, CreditCardIcon, AlertTriangleIcon, SparklesIcon, CheckCircleIcon, LockIcon, RepeatIcon, ClockIcon, TrendingUpIcon, FileTextIcon, ShieldCheckIcon, HandCoinsIcon, SplitIcon, CheckIcon, XIcon, LoaderIcon, } from "lucide-react";
import { cn } from "@/lib/utils";
const unreadCount = notifications.filter((n) => !n.read).length;
const iconMap = {
    "arrow-down-left": _jsx(ArrowDownLeftIcon, { className: "size-3.5" }),
    "shield-alert": _jsx(ShieldAlertIcon, { className: "size-3.5" }),
    "credit-card": _jsx(CreditCardIcon, { className: "size-3.5" }),
    "alert-triangle": _jsx(AlertTriangleIcon, { className: "size-3.5" }),
    sparkles: _jsx(SparklesIcon, { className: "size-3.5" }),
    "check-circle": _jsx(CheckCircleIcon, { className: "size-3.5" }),
    lock: _jsx(LockIcon, { className: "size-3.5" }),
    repeat: _jsx(RepeatIcon, { className: "size-3.5" }),
    clock: _jsx(ClockIcon, { className: "size-3.5" }),
    "trending-up": _jsx(TrendingUpIcon, { className: "size-3.5" }),
    "file-text": _jsx(FileTextIcon, { className: "size-3.5" }),
    "shield-check": _jsx(ShieldCheckIcon, { className: "size-3.5" }),
    "hand-coins": _jsx(HandCoinsIcon, { className: "size-3.5" }),
    split: _jsx(SplitIcon, { className: "size-3.5" }),
};
const typeColor = {
    transaction: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    security: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
    system: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    promotion: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    request: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
};
function NotificationDropdown({ icon, badge }) {
    const latest = notifications.slice(0, 6);
    const [actionStates, setActionStates] = React.useState({});
    const handleAction = (id, action) => {
        setActionStates((prev) => (Object.assign(Object.assign({}, prev), { [id]: "loading" })));
        setTimeout(() => {
            setActionStates((prev) => (Object.assign(Object.assign({}, prev), { [id]: action })));
        }, 800);
    };
    return (_jsxs(Popover, { children: [_jsxs(PopoverTrigger, { render: _jsx(SidebarMenuButton, { size: "sm", className: "relative" }), children: [icon, _jsx("span", { className: "flex-1", children: "Notifications" }), badge > 0 && (_jsx("span", { className: "flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold leading-none text-primary-foreground tabular-nums", children: badge }))] }), _jsxs(PopoverContent, { side: "right", align: "end", sideOffset: 8, className: "w-80 p-0", children: [_jsxs("div", { className: "flex items-center justify-between border-b px-4 py-3", children: [_jsx("p", { className: "text-sm font-semibold", children: "Notifications" }), badge > 0 && (_jsxs("span", { className: "text-[10px] font-medium text-muted-foreground", children: [badge, " unread"] }))] }), _jsx("div", { className: "max-h-[380px] overflow-y-auto", children: latest.map((n) => {
                            var _a, _b, _c;
                            const state = (_a = actionStates[n.id]) !== null && _a !== void 0 ? _a : "idle";
                            return (_jsxs("div", { className: cn("flex gap-3 border-b px-4 py-3 last:border-0", !n.read && "bg-muted/50"), children: [((_b = n.actionable) === null || _b === void 0 ? void 0 : _b.fromAvatar) ? (_jsxs(Avatar, { className: "mt-0.5 size-7 shrink-0", children: [_jsx(AvatarImage, { src: n.actionable.fromAvatar }), _jsx(AvatarFallback, { className: "text-[9px]", children: (_c = n.actionable.from) === null || _c === void 0 ? void 0 : _c.split(" ").map((w) => w[0]).join("") })] })) : (_jsx("div", { className: cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", typeColor[n.type]), children: iconMap[n.icon] })), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("p", { className: cn("text-xs", !n.read ? "font-semibold" : "font-medium"), children: n.title }), !n.read && !n.actionable && (_jsx("span", { className: "mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" }))] }), _jsx("p", { className: "text-[11px] text-muted-foreground line-clamp-2", children: n.description }), _jsx("p", { className: "mt-0.5 text-[10px] text-muted-foreground/60", children: n.time }), n.actionable && (_jsxs("div", { className: "mt-2", children: [state === "idle" && (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", className: "h-7 gap-1 text-[11px]", onClick: (e) => { e.stopPropagation(); handleAction(n.id, "accepted"); }, children: [_jsx(CheckIcon, { className: "size-3" }), n.actionable.accept] }), _jsxs(Button, { variant: "outline", size: "sm", className: "h-7 gap-1 text-[11px]", onClick: (e) => { e.stopPropagation(); handleAction(n.id, "declined"); }, children: [_jsx(XIcon, { className: "size-3" }), n.actionable.decline] })] })), state === "loading" && (_jsxs("div", { className: "flex items-center gap-1.5 py-1 text-[11px] text-muted-foreground", children: [_jsx(LoaderIcon, { className: "size-3 animate-spin" }), "Processing..."] })), state === "accepted" && (_jsxs("div", { className: "flex items-center gap-1.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400", children: [_jsx(CheckCircleIcon, { className: "size-3" }), "Accepted"] })), state === "declined" && (_jsxs("div", { className: "flex items-center gap-1.5 py-1 text-[11px] font-medium text-muted-foreground", children: [_jsx(XIcon, { className: "size-3" }), "Declined"] }))] }))] })] }, n.id));
                        }) }), _jsx("div", { className: "border-t p-2", children: _jsx(Link, { href: "/notifications", className: "flex items-center justify-center rounded-md py-1.5 text-xs font-medium text-primary hover:bg-muted transition-colors", children: "View all notifications" }) })] })] }));
}
export function NavSecondary(_a) {
    var { items } = _a, props = __rest(_a, ["items"]);
    return (_jsx(SidebarGroup, Object.assign({}, props, { children: _jsx(SidebarGroupContent, { children: _jsx(SidebarMenu, { children: items.map((item) => (_jsx(SidebarMenuItem, { children: item.title === "Notifications" ? (_jsx(NotificationDropdown, { icon: item.icon, badge: unreadCount })) : (_jsxs(SidebarMenuButton, { size: "sm", render: _jsx(Link, { href: item.url }), children: [item.icon, _jsx("span", { children: item.title })] })) }, item.title))) }) }) })));
}
