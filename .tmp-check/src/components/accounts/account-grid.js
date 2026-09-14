"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Image from "next/image";
import { TrendingUpIcon, TrendingDownIcon, ClockIcon, BuildingIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
const fmt = (n, currency = "$") => `${currency}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(Math.abs(n))}`;
export function AccountCard({ account, index, onSelect }) {
    const [imgError, setImgError] = useState(false);
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delay: index * 0.05 }, onClick: () => {
            onSelect === null || onSelect === void 0 ? void 0 : onSelect(account);
            console.log("Selected account:", account.name);
        }, className: "group relative cursor-pointer overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md", children: [_jsx("div", { className: cn("absolute inset-y-0 left-0 w-1", account.color) }), _jsxs("div", { className: "p-4 pl-5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [imgError ? (_jsx("div", { className: "flex size-8 items-center justify-center rounded-full bg-muted", children: _jsx(BuildingIcon, { className: "size-4 text-muted-foreground" }) })) : (_jsx(Image, { src: account.institutionLogo, alt: account.institution, width: 32, height: 32, unoptimized: true, className: "size-8 rounded-full bg-muted object-cover", onError: () => setImgError(true) })), _jsx("span", { className: "text-xs text-muted-foreground", children: account.institution })] }), _jsxs("div", { className: "mt-3", children: [_jsx("p", { className: "text-sm font-semibold", children: account.name }), _jsx("p", { className: "font-mono text-xs text-muted-foreground", children: account.accountNumber })] }), _jsx("p", { className: "mt-3 tabular-nums text-xl font-bold tracking-tight", children: fmt(account.balance, account.currency) }), _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsxs("span", { className: cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", account.change >= 0
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-rose-500/10 text-rose-500"), children: [account.change >= 0 ? (_jsx(TrendingUpIcon, { className: "size-3" })) : (_jsx(TrendingDownIcon, { className: "size-3" })), _jsxs("span", { className: "tabular-nums", children: [account.change >= 0 ? "+" : "-", fmt(account.change, account.currency), " ", "(", Math.abs(account.changePercent).toFixed(1), "%)"] })] }), _jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(ClockIcon, { className: "size-3" }), account.lastActivity] })] })] })] }));
}
