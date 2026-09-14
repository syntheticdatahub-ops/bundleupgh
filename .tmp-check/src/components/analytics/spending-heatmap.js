"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { spendingHeatmapData } from "@/data/seed";
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const CELL_SIZE = 13;
const CELL_GAP = 3;
const TOTAL = CELL_SIZE + CELL_GAP;
function intensityClass(amount, max) {
    if (amount === 0)
        return "fill-muted/40";
    const ratio = amount / max;
    if (ratio < 0.2)
        return "fill-primary/10";
    if (ratio < 0.4)
        return "fill-primary/25";
    if (ratio < 0.65)
        return "fill-primary/45";
    return "fill-primary/70";
}
export function SpendingHeatmap() {
    const { grid, monthLabels, yearTotal, max } = useMemo(() => {
        var _a;
        const data = spendingHeatmapData;
        const max = Math.max(...data.map((d) => d.amount));
        const yearTotal = data.reduce((s, d) => s + d.amount, 0);
        // Build 52-column x 7-row grid
        // Find the first Sunday on or before the start date
        const firstDate = new Date(data[0].date);
        const startDay = firstDate.getDay();
        const gridStart = new Date(firstDate);
        gridStart.setDate(gridStart.getDate() - startDay);
        // Build lookup
        const lookup = new Map(data.map((d) => [d.date, d.amount]));
        const weeks = [];
        const months = [];
        const seenMonths = new Set();
        for (let col = 0; col < 53; col++) {
            for (let row = 0; row < 7; row++) {
                const d = new Date(gridStart);
                d.setDate(d.getDate() + col * 7 + row);
                const key = d.toISOString().split("T")[0];
                const amount = (_a = lookup.get(key)) !== null && _a !== void 0 ? _a : 0;
                weeks.push({ date: key, amount, col, row });
                // Month labels — show at the first occurrence of a new month
                const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
                if (!seenMonths.has(monthKey) && row === 0) {
                    seenMonths.add(monthKey);
                    const label = d.toLocaleDateString("en-US", { month: "short" });
                    months.push({ label, col });
                }
            }
        }
        return { grid: weeks, monthLabels: months, yearTotal, max };
    }, []);
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Spending Activity" }), _jsxs(CardDescription, { children: [_jsxs("span", { className: "tabular-nums font-medium text-foreground", children: ["$", yearTotal.toLocaleString()] }), " ", "total spent this year"] })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx("span", { children: "Less" }), _jsx("span", { className: "inline-block size-3 rounded-sm bg-muted/40" }), _jsx("span", { className: "inline-block size-3 rounded-sm bg-primary/10" }), _jsx("span", { className: "inline-block size-3 rounded-sm bg-primary/25" }), _jsx("span", { className: "inline-block size-3 rounded-sm bg-primary/45" }), _jsx("span", { className: "inline-block size-3 rounded-sm bg-primary/70" }), _jsx("span", { children: "More" })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsx(TooltipProvider, { delay: 0, children: _jsxs("svg", { width: 53 * TOTAL + 32, height: 7 * TOTAL + 24, className: "text-muted-foreground", children: [monthLabels.map((m) => (_jsx("text", { x: m.col * TOTAL + 32, y: 10, className: "fill-muted-foreground text-[10px]", children: m.label }, `${m.label}-${m.col}`))), DAY_LABELS.map((label, i) => label ? (_jsx("text", { x: 0, y: i * TOTAL + 28, className: "fill-muted-foreground text-[10px]", dominantBaseline: "middle", children: label }, i)) : null), grid.map((cell) => (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { render: _jsx("rect", { x: cell.col * TOTAL + 32, y: cell.row * TOTAL + 18, width: CELL_SIZE, height: CELL_SIZE, rx: 2, className: `${intensityClass(cell.amount, max)} transition-colors hover:stroke-foreground/30 hover:stroke-1` }) }), _jsxs(TooltipContent, { children: [_jsxs("span", { className: "tabular-nums", children: ["$", cell.amount.toLocaleString()] }), " ", "on", " ", new Date(cell.date + "T12:00:00").toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })] })] }, cell.date)))] }) }) }) })] }));
}
