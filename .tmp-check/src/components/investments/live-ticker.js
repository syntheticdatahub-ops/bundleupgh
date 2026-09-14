"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { holdings, watchlistItems } from "@/data/seed";
export function LiveTicker() {
    const entries = useMemo(() => {
        const fromHoldings = holdings.map((h) => ({
            symbol: h.symbol,
            price: h.currentPrice,
            change: Math.round(((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 10000) / 100,
        }));
        const fromWatchlist = watchlistItems.map((w) => ({
            symbol: w.symbol,
            price: w.currentPrice,
            change: w.dayChange,
        }));
        return [...fromHoldings, ...fromWatchlist];
    }, []);
    const tickerItems = entries.map((e, i) => {
        const positive = e.change >= 0;
        return (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-4 text-xs", children: [_jsx("span", { className: "font-medium", children: e.symbol }), _jsxs("span", { className: "tabular-nums text-muted-foreground", children: ["$", e.price.toFixed(2)] }), _jsxs("span", { className: cn("tabular-nums font-medium", positive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"), children: [positive ? "+" : "", e.change.toFixed(2), "%"] })] }, `${e.symbol}-${i}`));
    });
    return (_jsx("div", { className: "group sticky top-0 z-20 h-10 w-full overflow-hidden border-b bg-background", children: _jsxs("div", { className: "animate-marquee group-hover:[animation-play-state:paused] absolute flex h-full items-center whitespace-nowrap", children: [_jsx("div", { className: "flex items-center", children: tickerItems }), _jsx("div", { className: "flex items-center", "aria-hidden": true, children: tickerItems })] }) }));
}
