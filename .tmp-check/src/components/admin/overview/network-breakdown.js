import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function NetworkBreakdown({ stats }) {
    const maxOrders = Math.max(...stats.map(n => n.orders), 1);
    if (stats.length === 0 || stats.every((stat) => stat.orders === 0)) {
        return (_jsxs(Card, { className: "h-full flex flex-col", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Network Breakdown" }) }), _jsx(CardContent, { className: "flex-1 flex items-center justify-center", children: _jsx("div", { className: "text-center text-muted-foreground text-sm", children: "No successful orders to break down yet." }) })] }));
    }
    return (_jsxs(Card, { className: "h-full flex flex-col", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Network Breakdown" }) }), _jsx(CardContent, { className: "flex-1", children: _jsx("div", { className: "flex flex-col gap-6", children: stats.map((stat) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "size-3 rounded-full", style: { backgroundColor: stat.color } }), _jsx("span", { className: "font-medium", children: stat.network })] }), _jsxs("div", { className: "font-medium", children: [stat.orders, " ", _jsx("span", { className: "text-muted-foreground font-normal", children: "orders" })] })] }), _jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-muted", children: _jsx("div", { className: "h-full rounded-full transition-all", style: {
                                        backgroundColor: stat.color,
                                        width: `${(stat.orders / maxOrders) * 100}%`
                                    } }) }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["GHS ", stat.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), " revenue"] })] }, stat.network))) }) })] }));
}
