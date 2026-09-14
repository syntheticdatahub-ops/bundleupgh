"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from "next/image";
import { MoreHorizontalIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardAction, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { cryptoCoins } from "@/data/seed";
const COLORS = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-rose-500",
];
export function MyPortfolio({ prices, originalPrices, selectedCoin, onSelectCoin }) {
    const top3 = cryptoCoins.slice(0, 3);
    const total = top3.reduce((s, c) => { var _a; return s + c.holdings * ((_a = prices[c.id]) !== null && _a !== void 0 ? _a : c.price); }, 0);
    const origTotal = top3.reduce((s, c) => { var _a; return s + c.holdings * ((_a = originalPrices[c.id]) !== null && _a !== void 0 ? _a : c.price); }, 0);
    const profitPct = origTotal > 0 ? ((total - origTotal) / origTotal) * 100 : 0;
    const profitPositive = profitPct >= 0;
    const segments = top3.map((c, i) => {
        var _a, _b;
        const livePrice = (_a = prices[c.id]) !== null && _a !== void 0 ? _a : c.price;
        const origPrice = (_b = originalPrices[c.id]) !== null && _b !== void 0 ? _b : c.price;
        const value = c.holdings * livePrice;
        const change = ((livePrice - origPrice) / origPrice) * 100;
        return {
            coin: c,
            value,
            pct: total > 0 ? (value / total) * 100 : 0,
            change,
            color: COLORS[i % COLORS.length],
        };
    });
    return (_jsxs(Card, { className: "lg:col-span-4", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CardTitle, { children: "My Portfolio" }), _jsxs(Badge, { variant: "secondary", className: "text-xs tabular-nums", children: [top3.length, " Total Assets"] })] }), _jsx(CardAction, { children: _jsxs(Badge, { variant: "outline", className: cn(profitPositive
                                ? "border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400"
                                : "border-rose-200 bg-rose-500/10 text-rose-600 dark:border-rose-800 dark:text-rose-400"), children: [profitPositive ? (_jsx(TrendingUpIcon, { className: "size-3" })) : (_jsx(TrendingDownIcon, { className: "size-3" })), profitPositive ? "+" : "", profitPct.toFixed(1), "%"] }) })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Profit in last 30 days" }), _jsx("div", { className: "flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full", children: segments.map((seg) => (_jsx(motion.div, { className: cn("h-full rounded-full", seg.color), animate: { width: `${seg.pct}%` }, transition: { duration: 0.5, ease: "easeInOut" }, style: { width: `${seg.pct}%` } }, seg.coin.id))) }), _jsx("div", { className: "space-y-1", children: segments.map((seg) => {
                            const positive = seg.change >= 0;
                            return (_jsxs("div", { className: cn("group/row flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-muted/60 cursor-pointer", selectedCoin === seg.coin.id && "bg-muted/60"), onClick: () => onSelectCoin(seg.coin.id), children: [_jsx(Image, { src: seg.coin.logo, alt: seg.coin.name, width: 32, height: 32, className: "size-8 rounded-full" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium leading-tight", children: seg.coin.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: seg.coin.symbol })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-semibold tabular-nums", children: ["$", seg.value.toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })] }), _jsxs("span", { className: cn("text-xs font-medium tabular-nums", positive
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-rose-600 dark:text-rose-400"), children: [positive ? "+" : "", seg.change.toFixed(2), "%"] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { render: _jsx(Button, { variant: "ghost", size: "icon-xs", className: "opacity-0 transition-opacity group-hover/row:opacity-100" }), children: _jsx(MoreHorizontalIcon, { className: "size-4" }) }), _jsxs(DropdownMenuContent, { side: "bottom", align: "end", children: [_jsx(DropdownMenuItem, { children: "Buy More" }), _jsx(DropdownMenuItem, { children: "Sell" }), _jsx(DropdownMenuItem, { onSelect: () => onSelectCoin(seg.coin.id), children: "View Chart" })] })] })] }, seg.coin.id));
                        }) })] })] }));
}
