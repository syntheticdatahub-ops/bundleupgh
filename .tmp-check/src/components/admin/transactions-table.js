"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { decodeCursorState, encodeCursorState } from "@/lib/pagination";
const statusColors = {
    SUCCESS: "text-green-600 bg-green-500/10 dark:text-green-400",
    PENDING: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    FAILED: "text-red-600 bg-red-500/10 dark:text-red-400",
    REFUNDED: "text-purple-600 bg-purple-500/10 dark:text-purple-400",
};
export function AdminTransactionsTable({ orders, currentPage = 1, hasNextPage = false, nextCursor, }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
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
    // Derive transactions from real orders
    const transactions = orders
        .map((o) => ({
        id: o.id, // Using order ID as fallback since payment is a separate collection
        orderId: o.publicReference,
        provider: "Mock Payment", // TODO: Update when Paystack is integrated
        amount: o.sellingPriceSnapshot,
        status: (o.paymentStatus || "").toUpperCase() === "SUCCESS" || (o.paymentStatus || "").toUpperCase() === "PAID"
            ? "SUCCESS"
            : (o.fulfillmentStatus || "").toUpperCase(),
        date: new Date(o.createdAt).toLocaleString(),
    }));
    if (transactions.length === 0) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "p-16 text-center text-muted-foreground text-sm", children: "No transactions found." }) }));
    }
    return (_jsx(Card, { children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider", children: [_jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Payment ID" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Order Ref" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Provider" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Amount" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Date" })] }) }), _jsx("tbody", { children: transactions.map((tx, idx) => (_jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30 transition-colors", children: [_jsx("td", { className: "px-4 py-3 font-mono text-xs text-muted-foreground", children: tx.id }), _jsx("td", { className: "px-4 py-3 font-mono font-medium", children: tx.orderId }), _jsx("td", { className: "px-4 py-3 text-muted-foreground", children: tx.provider }), _jsxs("td", { className: "px-4 py-3 text-right font-semibold", children: ["GHS ", tx.amount.toFixed(2)] }), _jsx("td", { className: "px-4 py-3", children: _jsx(Badge, { variant: "secondary", className: cn("text-[10px] font-bold tracking-wider", statusColors[tx.status] || ""), children: tx.status }) }), _jsx("td", { className: "px-4 py-3 text-muted-foreground", children: tx.date })] }, tx.orderId + idx))) })] }) }), _jsxs("div", { className: "flex items-center justify-between border-t bg-muted/20 px-4 py-3", children: [_jsxs("div", { className: "text-xs text-muted-foreground", children: ["Page ", currentPage] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => changePage(currentPage - 1), disabled: currentPage <= 1, className: "h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50", children: "Previous" }), _jsx("button", { type: "button", onClick: () => changePage(currentPage + 1), disabled: !hasNextPage, className: "h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50", children: "Next" })] })] })] }) }));
}
