"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import Image from "next/image";
import { LineChart, Line } from "recharts";
import { X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { watchlistItems } from "@/data/seed";
export function Watchlist() {
    const [items, setItems] = useState(watchlistItems);
    const removeItem = (id) => {
        setItems((prev) => prev.filter((w) => w.id !== id));
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Watchlist" }) }), _jsxs(CardContent, { className: "px-0", children: [_jsxs("div", { className: "divide-y", children: [items.map((w) => {
                                const positive = w.dayChange >= 0;
                                return (_jsxs("div", { className: "group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50", children: [_jsx(Image, { src: w.logo, alt: w.name, width: 28, height: 28, className: "size-7 shrink-0 rounded-full" }), _jsx(Badge, { variant: "secondary", className: "w-14 justify-center font-mono text-[11px]", children: w.symbol }), _jsx("span", { className: "min-w-0 flex-1 truncate text-sm", children: w.name }), _jsx("div", { className: "hidden sm:block w-[80px] h-[30px]", children: _jsx(LineChart, { width: 80, height: 30, data: w.sparklineData.map((v, i) => ({ i, v })), children: _jsx(Line, { type: "monotone", dataKey: "v", stroke: positive ? "var(--color-emerald-500)" : "var(--color-rose-500)", strokeWidth: 1.5, dot: false }) }) }), _jsxs("span", { className: "w-20 text-right text-sm font-medium tabular-nums", children: ["$", w.currentPrice.toFixed(2)] }), _jsxs(Badge, { variant: "outline", className: cn("w-16 justify-center tabular-nums text-[11px]", positive
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                                                : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"), children: [positive ? "+" : "", w.dayChange.toFixed(2), "%"] }), _jsx("button", { onClick: () => removeItem(w.id), className: "ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground", "aria-label": `Remove ${w.symbol}`, children: _jsx(X, { className: "size-3.5" }) })] }, w.id));
                            }), items.length === 0 && (_jsx("p", { className: "px-4 py-6 text-center text-sm text-muted-foreground", children: "Your watchlist is empty." }))] }), _jsx("div", { className: "px-4 pt-3", children: _jsxs(Button, { variant: "outline", size: "sm", className: "w-full gap-1.5", children: [_jsx(Plus, { className: "size-3.5" }), "Add to Watchlist"] }) })] })] }));
}
