"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { decodeCursorState, encodeCursorState } from "@/lib/pagination";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SearchIcon, ChevronRightIcon, FilterIcon } from "lucide-react";
import { OrderDetailDrawer } from "@/components/admin/order-detail-drawer";
const PAYMENT_COLORS = {
    SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
    PAID: "text-green-600 bg-green-500/10 dark:text-green-400",
    PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
    REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
    NOT_APPLICABLE: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
};
const FULFILLMENT_COLORS = {
    SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
    PROCESSING: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
    ON_HOLD: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
    REFUND_PENDING: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
    REFUNDED: "text-slate-600 bg-slate-500/10 dark:text-slate-400",
};
const FULFILLMENT_LABELS = {
    PROCESSING: "Processing",
    ON_HOLD: "On Hold",
    SUCCESS: "Delivered",
    FAILED: "Failed",
    REFUNDED: "Refunded",
    PENDING: "Pending",
    REFUND_PENDING: "Refund Pending",
};
const PAYMENT_LABELS = {
    SUCCESS: "Paid",
    PAID: "Paid",
    PENDING: "Pending",
    FAILED: "Failed",
    REFUNDED: "Refunded",
    NOT_APPLICABLE: "N/A",
};
function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString("en-GB", {
            timeZone: "Africa/Accra",
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    }
    catch (_a) {
        return "—";
    }
}
export function AdminOrdersTable({ initialOrders, networks, currentPage, hasNextPage, nextCursor, }) {
    const [query, setQuery] = useState("");
    // Filters
    const [paymentFilter, setPaymentFilter] = useState("OPERATIONAL"); // OPERATIONAL, ALL, PENDING, FAILED, REFUNDED
    const [networkFilter, setNetworkFilter] = useState("ALL");
    const [fulfillmentFilter, setFulfillmentFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("ALL");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [orders, setOrders] = useState(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);
    // Auto-refresh loop removed (Phase 1 of the Firestore read audit): this
    // previously called router.refresh() every 10s, which re-rendered the entire
    // admin server component and re-read the whole /orders + /networks
    // collections each time. Data now refreshes via explicit actions (e.g.
    // handleOrderUpdated after a status mutation) or a full page navigation.
    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setDrawerOpen(true);
    };
    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setTimeout(() => setSelectedOrder(null), 300);
    };
    const handleOrderUpdated = useCallback((updated) => {
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        setSelectedOrder(updated);
        router.refresh();
    }, [router]);
    const changePage = useCallback((nextPage) => {
        const params = new URLSearchParams(searchParams.toString());
        const safePage = Math.max(1, nextPage);
        const cursorState = decodeCursorState(params.get("cursor"));
        if (safePage <= 1) {
            params.delete("page");
            params.delete("cursor");
        }
        else {
            params.set("page", String(safePage));
            if (safePage === currentPage + 1 && nextCursor) {
                const nextCursorState = [...cursorState, nextCursor];
                params.set("cursor", encodeCursorState(nextCursorState));
            }
            else if (safePage < currentPage) {
                const previousCursorState = cursorState.slice(0, Math.max(0, safePage - 1));
                if (previousCursorState.length > 0) {
                    params.set("cursor", encodeCursorState(previousCursorState));
                }
                else {
                    params.delete("cursor");
                }
            }
        }
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }, [currentPage, nextCursor, pathname, router, searchParams]);
    const filtered = useMemo(() => {
        const sorted = [...orders].sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
        });
        const normalizedQuery = query.toLowerCase();
        // Calculate Date Boundaries using Ghana time (UTC+0)
        const now = new Date();
        // Helper to get start of day in UTC (Ghana time)
        const getStartOfDayUTC = (d) => {
            const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
            return utc.getTime();
        };
        let fromTime = 0;
        let toTime = Infinity;
        if (dateFilter === "TODAY") {
            fromTime = getStartOfDayUTC(now);
        }
        else if (dateFilter === "YESTERDAY") {
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            fromTime = getStartOfDayUTC(yesterday);
            toTime = getStartOfDayUTC(now) - 1;
        }
        else if (dateFilter === "7DAYS") {
            const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            fromTime = getStartOfDayUTC(past);
        }
        else if (dateFilter === "30DAYS") {
            const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            fromTime = getStartOfDayUTC(past);
        }
        else if (dateFilter === "CUSTOM") {
            if (dateFrom) {
                const [y, m, d] = dateFrom.split("-").map(Number);
                fromTime = Date.UTC(y, m - 1, d);
            }
            if (dateTo) {
                const [y, m, d] = dateTo.split("-").map(Number);
                toTime = Date.UTC(y, m - 1, d, 23, 59, 59, 999);
            }
        }
        return sorted.filter((o) => {
            var _a, _b, _c;
            // 1. Text Search
            if (normalizedQuery) {
                const ref = ((_a = o.publicReference) !== null && _a !== void 0 ? _a : "").toLowerCase();
                const phone = ((_b = o.recipientPhone) !== null && _b !== void 0 ? _b : "").toLowerCase();
                const netObj = networks.find((n) => n.id === o.networkId);
                const netName = ((_c = netObj === null || netObj === void 0 ? void 0 : netObj.name) !== null && _c !== void 0 ? _c : "").toLowerCase();
                if (!ref.includes(normalizedQuery) && !phone.includes(normalizedQuery) && !netName.includes(normalizedQuery)) {
                    return false;
                }
            }
            // 2. Payment Filter (Default Operational)
            const pStatus = (o.paymentStatus || "").toUpperCase();
            if (paymentFilter === "OPERATIONAL") {
                if (pStatus !== "SUCCESS" && pStatus !== "PAID" && pStatus !== "NOT_APPLICABLE")
                    return false;
            }
            else if (paymentFilter !== "ALL") {
                if (pStatus !== paymentFilter && !(paymentFilter === "SUCCESS" && pStatus === "PAID"))
                    return false;
            }
            // 3. Network Filter
            if (networkFilter !== "ALL") {
                const netObj = networks.find((n) => n.id === o.networkId);
                if (networkFilter === "MTN" && (netObj === null || netObj === void 0 ? void 0 : netObj.name.toLowerCase()) !== "mtn")
                    return false;
                if (networkFilter === "TELECEL" && (netObj === null || netObj === void 0 ? void 0 : netObj.name.toLowerCase()) !== "telecel")
                    return false;
                if (networkFilter === "AIRTELTIGO" && (netObj === null || netObj === void 0 ? void 0 : netObj.name.toLowerCase()) !== "airteltigo")
                    return false;
            }
            // 4. Fulfillment Filter
            if (fulfillmentFilter !== "ALL") {
                const fStatus = (o.fulfillmentStatus || "").toUpperCase();
                if (fStatus !== fulfillmentFilter && !(fulfillmentFilter === "SUCCESS" && fStatus === "DELIVERED"))
                    return false;
            }
            // 5. Date Filter
            if (dateFilter !== "ALL") {
                const orderTime = new Date(o.createdAt).getTime();
                if (orderTime < fromTime || orderTime > toTime)
                    return false;
            }
            return true;
        });
    }, [orders, query, networks, paymentFilter, networkFilter, fulfillmentFilter, dateFilter, dateFrom, dateTo]);
    return (_jsxs(_Fragment, { children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-0", children: [_jsxs("div", { className: "p-4 border-b space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between", children: [_jsxs("div", { className: "relative max-w-sm flex-1", children: [_jsx(SearchIcon, { className: "absolute left-3 top-2.5 size-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by reference, phone, network\u2026", className: "pl-9 h-9", value: query, onChange: (e) => setQuery(e.target.value) })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(FilterIcon, { className: "size-4" }), _jsx("span", { className: "font-medium", children: "Filters" })] })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsxs("select", { className: "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: paymentFilter, onChange: (e) => setPaymentFilter(e.target.value), children: [_jsx("option", { value: "OPERATIONAL", children: "Payment: Paid (Operational)" }), _jsx("option", { value: "ALL", children: "Payment: All Attempts" }), _jsx("option", { value: "PENDING", children: "Payment: Unpaid/Pending" }), _jsx("option", { value: "FAILED", children: "Payment: Failed" }), _jsx("option", { value: "REFUNDED", children: "Payment: Refunded" })] }), _jsxs("select", { className: "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: networkFilter, onChange: (e) => setNetworkFilter(e.target.value), children: [_jsx("option", { value: "ALL", children: "Network: All" }), _jsx("option", { value: "MTN", children: "MTN" }), _jsx("option", { value: "TELECEL", children: "Telecel" }), _jsx("option", { value: "AIRTELTIGO", children: "AirtelTigo" })] }), _jsxs("select", { className: "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: fulfillmentFilter, onChange: (e) => setFulfillmentFilter(e.target.value), children: [_jsx("option", { value: "ALL", children: "Fulfillment: All" }), _jsx("option", { value: "PROCESSING", children: "Processing" }), _jsx("option", { value: "ON_HOLD", children: "On Hold" }), _jsx("option", { value: "SUCCESS", children: "Delivered" }), _jsx("option", { value: "FAILED", children: "Failed" }), _jsx("option", { value: "REFUNDED", children: "Refunded" })] }), _jsxs("select", { className: "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm", value: dateFilter, onChange: (e) => setDateFilter(e.target.value), children: [_jsx("option", { value: "ALL", children: "Date: All Time" }), _jsx("option", { value: "TODAY", children: "Today" }), _jsx("option", { value: "YESTERDAY", children: "Yesterday" }), _jsx("option", { value: "7DAYS", children: "Last 7 Days" }), _jsx("option", { value: "30DAYS", children: "Last 30 Days" }), _jsx("option", { value: "CUSTOM", children: "Custom Range" })] }), dateFilter === "CUSTOM" && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { type: "date", className: "h-9 w-auto", value: dateFrom, onChange: (e) => setDateFrom(e.target.value) }), _jsx("span", { className: "text-muted-foreground text-sm", children: "to" }), _jsx(Input, { type: "date", className: "h-9 w-auto", value: dateTo, onChange: (e) => setDateTo(e.target.value) })] }))] })] }), _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider", children: [_jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Reference" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Phone" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Network" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Bundle" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Amount" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Payment" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Delivery" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Date" }), _jsx("th", { className: "px-4 py-3 w-4" })] }) }), _jsx("tbody", { children: filtered.map((order, i) => {
                                                var _a, _b, _c, _d, _e, _f;
                                                const net = networks.find((n) => n.id === order.networkId);
                                                return (_jsxs("tr", { onClick: () => handleRowClick(order), className: cn("border-b last:border-0 hover:bg-primary/5 transition-colors cursor-pointer group", i % 2 === 0 ? "" : "bg-muted/10", (order.paymentStatus || "").toUpperCase() === "PENDING" ? "opacity-50" : ""), children: [_jsx("td", { className: "px-4 py-3 font-mono font-medium", children: _jsxs("div", { className: "flex items-center gap-2", children: [order.publicReference, order.source === "MANUAL" && (_jsx(Badge, { variant: "outline", className: "text-[9px] uppercase h-5 px-1 bg-slate-100 text-slate-500", children: "Manual" }))] }) }), _jsx("td", { className: "px-4 py-3 text-muted-foreground font-mono text-xs", children: order.recipientPhone }), _jsx("td", { className: "px-4 py-3", children: _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "w-2 h-2 rounded-full inline-block shrink-0", style: { backgroundColor: (_a = net === null || net === void 0 ? void 0 : net.color) !== null && _a !== void 0 ? _a : "#ccc" } }), (_b = net === null || net === void 0 ? void 0 : net.name) !== null && _b !== void 0 ? _b : order.networkId] }) }), _jsx("td", { className: "px-4 py-3 text-muted-foreground", children: order.dataSizeSnapshot }), _jsxs("td", { className: "px-4 py-3 text-right font-semibold", children: ["GHS ", (_d = (_c = order.sellingPriceSnapshot) === null || _c === void 0 ? void 0 : _c.toFixed(2)) !== null && _d !== void 0 ? _d : "—"] }), _jsx("td", { className: "px-4 py-3", children: _jsx(Badge, { variant: "secondary", className: cn("text-[10px] font-bold tracking-wider", PAYMENT_COLORS[(order.paymentStatus || "").toUpperCase()] || ""), children: PAYMENT_LABELS[(order.paymentStatus || "").toUpperCase()] || order.paymentStatus }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex flex-col items-start gap-1", children: [_jsx(Badge, { variant: "secondary", className: cn("text-[10px] font-bold tracking-wider", FULFILLMENT_COLORS[(order.fulfillmentStatus || "").toUpperCase()] || (((_e = order.fulfillmentStatus) === null || _e === void 0 ? void 0 : _e.toUpperCase()) === "DELIVERED" ? FULFILLMENT_COLORS["SUCCESS"] : "")), children: FULFILLMENT_LABELS[(order.fulfillmentStatus || "").toUpperCase()] || (((_f = order.fulfillmentStatus) === null || _f === void 0 ? void 0 : _f.toUpperCase()) === "DELIVERED" ? FULFILLMENT_LABELS["SUCCESS"] : order.fulfillmentStatus) }), (order.fulfillmentProviderReference || order.providerReference) && (_jsx("span", { className: "text-[10px] text-muted-foreground font-mono", children: order.fulfillmentProviderReference || order.providerReference }))] }) }), _jsx("td", { className: "px-4 py-3 text-muted-foreground whitespace-nowrap text-xs", children: formatDate(order.createdAt) }), _jsx("td", { className: "px-4 py-3 text-muted-foreground group-hover:text-foreground transition-colors", children: _jsx(ChevronRightIcon, { className: "size-4" }) })] }, order.id));
                                            }) })] }), filtered.length === 0 && (_jsx("div", { className: "py-16 text-center text-muted-foreground text-sm", children: query ? "No orders match your filters/search." : "No orders found." }))] })] }) }), _jsxs("div", { className: "flex items-center justify-between border-t bg-muted/20 px-4 py-3", children: [_jsxs("div", { className: "text-xs text-muted-foreground", children: ["Page ", currentPage] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => changePage(currentPage - 1), disabled: currentPage <= 1, className: "h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50", children: "Previous" }), _jsx("button", { type: "button", onClick: () => changePage(currentPage + 1), disabled: !hasNextPage, className: "h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50", children: "Next" })] })] }), _jsx(OrderDetailDrawer, { order: selectedOrder, networks: networks, open: drawerOpen, onClose: handleDrawerClose, onOrderUpdated: handleOrderUpdated })] }));
}
