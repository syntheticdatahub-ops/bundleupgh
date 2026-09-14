"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { LineChart, Line } from "recharts";
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { holdings as seedHoldings } from "@/data/seed";
function SortIcon({ col, sortKey, sortDir }) {
    if (sortKey !== col)
        return _jsx(ArrowUpDown, { className: "ml-1 inline size-3 text-muted-foreground/50" });
    if (sortDir === "asc")
        return _jsx(ArrowUp, { className: "ml-1 inline size-3" });
    return _jsx(ArrowDown, { className: "ml-1 inline size-3" });
}
function getPl(h) {
    const pct = ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
    const dollar = (h.currentPrice - h.avgBuyPrice) * h.quantity;
    return { pct, dollar };
}
export function HoldingsTable() {
    const [prices, setPrices] = useState(() => {
        const map = {};
        for (const h of seedHoldings)
            map[h.id] = h.currentPrice;
        return map;
    });
    const [flashMap, setFlashMap] = useState({});
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null);
    const prevPrices = useRef(Object.assign({}, prices));
    // Live price simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setPrices((prev) => {
                const next = Object.assign({}, prev);
                const flashes = {};
                for (const h of seedHoldings) {
                    const change = 1 + (Math.random() - 0.5) * 0.006; // +/- 0.3%
                    const newPrice = Math.round(prev[h.id] * change * 100) / 100;
                    if (newPrice !== prev[h.id]) {
                        flashes[h.id] = newPrice > prev[h.id] ? "up" : "down";
                    }
                    next[h.id] = newPrice;
                }
                prevPrices.current = prev;
                setFlashMap(flashes);
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    // Clear flash after animation
    useEffect(() => {
        if (Object.keys(flashMap).length === 0)
            return;
        const t = setTimeout(() => setFlashMap({}), 600);
        return () => clearTimeout(t);
    }, [flashMap]);
    const holdings = useMemo(() => seedHoldings.map((h) => {
        var _a;
        return (Object.assign(Object.assign({}, h), { currentPrice: (_a = prices[h.id]) !== null && _a !== void 0 ? _a : h.currentPrice }));
    }), [prices]);
    const cycleSortDir = useCallback((key) => {
        if (sortKey !== key) {
            setSortKey(key);
            setSortDir("asc");
        }
        else if (sortDir === "asc") {
            setSortDir("desc");
        }
        else {
            setSortKey(null);
            setSortDir(null);
        }
    }, [sortKey, sortDir]);
    const sorted = useMemo(() => {
        if (!sortKey || !sortDir)
            return holdings;
        const arr = [...holdings];
        arr.sort((a, b) => {
            let va, vb;
            switch (sortKey) {
                case "name":
                    return sortDir === "asc"
                        ? a.name.localeCompare(b.name)
                        : b.name.localeCompare(a.name);
                case "quantity":
                    va = a.quantity;
                    vb = b.quantity;
                    break;
                case "avgBuyPrice":
                    va = a.avgBuyPrice;
                    vb = b.avgBuyPrice;
                    break;
                case "currentPrice":
                    va = a.currentPrice;
                    vb = b.currentPrice;
                    break;
                case "plPct":
                    va = getPl(a).pct;
                    vb = getPl(b).pct;
                    break;
                case "plDollar":
                    va = getPl(a).dollar;
                    vb = getPl(b).dollar;
                    break;
                default:
                    return 0;
            }
            return sortDir === "asc" ? va - vb : vb - va;
        });
        return arr;
    }, [holdings, sortKey, sortDir]);
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Holdings" }) }), _jsx(CardContent, { className: "px-0", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsxs(TableHead, { className: "cursor-pointer select-none pl-4", onClick: () => cycleSortDir("name"), children: ["Asset ", _jsx(SortIcon, { col: "name", sortKey: sortKey, sortDir: sortDir })] }), _jsxs(TableHead, { className: "hidden cursor-pointer select-none text-right sm:table-cell", onClick: () => cycleSortDir("quantity"), children: ["Qty ", _jsx(SortIcon, { col: "quantity", sortKey: sortKey, sortDir: sortDir })] }), _jsxs(TableHead, { className: "hidden cursor-pointer select-none text-right lg:table-cell", onClick: () => cycleSortDir("avgBuyPrice"), children: ["Avg Buy ", _jsx(SortIcon, { col: "avgBuyPrice", sortKey: sortKey, sortDir: sortDir })] }), _jsxs(TableHead, { className: "cursor-pointer select-none text-right", onClick: () => cycleSortDir("currentPrice"), children: ["Current ", _jsx(SortIcon, { col: "currentPrice", sortKey: sortKey, sortDir: sortDir })] }), _jsxs(TableHead, { className: "cursor-pointer select-none text-right", onClick: () => cycleSortDir("plPct"), children: ["P&L % ", _jsx(SortIcon, { col: "plPct", sortKey: sortKey, sortDir: sortDir })] }), _jsxs(TableHead, { className: "hidden cursor-pointer select-none text-right md:table-cell", onClick: () => cycleSortDir("plDollar"), children: ["P&L $ ", _jsx(SortIcon, { col: "plDollar", sortKey: sortKey, sortDir: sortDir })] }), _jsx(TableHead, { className: "hidden text-right pr-4 xl:table-cell", children: "Trend" })] }) }), _jsx(TableBody, { children: sorted.map((h) => {
                                    const pl = getPl(h);
                                    const positive = pl.pct >= 0;
                                    const flash = flashMap[h.id];
                                    return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "pl-4", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Image, { src: h.logo, alt: h.name, width: 28, height: 28, unoptimized: true, className: "rounded-full" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: h.name }), _jsx("div", { className: "text-xs text-muted-foreground", children: h.symbol })] })] }) }), _jsx(TableCell, { className: "hidden text-right tabular-nums sm:table-cell", children: h.quantity }), _jsxs(TableCell, { className: "hidden text-right tabular-nums lg:table-cell", children: ["$", h.avgBuyPrice.toFixed(2)] }), _jsx(TableCell, { className: "text-right tabular-nums", children: _jsxs(motion.span, { initial: {
                                                        backgroundColor: flash === "up"
                                                            ? "var(--color-emerald-500/0.2)"
                                                            : flash === "down"
                                                                ? "var(--color-rose-500/0.2)"
                                                                : "transparent",
                                                    }, animate: { backgroundColor: "transparent" }, transition: { duration: 0.6 }, className: "rounded px-1 py-0.5", children: ["$", h.currentPrice.toFixed(2)] }, `${h.id}-${prices[h.id]}`) }), _jsx(TableCell, { className: cn("text-right tabular-nums font-medium", positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"), children: _jsxs("span", { className: "inline-flex items-center gap-0.5", children: [positive ? (_jsx(TrendingUp, { className: "size-3.5" })) : (_jsx(TrendingDown, { className: "size-3.5" })), positive ? "+" : "", pl.pct.toFixed(2), "%"] }) }), _jsxs(TableCell, { className: cn("hidden text-right tabular-nums font-medium md:table-cell", positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"), children: [positive ? "+" : "", "$", pl.dollar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsx(TableCell, { className: "hidden pr-4 xl:table-cell", children: _jsx("div", { className: "ml-auto w-[80px] h-[30px]", children: _jsx(LineChart, { width: 80, height: 30, data: h.sparklineData.map((v, i) => ({ i, v })), children: _jsx(Line, { type: "monotone", dataKey: "v", stroke: positive ? "var(--color-emerald-500)" : "var(--color-rose-500)", strokeWidth: 1.5, dot: false }) }) }) })] }, h.id));
                                }) })] }) }) })] }));
}
