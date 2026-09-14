"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function RevenueChart({ orders }) {
    // Operational orders only — paymentStatus SUCCESS or PAID (legacy) means money was actually collected.
    const successfulOrders = orders.filter((o) => {
        var _a;
        const status = ((_a = o.paymentStatus) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
        return status === "SUCCESS" || status === "PAID" || status === "NOT_APPLICABLE";
    });
    if (successfulOrders.length === 0) {
        return (_jsxs(Card, { className: "h-full flex flex-col", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Revenue Overview" }) }), _jsx(CardContent, { className: "flex-1 pb-4 flex items-center justify-center", children: _jsxs("div", { className: "text-center text-muted-foreground", children: [_jsx("p", { children: "No revenue data yet." }), _jsx("p", { className: "text-sm mt-1", children: "Revenue will appear here after your first successful purchase." })] }) })] }));
    }
    // Group by day for the last 7 days (or just all available days)
    const groupedData = {};
    // Sort ascending by date for chart
    const sortedOrders = [...successfulOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    sortedOrders.forEach((o) => {
        const date = new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        if (!groupedData[date]) {
            groupedData[date] = { revenue: 0, profit: 0 };
        }
        groupedData[date].revenue += o.sellingPriceSnapshot;
        groupedData[date].profit += o.profitSnapshot;
    });
    const chartData = Object.keys(groupedData).map((date) => ({
        date,
        revenue: groupedData[date].revenue,
        profit: groupedData[date].profit,
    }));
    // If there's only one data point, add a dummy one with 0 to make it render a line
    if (chartData.length === 1) {
        chartData.unshift({ date: "Previous", revenue: 0, profit: 0 });
    }
    return (_jsxs(Card, { className: "h-full flex flex-col", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Revenue Overview" }) }), _jsx(CardContent, { className: "flex-1 pb-4", children: _jsx("div", { className: "h-[300px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: chartData, margin: { top: 10, right: 10, left: -20, bottom: 0 }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "colorRevenue", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "hsl(var(--primary))", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "hsl(var(--primary))", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "colorProfit", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "hsl(var(--muted-foreground))", stopOpacity: 0.2 }), _jsx("stop", { offset: "95%", stopColor: "hsl(var(--muted-foreground))", stopOpacity: 0 })] })] }), _jsx(XAxis, { dataKey: "date", axisLine: false, tickLine: false, tick: { fontSize: 12, fill: "hsl(var(--muted-foreground))" }, dy: 10 }), _jsx(YAxis, { axisLine: false, tickLine: false, tick: { fontSize: 12, fill: "hsl(var(--muted-foreground))" }, tickFormatter: (value) => `GHS ${value}` }), _jsx(CartesianGrid, { vertical: false, stroke: "hsl(var(--border))", strokeDasharray: "4 4" }), _jsx(Tooltip, { content: ({ active, payload, label }) => {
                                        var _a, _b;
                                        if (active && payload && payload.length) {
                                            return (_jsxs("div", { className: "rounded-lg border bg-background p-3 shadow-md", children: [_jsx("div", { className: "mb-2 text-sm font-semibold", children: label }), _jsxs("div", { className: "flex flex-col gap-1 text-sm", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-primary" }), _jsx("span", { className: "text-muted-foreground", children: "Revenue" })] }), _jsxs("span", { className: "font-medium", children: ["GHS ", (_a = payload[0].value) === null || _a === void 0 ? void 0 : _a.toLocaleString()] })] }), _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-muted-foreground" }), _jsx("span", { className: "text-muted-foreground", children: "Profit" })] }), _jsxs("span", { className: "font-medium", children: ["GHS ", (_b = payload[1].value) === null || _b === void 0 ? void 0 : _b.toLocaleString()] })] })] })] }));
                                        }
                                        return null;
                                    } }), _jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "hsl(var(--primary))", strokeWidth: 2, fillOpacity: 1, fill: "url(#colorRevenue)", activeDot: { r: 6, fill: "hsl(var(--primary))" } }), _jsx(Area, { type: "monotone", dataKey: "profit", stroke: "hsl(var(--muted-foreground))", strokeWidth: 2, fillOpacity: 1, fill: "url(#colorProfit)" })] }) }) }) })] }));
}
