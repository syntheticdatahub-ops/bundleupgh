"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { portfolioHistory } from "@/data/seed";
const PERIODS = [
    { label: "1M", months: 1 },
    { label: "3M", months: 3 },
    { label: "6M", months: 6 },
    { label: "1Y", months: 12 },
];
const chartConfig = {
    portfolio: { label: "My Portfolio", color: "var(--color-chart-1)" },
    sp500: { label: "S&P 500", color: "var(--color-chart-3)" },
};
export function PerformanceChart() {
    const [period, setPeriod] = useState(12);
    const data = useMemo(() => portfolioHistory.slice(-period), [period]);
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [_jsx(CardTitle, { children: "Performance" }), _jsx("div", { className: "flex flex-wrap gap-1", children: PERIODS.map((p) => (_jsx("button", { onClick: () => setPeriod(p.months), className: cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", period === p.months
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"), children: p.label }, p.label))) })] }) }), _jsxs(CardContent, { children: [_jsx(ChartContainer, { config: chartConfig, className: "h-[280px] w-full", children: _jsxs(AreaChart, { data: data, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "portfolioGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "var(--color-chart-1)", stopOpacity: 0.3 }), _jsx("stop", { offset: "100%", stopColor: "var(--color-chart-1)", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { vertical: false, strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", tickLine: false, axisLine: false, tickFormatter: (v) => {
                                        var _a, _b;
                                        const parts = v.split(" ");
                                        return (_b = (_a = parts[0]) === null || _a === void 0 ? void 0 : _a.slice(0, 3)) !== null && _b !== void 0 ? _b : v;
                                    }, tick: { fontSize: 11 } }), _jsx(YAxis, { tickLine: false, axisLine: false, width: 50, tickFormatter: (v) => `$${(v / 1000).toFixed(0)}k`, tick: { fontSize: 11 } }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { formatter: (value) => `$${Number(value).toLocaleString()}` }) }), _jsx(Area, { type: "monotone", dataKey: "portfolio", stroke: "var(--color-chart-1)", strokeWidth: 2, fill: "url(#portfolioGrad)" }), _jsx(Area, { type: "monotone", dataKey: "sp500", stroke: "var(--color-chart-3)", strokeWidth: 1.5, strokeDasharray: "5 3", fill: "none" })] }) }), _jsxs("div", { className: "mt-3 flex items-center justify-center gap-6 text-xs", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "inline-block h-0.5 w-4 rounded-full bg-[var(--color-chart-1)]" }), _jsx("span", { className: "text-muted-foreground", children: "My Portfolio" })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "inline-block h-0.5 w-4 rounded-full border-t-2 border-dashed border-[var(--color-chart-3)]" }), _jsx("span", { className: "text-muted-foreground", children: "S&P 500" })] })] })] })] }));
}
