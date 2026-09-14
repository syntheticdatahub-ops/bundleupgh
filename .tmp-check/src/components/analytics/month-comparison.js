"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart";
import { monthComparisons } from "@/data/seed";
const chartConfig = {
    thisMonth: {
        label: "This Month",
        color: "var(--color-primary)",
    },
    lastMonth: {
        label: "Last Month",
        color: "var(--color-muted-foreground)",
    },
};
function ChangeLabel(props) {
    const { x, y, width, index } = props;
    const row = monthComparisons[index];
    if (!row || row.lastMonth === 0)
        return null;
    const pct = Math.round(((row.thisMonth - row.lastMonth) / row.lastMonth) * 100);
    if (pct === 0)
        return null;
    const isUp = pct > 0;
    return (_jsxs("text", { x: x + width / 2, y: y - 6, textAnchor: "middle", className: `text-[10px] font-medium tabular-nums ${isUp ? "fill-rose-500" : "fill-emerald-500"}`, children: [isUp ? "+" : "", pct, "%"] }));
}
export function MonthComparison() {
    const totals = useMemo(() => {
        const thisMonth = monthComparisons.reduce((s, r) => s + r.thisMonth, 0);
        const lastMonth = monthComparisons.reduce((s, r) => s + r.lastMonth, 0);
        return { thisMonth, lastMonth };
    }, []);
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx(CardTitle, { children: "Month vs Last Month" }), _jsx(CardDescription, { children: _jsxs("span", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "size-2 rounded-full bg-primary" }), "This Month", " ", _jsxs("span", { className: "font-medium tabular-nums text-foreground", children: ["$", totals.thisMonth.toLocaleString()] })] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "size-2 rounded-full bg-muted-foreground/30" }), "Last Month", " ", _jsxs("span", { className: "font-medium tabular-nums text-foreground", children: ["$", totals.lastMonth.toLocaleString()] })] })] }) })] }) }) }), _jsx(CardContent, { className: "min-w-0", children: _jsx(ChartContainer, { config: chartConfig, className: "h-[280px] w-full", children: _jsxs(BarChart, { data: monthComparisons, margin: { top: 24, right: 8, bottom: 0, left: -20 }, barGap: 4, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "var(--color-border)", strokeOpacity: 0.5 }), _jsx(XAxis, { dataKey: "category", tickLine: false, axisLine: false, fontSize: 11, tickMargin: 8, stroke: "var(--color-muted-foreground)", tickFormatter: (v) => v.length > 8 ? v.slice(0, 7) + "..." : v }), _jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, tickMargin: 8, stroke: "var(--color-muted-foreground)", tickFormatter: (v) => `$${v}` }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { formatter: (value) => `$${Number(value).toLocaleString()}` }) }), _jsx(Bar, { dataKey: "lastMonth", fill: "var(--color-muted-foreground)", fillOpacity: 0.3, radius: [4, 4, 0, 0], barSize: 18 }), _jsx(Bar, { dataKey: "thisMonth", fill: "var(--color-primary)", radius: [4, 4, 0, 0], barSize: 18, children: _jsx(LabelList, { dataKey: "thisMonth", content: _jsx(ChangeLabel, {}) }) })] }) }) })] }));
}
