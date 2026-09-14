"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import Image from "next/image";
import { ArrowUpRightIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cryptoCoins } from "@/data/seed";
export function TopCoins({ prices, originalPrices, selectedCoin, onSelectCoin }) {
    const top3 = cryptoCoins.slice(0, 3);
    // Track flash directions in state (computed inside effect, not during render)
    const [flashes, setFlashes] = React.useState({});
    // Compare previous prices using a state-based approach
    const [prevPrices, setPrevPrices] = React.useState(prices);
    React.useEffect(() => {
        var _a, _b;
        // Compute flash directions
        const newFlashes = {};
        for (const coin of top3) {
            const prev = (_a = prevPrices[coin.id]) !== null && _a !== void 0 ? _a : coin.price;
            const curr = (_b = prices[coin.id]) !== null && _b !== void 0 ? _b : coin.price;
            if (curr > prev)
                newFlashes[coin.id] = "up";
            else if (curr < prev)
                newFlashes[coin.id] = "down";
            else
                newFlashes[coin.id] = null;
        }
        setFlashes(newFlashes);
        // Clear flashes and update prevPrices after animation
        const timer = setTimeout(() => {
            setPrevPrices(Object.assign({}, prices));
            setFlashes({});
        }, 600);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prices]);
    return (_jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-8", children: top3.map((coin) => {
            var _a, _b, _c;
            const livePrice = (_a = prices[coin.id]) !== null && _a !== void 0 ? _a : coin.price;
            const origPrice = (_b = originalPrices[coin.id]) !== null && _b !== void 0 ? _b : coin.price;
            const change24h = ((livePrice - origPrice) / origPrice) * 100;
            const positive = change24h >= 0;
            const flash = (_c = flashes[coin.id]) !== null && _c !== void 0 ? _c : null;
            return (_jsx(Card, { className: cn("relative cursor-pointer transition-all", selectedCoin === coin.id && "ring-2 ring-primary"), onClick: () => onSelectCoin(coin.id), children: _jsxs(CardContent, { className: "space-y-3 pt-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Image, { src: coin.logo, alt: coin.name, width: 32, height: 32, className: "size-8 rounded-full" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium leading-tight", children: coin.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: coin.symbol })] })] }), _jsx("div", { className: "flex size-7 items-center justify-center rounded-lg bg-muted", children: _jsx(ArrowUpRightIcon, { className: "size-3.5 text-muted-foreground" }) })] }), _jsxs("div", { className: "flex items-end justify-between", children: [_jsxs(motion.span, { initial: flash
                                        ? { backgroundColor: flash === "up" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)" }
                                        : undefined, animate: { backgroundColor: "rgba(0,0,0,0)" }, transition: { duration: 0.6 }, className: "rounded px-1 text-xl font-bold tabular-nums", children: ["$", livePrice.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })] }, livePrice), _jsxs("span", { className: cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums", positive
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"), children: [positive ? (_jsx(TrendingUpIcon, { className: "size-3" })) : (_jsx(TrendingDownIcon, { className: "size-3" })), positive ? "+" : "", change24h.toFixed(2), "%"] })] })] }) }, coin.id));
        }) }));
}
