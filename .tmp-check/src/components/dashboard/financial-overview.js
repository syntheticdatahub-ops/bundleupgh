"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { financialOverview } from "@/data/seed";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
function SquareDot({ cx, cy, fill, opacity = 1, size = 6 }) {
    if (cx == null || cy == null)
        return null;
    return (_jsx("rect", { x: cx - size / 2, y: cy - size / 2, width: size, height: size, fill: fill, fillOpacity: opacity, rx: 1 }));
}
const chartConfig = {
    currentYear: {
        label: "Current Year",
        color: "var(--color-primary)",
    },
    lastYear: {
        label: "Last Year",
        color: "var(--color-muted-foreground)",
    },
};
// Map month names to month indices (0-based)
const monthIndex = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};
export function FinancialOverview() {
    const [date, setDate] = useState({
        from: new Date(2026, 0, 1),
        to: new Date(2026, 11, 31),
    });
    const filteredData = useMemo(() => {
        if (!(date === null || date === void 0 ? void 0 : date.from) || !(date === null || date === void 0 ? void 0 : date.to))
            return financialOverview;
        let fromMonth = date.from.getMonth();
        let toMonth = date.to.getMonth();
        // Ensure at least 3 months are shown for readability
        if (toMonth - fromMonth < 2) {
            fromMonth = Math.max(0, fromMonth - 1);
            toMonth = Math.min(11, toMonth + 1);
        }
        return financialOverview.filter((d) => {
            const m = monthIndex[d.month];
            return m >= fromMonth && m <= toMonth;
        });
    }, [date]);
    const totals = useMemo(() => {
        const current = filteredData.reduce((s, d) => s + d.currentYear, 0);
        const last = filteredData.reduce((s, d) => s + d.lastYear, 0);
        return { current, last };
    }, [filteredData]);
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-col gap-3 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Financial Overview" }), _jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "size-2 rounded-full bg-primary" }), "Current Year", " ", _jsxs("span", { className: "font-medium text-foreground", children: ["$", totals.current.toLocaleString()] })] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "size-2 rounded-full bg-muted-foreground/40" }), "Last Year", " ", _jsxs("span", { className: "font-medium text-foreground", children: ["$", totals.last.toLocaleString()] })] })] })] }), _jsxs(Popover, { children: [_jsxs(PopoverTrigger, { render: _jsx(Button, { variant: "outline", className: cn("h-8 w-full justify-start text-left text-xs font-normal sm:w-[200px]", !date && "text-muted-foreground") }), children: [_jsx(CalendarIcon, { className: "mr-2 size-3.5" }), (date === null || date === void 0 ? void 0 : date.from) ? (date.to ? (_jsxs(_Fragment, { children: [format(date.from, "MMM yyyy"), " - ", format(date.to, "MMM yyyy")] })) : (format(date.from, "MMM yyyy"))) : ("Pick a date range")] }), _jsx(PopoverContent, { className: "w-auto p-0", align: "end", children: _jsx(Calendar, { mode: "range", defaultMonth: date === null || date === void 0 ? void 0 : date.from, selected: date, onSelect: setDate, numberOfMonths: 2 }) })] })] }), _jsx(CardContent, { className: "pt-0", children: _jsx(ChartContainer, { config: chartConfig, className: "h-[260px] w-full", children: _jsxs(AreaChart, { data: filteredData, margin: { top: 8, right: 8, bottom: 0, left: -20 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "fillCurrent", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "var(--color-primary)", stopOpacity: 0.2 }), _jsx("stop", { offset: "100%", stopColor: "var(--color-primary)", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "var(--color-border)", strokeOpacity: 0.5 }), _jsx(XAxis, { dataKey: "month", tickLine: false, axisLine: false, fontSize: 12, tickMargin: 8, stroke: "var(--color-muted-foreground)" }), _jsx(YAxis, { tickLine: false, axisLine: false, fontSize: 12, tickMargin: 8, stroke: "var(--color-muted-foreground)", tickFormatter: (v) => `$${(v / 1000).toFixed(0)}k` }), _jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { labelFormatter: (label) => label, formatter: (value) => `$${Number(value).toLocaleString()}` }) }), _jsx(Area, { dataKey: "lastYear", type: "linear", stroke: "var(--color-muted-foreground)", strokeOpacity: 0.3, strokeWidth: 1.5, fill: "transparent", dot: _jsx(SquareDot, { fill: "var(--color-muted-foreground)", opacity: 0.3, size: 5 }) }), _jsx(Area, { dataKey: "currentYear", type: "linear", stroke: "var(--color-primary)", strokeWidth: 2, fill: "url(#fillCurrent)", dot: _jsx(SquareDot, { fill: "var(--color-primary)", size: 6 }), activeDot: _jsx(SquareDot, { fill: "var(--color-primary)", size: 9 }) })] }) }) })] }));
}
