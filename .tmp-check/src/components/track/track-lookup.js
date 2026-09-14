"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PhoneIcon, SearchIcon, Loader2Icon, ArrowRightIcon, XIcon, CheckCircle2Icon, AlertCircleIcon, ClockIcon, PackageSearchIcon, } from "lucide-react";
// Network colors for the visual indicator
const NETWORK_COLORS = {
    mtn: "#FFCC00",
    telecel: "#E20010",
    airteltigo: "#0032A0",
};
const NETWORK_NAMES = {
    mtn: "MTN",
    telecel: "Telecel",
    airteltigo: "AirtelTigo",
};
function formatDate(iso) {
    if (!iso)
        return "—";
    try {
        return new Intl.DateTimeFormat("en-GH", {
            year: "numeric", month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit",
        }).format(new Date(iso));
    }
    catch (_a) {
        return iso;
    }
}
function PaymentStatusBadge({ status }) {
    const s = status.toUpperCase();
    return (_jsx(Badge, { variant: "secondary", className: cn("capitalize text-xs font-semibold", s === "SUCCESS" ? "text-green-600 bg-green-500/10 dark:text-green-400" :
            s === "FAILED" ? "text-red-600 bg-red-500/10 dark:text-red-400" :
                "text-amber-600 bg-amber-500/10 dark:text-amber-400"), children: s === "SUCCESS" ? "Paid" : s === "FAILED" ? "Failed" : "Pending" }));
}
function FulfillmentStatusBadge({ status }) {
    const s = status.toUpperCase();
    return (_jsx(Badge, { variant: "secondary", className: cn("capitalize text-xs font-semibold text-center leading-tight whitespace-nowrap", (s === "SUCCESS" || s === "DELIVERED") ? "text-green-600 bg-green-500/10 dark:text-green-400" :
            s === "FAILED" ? "text-red-600 bg-red-500/10 dark:text-red-400" :
                s === "PROCESSING" ? "text-blue-600 bg-blue-500/10 dark:text-blue-400" :
                    s === "ON_HOLD" ? "text-purple-600 bg-purple-500/10 dark:text-purple-400" :
                        s === "REFUNDED" ? "text-slate-600 bg-slate-500/10 dark:text-slate-400" :
                            "text-amber-600 bg-amber-500/10 dark:text-amber-400"), children: s === "SUCCESS" || s === "DELIVERED" ? "Delivered" :
            s === "FAILED" ? "Delivery failed" :
                s === "PROCESSING" ? "Processing" :
                    s === "ON_HOLD" ? "Verification in progress" :
                        s === "REFUNDED" ? "Refunded" : "Pending" }));
}
export function TrackLookup() {
    var _a, _b;
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchedPhone, setSearchedPhone] = useState("");
    const handlePhoneChange = (e) => {
        // Allow +, digits, spaces and dashes
        setPhone(e.target.value.replace(/[^\d+\s-]/g, ""));
    };
    const handleSearch = async (e) => {
        var _a, _b;
        e.preventDefault();
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length < 9)
            return;
        setIsLoading(true);
        setError(null);
        setResults(null);
        setSelectedOrder(null);
        try {
            const res = await fetch(`/api/track?phone=${encodeURIComponent(phone)}`);
            const data = await res.json();
            if (!res.ok) {
                setError((_a = data === null || data === void 0 ? void 0 : data.error) !== null && _a !== void 0 ? _a : "Unable to retrieve orders right now.");
                return;
            }
            setSearchedPhone(phone);
            setResults((_b = data.orders) !== null && _b !== void 0 ? _b : []);
        }
        catch (_c) {
            setError("Unable to retrieve orders right now. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Called by LiveDeliveryTracker when DataMart status has changed in Firestore.
    // Silently re-fetches orders and updates selectedOrder so the panel refreshes.
    const refreshOrders = async (updatedRef) => {
        var _a;
        try {
            const res = await fetch(`/api/track?phone=${encodeURIComponent(searchedPhone)}`);
            if (!res.ok)
                return;
            const data = await res.json();
            const freshOrders = (_a = data.orders) !== null && _a !== void 0 ? _a : [];
            setResults(freshOrders);
            // Re-select the same order with the fresh data
            const fresh = freshOrders.find((o) => o.orderReference === updatedRef);
            if (fresh)
                setSelectedOrder(fresh);
        }
        catch (_b) {
            // Silent — don't surface a refresh error to the user
        }
    };
    const resetSearch = () => {
        setResults(null);
        setError(null);
        setPhone("");
        setSelectedOrder(null);
        setSearchedPhone("");
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-12 md:py-24", children: [_jsx(AnimatePresence, { mode: "wait", children: results === null ? (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "max-w-md mx-auto", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight mb-3", children: "Track your order" }), _jsx("p", { className: "text-muted-foreground", children: "Enter the phone number you used to purchase your data bundle." })] }), _jsx(Card, { className: "border-border/50 shadow-xl bg-card/50 backdrop-blur-sm", children: _jsx(CardContent, { className: "p-6", children: _jsxs("form", { onSubmit: handleSearch, className: "flex flex-col gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(PhoneIcon, { className: "absolute left-3.5 top-3.5 size-5 text-muted-foreground" }), _jsx(Input, { type: "tel", placeholder: "e.g. 0241234567 or +233241234567", className: "pl-11 h-12 text-lg", value: phone, onChange: handlePhoneChange, disabled: isLoading })] }), error && (_jsxs(motion.p, { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, className: "text-sm text-red-500 flex items-center gap-2", children: [_jsx(AlertCircleIcon, { className: "size-4 shrink-0" }), error] })), _jsx(Button, { type: "submit", size: "lg", className: "h-12 text-base", disabled: phone.replace(/\D/g, "").length < 9 || isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2Icon, { className: "mr-2 size-5 animate-spin" }), "Searching..."] })) : (_jsxs(_Fragment, { children: [_jsx(SearchIcon, { className: "mr-2 size-5" }), "Find my orders"] })) })] }) }) })] }, "search-form")) : (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-3xl mx-auto", children: [_jsxs("div", { className: "mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold tracking-tight mb-1", children: ["Orders for ", searchedPhone] }), _jsx("p", { className: "text-muted-foreground", children: results.length === 0
                                                ? "No orders found for this number."
                                                : `${results.length} order${results.length !== 1 ? "s" : ""} found` })] }), _jsx(Button, { variant: "outline", onClick: resetSearch, children: "New Search" })] }), results.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, className: "text-center py-20", children: [_jsx(PackageSearchIcon, { className: "size-16 mx-auto text-muted-foreground/40 mb-4" }), _jsx("p", { className: "text-lg font-medium text-muted-foreground", children: "No orders found for this number." }), _jsx("p", { className: "text-sm text-muted-foreground/70 mt-1", children: "Make sure you entered the exact number used during purchase." })] })) : (_jsx("div", { className: "space-y-4", children: results.map((order, i) => {
                                var _a, _b;
                                const color = (_a = NETWORK_COLORS[order.network]) !== null && _a !== void 0 ? _a : "#888";
                                const netName = (_b = NETWORK_NAMES[order.network]) !== null && _b !== void 0 ? _b : order.network;
                                return (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 }, whileHover: { scale: 1.01 }, whileTap: { scale: 0.99 }, onClick: () => setSelectedOrder(order), className: "cursor-pointer", children: _jsx(Card, { className: "overflow-hidden border-border/50 hover:border-primary/30 transition-colors bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md group", children: _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-6 relative", children: [_jsx("div", { className: "absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block", children: _jsx(ArrowRightIcon, { className: "size-5 text-primary" }) }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-semibold text-muted-foreground font-mono", children: order.orderReference }), _jsx("span", { className: "text-muted-foreground/50 text-xs", children: "\u2022" }), _jsx("span", { className: "text-sm text-muted-foreground", children: formatDate(order.createdAt) })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-1.5 h-8 rounded-full", style: { backgroundColor: color } }), _jsxs("div", { children: [_jsx("div", { className: "font-bold text-lg", children: order.bundleSize }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [netName, " Data"] })] })] })] }), _jsxs("div", { className: "md:w-32 md:text-right", children: [_jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Amount paid" }), _jsxs("div", { className: "font-bold", children: ["GHS ", order.amount.toFixed(2)] })] }), _jsxs("div", { className: "flex flex-row md:flex-col gap-2 md:w-32 md:items-end", children: [_jsx(PaymentStatusBadge, { status: order.paymentStatus }), _jsx(FulfillmentStatusBadge, { status: order.fulfillmentStatus })] })] }) }) }) }, order.id));
                            }) }))] }, "results")) }), _jsx(AnimatePresence, { children: selectedOrder && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setSelectedOrder(null), className: "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, x: "100%", scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: "100%", scale: 0.95 }, transition: { type: "spring", damping: 25, stiffness: 200 }, className: "fixed top-0 right-0 bottom-0 z-50 w-full md:w-[450px] bg-card border-l shadow-2xl flex flex-col", children: [_jsxs("div", { className: "p-6 flex items-center justify-between border-b", children: [_jsx("h2", { className: "text-xl font-bold", children: "Order Details" }), _jsx(Button, { variant: "ghost", size: "icon", className: "rounded-full", onClick: () => setSelectedOrder(null), children: _jsx(XIcon, { className: "size-5" }) })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-6 space-y-8", children: [_jsxs("div", { className: "flex items-center gap-4", children: [(selectedOrder.fulfillmentStatus === "SUCCESS" || selectedOrder.fulfillmentStatus === "DELIVERED") ? (_jsx("div", { className: "size-16 rounded-full bg-green-500/10 flex items-center justify-center shrink-0", children: _jsx(CheckCircle2Icon, { className: "size-8 text-green-600 dark:text-green-400" }) })) : selectedOrder.fulfillmentStatus === "FAILED" ? (_jsx("div", { className: "size-16 rounded-full bg-red-500/10 flex items-center justify-center shrink-0", children: _jsx(AlertCircleIcon, { className: "size-8 text-red-600 dark:text-red-400" }) })) : selectedOrder.fulfillmentStatus === "ON_HOLD" ? (_jsx("div", { className: "size-16 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0", children: _jsx(ClockIcon, { className: "size-8 text-purple-600 dark:text-purple-400 animate-pulse" }) })) : (_jsx("div", { className: "size-16 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0", children: _jsx(ClockIcon, { className: "size-8 text-amber-600 dark:text-amber-400 animate-pulse" }) })), _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold capitalize", children: (selectedOrder.fulfillmentStatus === "SUCCESS" || selectedOrder.fulfillmentStatus === "DELIVERED") ? "Delivered" :
                                                                selectedOrder.fulfillmentStatus === "PROCESSING" ? "Processing" :
                                                                    selectedOrder.fulfillmentStatus === "ON_HOLD" ? "Verification in progress" :
                                                                        selectedOrder.fulfillmentStatus === "FAILED" ? "Delivery failed" : "Pending" }), _jsx("p", { className: "text-muted-foreground text-sm", children: formatDate(selectedOrder.createdAt) })] })] }), _jsxs("div", { className: "bg-muted/30 border rounded-xl p-5 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center pb-4 border-b", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Order Ref" }), _jsx("span", { className: "font-mono text-sm", children: selectedOrder.orderReference })] }), _jsxs("div", { className: "flex justify-between items-center pb-4 border-b", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Recipient" }), _jsx("span", { className: "font-medium", children: selectedOrder.recipientPhoneMasked })] }), _jsxs("div", { className: "flex justify-between items-center pb-4 border-b", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Network" }), _jsxs("span", { className: "font-medium flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full", style: { backgroundColor: (_a = NETWORK_COLORS[selectedOrder.network]) !== null && _a !== void 0 ? _a : "#888" } }), (_b = NETWORK_NAMES[selectedOrder.network]) !== null && _b !== void 0 ? _b : selectedOrder.network] })] }), _jsxs("div", { className: "flex justify-between items-center pb-4 border-b", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Bundle" }), _jsx("span", { className: "font-medium", children: selectedOrder.bundleSize })] }), _jsxs("div", { className: "flex justify-between items-center pb-4 border-b", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Payment" }), _jsx(PaymentStatusBadge, { status: selectedOrder.paymentStatus })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-muted-foreground text-sm", children: "Total Paid" }), _jsxs("span", { className: "font-bold", children: ["GHS ", selectedOrder.amount.toFixed(2)] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-semibold text-sm uppercase tracking-wider text-muted-foreground", children: "Timeline" }), _jsxs("div", { className: "relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-2.5 before:w-px before:bg-border", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute -left-6 top-1 size-3 rounded-full bg-primary ring-4 ring-background" }), _jsx("p", { className: "font-medium text-sm", children: "Order Created" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Payment initiated via Paystack" })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: cn("absolute -left-6 top-1 size-3 rounded-full ring-4 ring-background", selectedOrder.paymentStatus === "SUCCESS" ? "bg-primary" : "bg-muted") }), _jsx("p", { className: "font-medium text-sm", children: "Payment Confirmed" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: selectedOrder.paymentStatus === "SUCCESS"
                                                                        ? `GHS ${selectedOrder.amount.toFixed(2)} received`
                                                                        : selectedOrder.paymentStatus === "FAILED"
                                                                            ? "Payment was not completed"
                                                                            : "Awaiting payment confirmation" })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: cn("absolute -left-6 top-1 size-3 rounded-full ring-4 ring-background", (selectedOrder.fulfillmentStatus === "SUCCESS" || selectedOrder.fulfillmentStatus === "DELIVERED") ? "bg-green-500" :
                                                                        selectedOrder.fulfillmentStatus === "FAILED" ? "bg-red-500" :
                                                                            selectedOrder.fulfillmentStatus === "ON_HOLD" ? "bg-purple-500" :
                                                                                selectedOrder.fulfillmentStatus === "PROCESSING" ? "bg-blue-500" : "bg-muted") }), _jsx("p", { className: "font-medium text-sm", children: "Data Delivery" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: (selectedOrder.fulfillmentStatus === "SUCCESS" || selectedOrder.fulfillmentStatus === "DELIVERED") ? "Bundle successfully credited to recipient" :
                                                                        selectedOrder.fulfillmentStatus === "FAILED" ? "Network rejected the top-up request" :
                                                                            selectedOrder.fulfillmentStatus === "ON_HOLD" ? "Delivery is temporarily on hold while the network verifies the recipient. You don't need to reorder or pay again." :
                                                                                selectedOrder.fulfillmentStatus === "PROCESSING" ? "Bundle is being sent to recipient" :
                                                                                    "Awaiting confirmation from network" })] })] })] }), (selectedOrder.fulfillmentStatus === "PROCESSING" || selectedOrder.fulfillmentStatus === "ON_HOLD") && (_jsx(LiveDeliveryTracker, { publicReference: selectedOrder.orderReference, currentStatus: selectedOrder.fulfillmentStatus, onStatusChanged: (ref) => refreshOrders(ref) }))] }), _jsx("div", { className: "p-6 border-t bg-muted/10", children: _jsx(Button, { className: "w-full", variant: "outline", onClick: () => setSelectedOrder(null), children: "Close" }) })] })] })) })] }));
}
function LiveDeliveryTracker({ publicReference, currentStatus, onStatusChanged, }) {
    const [data, setData] = useState(null);
    const notifiedRef = useRef(false);
    useEffect(() => {
        let active = true;
        notifiedRef.current = false;
        const isTerminal = (s) => s === "SUCCESS" || s === "FAILED" || s === "REFUNDED";
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/track/delivery?reference=${encodeURIComponent(publicReference)}`);
                const json = await res.json();
                if (!active)
                    return null;
                setData(json);
                // If BundleUp Firestore status changed (e.g. PROCESSING to ON_HOLD to
                // SUCCESS), notify the parent to re-fetch the order panel exactly once.
                if (json.bundleupStatus &&
                    json.bundleupStatus !== currentStatus &&
                    !notifiedRef.current) {
                    notifiedRef.current = true;
                    onStatusChanged(publicReference);
                }
                return json;
            }
            catch (_a) {
                return null;
            }
        };
        let int;
        const tick = async () => {
            // Stop polling once delivery reaches a terminal state so we no longer
            // issue a Firestore read every 5s for completed/failed orders.
            const json = await fetchStatus();
            if (isTerminal(json === null || json === void 0 ? void 0 : json.bundleupStatus)) {
                if (int)
                    clearInterval(int);
            }
        };
        // Poll once immediately, then keep polling every 5s until the order is terminal.
        tick();
        int = setInterval(tick, 5000);
        return () => {
            active = false;
            if (int)
                clearInterval(int);
        };
    }, [publicReference, currentStatus, onStatusChanged]);
    const isTerminal = (data === null || data === void 0 ? void 0 : data.bundleupStatus) === "SUCCESS" || (data === null || data === void 0 ? void 0 : data.bundleupStatus) === "FAILED" || (data === null || data === void 0 ? void 0 : data.bundleupStatus) === "REFUNDED";
    return (_jsxs("div", { className: cn("p-4 border rounded-xl space-y-3 relative overflow-hidden", isTerminal ? "border-green-500/20 bg-green-500/5" : "border-blue-500/20 bg-blue-500/5"), children: [_jsx("div", { className: "absolute top-0 right-0 p-4", children: _jsxs("span", { className: "relative flex h-3 w-3", children: [_jsx("span", { className: cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isTerminal ? "bg-green-400" : "bg-blue-400") }), _jsx("span", { className: cn("relative inline-flex rounded-full h-3 w-3", isTerminal ? "bg-green-500" : "bg-blue-500") })] }) }), _jsxs("h4", { className: cn("font-semibold text-sm flex items-center gap-2", isTerminal ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"), children: [_jsx(PackageSearchIcon, { className: "size-4" }), "Live Delivery Network"] }), _jsx("div", { className: "text-xs text-muted-foreground", children: data ? (_jsx(_Fragment, { children: data.trackerStatus === "error" || data.trackerStatus === "unavailable" ? (_jsx("span", { className: "text-amber-500", children: data.trackerMessage || "Connecting to telecom provider..." })) : (_jsxs(_Fragment, { children: ["Network status:", " ", _jsx("span", { className: "font-medium text-foreground", children: data.bundleupStatus === "ON_HOLD"
                                    ? "On hold — verifying number"
                                    : data.bundleupStatus === "SUCCESS"
                                        ? "Delivered"
                                        : data.bundleupStatus === "PROCESSING"
                                            ? "Processing"
                                            : data.bundleupStatus === "FAILED"
                                                ? "Failed"
                                                : data.bundleupStatus === "REFUNDED"
                                                    ? "Refunded"
                                                    : "Checking..." }), data.trackerMessage && _jsxs(_Fragment, { children: [_jsx("br", {}), _jsx("span", { className: "opacity-70 mt-1 block", children: data.trackerMessage })] })] })) })) : (_jsx("span", { children: "Connecting to telecom provider..." })) })] }));
}
