import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
const fulfillmentColors = {
    SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
    PROCESSING: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
    PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
    REFUND_PENDING: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
    REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
};
export function RecentOrdersWidget({ orders, networks }) {
    // Sort descending by date, take first 5
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    if (recentOrders.length === 0) {
        return (_jsxs(Card, { className: "h-full flex flex-col", children: [_jsx(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: _jsxs("div", { className: "space-y-1", children: [_jsx(CardTitle, { children: "Recent Orders" }), _jsx(CardDescription, { children: "Latest customer transactions" })] }) }), _jsx(CardContent, { className: "flex-1 flex items-center justify-center pt-6", children: _jsx("div", { className: "text-center text-muted-foreground text-sm", children: "No orders yet." }) })] }));
    }
    return (_jsxs(Card, { className: "h-full flex flex-col", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(CardTitle, { children: "Recent Orders" }), _jsx(CardDescription, { children: "Latest customer transactions" })] }), _jsxs(Link, { href: "/admin/orders", className: "text-sm font-medium text-primary flex items-center hover:underline", children: ["View all ", _jsx(ArrowRightIcon, { className: "ml-1 size-4" })] })] }), _jsx(CardContent, { className: "flex-1", children: _jsx("div", { className: "space-y-4 pt-4", children: recentOrders.map((order) => {
                        const net = networks.find(n => n.id === order.networkId);
                        // Mask phone number partially for privacy
                        const maskedPhone = order.recipientPhone.length > 6
                            ? `${order.recipientPhone.substring(0, 5)} ••••`
                            : order.recipientPhone;
                        return (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [net && (_jsx("div", { className: "w-1.5 h-10 rounded-full", style: { backgroundColor: net.color } })), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium leading-none mb-1", children: maskedPhone }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [net === null || net === void 0 ? void 0 : net.name, " \u2022 ", order.dataSizeSnapshot] })] })] }), _jsxs("div", { className: "flex items-center gap-4 text-right", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium", children: ["GHS ", order.sellingPriceSnapshot.toFixed(2)] }), _jsx("div", { className: "text-xs text-muted-foreground", children: new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })] }), _jsx(Badge, { variant: "secondary", className: cn("bg-opacity-10 hidden sm:inline-flex text-[10px] tracking-wider font-bold", fulfillmentColors[(order.fulfillmentStatus || "").toUpperCase()] || ""), children: (order.fulfillmentStatus || "").toUpperCase() === "DELIVERED" ? "Delivered" : order.fulfillmentStatus })] })] }, order.id));
                    }) }) })] }));
}
