"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { moneyMovementByPeriod } from "@/data/seed";
import { ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react";
const chartConfig = {
    moneyIn: {
        label: "Money In",
        color: "var(--color-primary)",
    },
    moneyOut: {
        label: "Money Out",
        color: "var(--color-muted-foreground)",
    },
};
export function MoneyMovement() {
    const [period, setPeriod] = useState("7d");
    const data = moneyMovementByPeriod[period];
    const totals = useMemo(() => {
        const inTotal = data.reduce((s, d) => s + d.moneyIn, 0);
        const outTotal = data.reduce((s, d) => s + d.moneyOut, 0);
        return { in: inTotal, out: outTotal, net: inTotal - outTotal };
    }, [data]);
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Money Movement" }), _jsxs(Select, { value: period, onValueChange: (v) => setPeriod(v), children: [_jsx(SelectTrigger, { className: "h-8 w-[110px] text-xs", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7d", children: "7 days" }), _jsx(SelectItem, { value: "30d", children: "30 days" }), _jsx(SelectItem, { value: "90d", children: "90 days" })] })] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "flex items-center gap-2.5 rounded-xl bg-emerald-50 px-3 py-2.5 dark:bg-emerald-950/30", children: [_jsx("div", { className: "flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50", children: _jsx(ArrowDownLeftIcon, { className: "size-4 text-emerald-600 dark:text-emerald-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/70", children: "Money In" }), _jsxs("p", { className: "text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300", children: ["$", totals.in.toLocaleString()] })] })] }), _jsxs("div", { className: "flex items-center gap-2.5 rounded-xl bg-rose-50 px-3 py-2.5 dark:bg-rose-950/30", children: [_jsx("div", { className: "flex size-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/50", children: _jsx(ArrowUpRightIcon, { className: "size-4 text-rose-600 dark:text-rose-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium text-rose-600/70 dark:text-rose-400/70", children: "Money Out" }), _jsxs("p", { className: "text-sm font-bold tabular-nums text-rose-700 dark:text-rose-300", children: ["$", totals.out.toLocaleString()] })] })] })] }), _jsxs("div", { className: "flex items-center justify-between rounded-lg border px-3 py-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Net Flow" }), _jsxs("span", { className: "text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400", children: ["+$", totals.net.toLocaleString()] })] }), _jsx(ChartContainer, { config: chartConfig, className: "h-[180px] w-full", children: _jsxs(BarChart, { data: data, margin: { top: 4, right: 4, bottom: 0, left: -24 }, barGap: 2, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "var(--color-border)", strokeOpacity: 0.4 }), _jsx(XAxis, { dataKey: "label", tickLine: false, axisLine: false, fontSize: 11, tickMargin: 6, stroke: "var(--color-muted-foreground)" }), _jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 11, tickMargin: 4, stroke: "var(--color-muted-foreground)", tickFormatter: (v) => `$${(v / 1000).toFixed(0)}k` }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { formatter: (value) => `$${Number(value).toLocaleString()}` }) }), _jsx(Bar, { dataKey: "moneyIn", fill: "var(--color-primary)", radius: [6, 6, 0, 0], maxBarSize: 24 }), _jsx(Bar, { dataKey: "moneyOut", fill: "var(--color-muted-foreground)", fillOpacity: 0.25, radius: [6, 6, 0, 0], maxBarSize: 24 })] }) })] })] }));
}
