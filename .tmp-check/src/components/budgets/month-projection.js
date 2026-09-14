"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart";
import { Area, AreaChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { budgetCategories, dailySpending } from "@/data/seed";
import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
const chartConfig = {
    cumulative: {
        label: "Spending",
        color: "var(--color-primary)",
    },
};
export function MonthProjection() {
    const stats = useMemo(() => {
        const totalBudget = budgetCategories.reduce((s, b) => s + b.budget, 0);
        const spentDays = dailySpending.filter((d) => d.amount > 0);
        const totalSpent = spentDays.reduce((s, d) => s + d.amount, 0);
        const avgDaily = spentDays.length > 0 ? totalSpent / spentDays.length : 0;
        const daysLeft = 30 - spentDays.length;
        const projected = totalSpent + avgDaily * daysLeft;
        const overBudget = projected > totalBudget;
        // Build cumulative chart data
        const chartData = dailySpending.reduce((acc, d, i) => {
            const prevCumulative = i > 0 ? acc[i - 1].cumulative : 0;
            acc.push({ day: i + 1, cumulative: prevCumulative + d.amount, budget: (totalBudget / 30) * (i + 1) });
            return acc;
        }, []);
        return { totalBudget, totalSpent, avgDaily, daysLeft, projected, overBudget, chartData };
    }, []);
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base font-semibold", children: "Month Projection" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium", stats.overBudget
                            ? "bg-destructive/10 text-destructive"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"), children: [stats.overBudget ? (_jsx(AlertTriangleIcon, { className: "size-4" })) : (_jsx(CheckCircle2Icon, { className: "size-4" })), stats.overBudget
                                ? "Projected to exceed budget"
                                : "On track this month"] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium text-muted-foreground", children: "Days Left" }), _jsx("p", { className: "text-lg font-bold tabular-nums", children: stats.daysLeft })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium text-muted-foreground", children: "Avg/Day" }), _jsxs("p", { className: "text-lg font-bold tabular-nums", children: ["$", Math.round(stats.avgDaily)] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium text-muted-foreground", children: "Spent So Far" }), _jsxs("p", { className: "text-lg font-bold tabular-nums", children: ["$", stats.totalSpent.toLocaleString()] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium text-muted-foreground", children: "Projected" }), _jsxs("p", { className: cn("text-lg font-bold tabular-nums", stats.overBudget && "text-destructive"), children: ["$", Math.round(stats.projected).toLocaleString()] })] })] }), _jsx(ChartContainer, { config: chartConfig, className: "h-[140px] w-full", children: _jsxs(AreaChart, { data: stats.chartData, margin: { top: 4, right: 4, bottom: 0, left: -24 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "fillSpend", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "var(--color-primary)", stopOpacity: 0.2 }), _jsx("stop", { offset: "100%", stopColor: "var(--color-primary)", stopOpacity: 0 })] }) }), _jsx(XAxis, { dataKey: "day", tickLine: false, axisLine: false, fontSize: 10, tickMargin: 4, stroke: "var(--color-muted-foreground)" }), _jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 10, tickMargin: 4, stroke: "var(--color-muted-foreground)", tickFormatter: (v) => `$${(v / 1000).toFixed(0)}k` }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { formatter: (value) => `$${Number(value).toLocaleString()}` }) }), _jsx(ReferenceLine, { y: stats.totalBudget, stroke: "var(--color-destructive)", strokeDasharray: "4 4", strokeOpacity: 0.5 }), _jsx(Area, { dataKey: "budget", type: "linear", stroke: "var(--color-muted-foreground)", strokeOpacity: 0.2, strokeDasharray: "4 4", fill: "transparent", dot: false }), _jsx(Area, { dataKey: "cumulative", type: "monotone", stroke: "var(--color-primary)", strokeWidth: 2, fill: "url(#fillSpend)", dot: false })] }) })] })] }));
}
