"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { decodeCursorState, encodeCursorState } from "@/lib/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
export function AdminCustomersTable({ customers, currentPage, hasNextPage, nextCursor, }) {
    const [query, setQuery] = useState("");
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
    const filtered = customers.filter((c) => c.phone.toLowerCase().includes(query.toLowerCase()) ||
        c.lastNetworkId.toLowerCase().includes(query.toLowerCase()));
    return (_jsx(Card, { children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "p-4 border-b", children: _jsxs("div", { className: "relative max-w-sm", children: [_jsx(SearchIcon, { className: "absolute left-3 top-2.5 size-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by phone or network\u2026", className: "pl-9 h-9", value: query, onChange: (e) => setQuery(e.target.value) })] }) }), _jsxs("div", { className: "overflow-x-auto", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider", children: [_jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Phone" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Orders" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Total Spent" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Last Network" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Last Order" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Status" })] }) }), _jsx("tbody", { children: filtered.map((customer) => {
                                        return (_jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30 transition-colors", children: [_jsx("td", { className: "px-4 py-3 font-medium", children: customer.displayPhone }), _jsx("td", { className: "px-4 py-3 text-right", children: customer.totalOrders }), _jsxs("td", { className: "px-4 py-3 text-right font-semibold", children: ["GHS ", customer.totalSpent.toFixed(2)] }), _jsx("td", { className: "px-4 py-3 capitalize", children: customer.lastNetworkId }), _jsx("td", { className: "px-4 py-3 text-muted-foreground", children: customer.lastOrderDate }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `text-xs font-semibold capitalize ${customer.status === "active"
                                                            ? "text-green-600 dark:text-green-400"
                                                            : "text-muted-foreground"}`, children: customer.status }) })] }, customer.id));
                                    }) })] }), filtered.length === 0 && (_jsx("div", { className: "py-16 text-center text-muted-foreground text-sm", children: "No customers found." }))] }), _jsxs("div", { className: "flex items-center justify-between border-t bg-muted/20 px-4 py-3", children: [_jsxs("div", { className: "text-xs text-muted-foreground", children: ["Page ", currentPage] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => changePage(currentPage - 1), disabled: currentPage <= 1, className: "h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50", children: "Previous" }), _jsx("button", { type: "button", onClick: () => changePage(currentPage + 1), disabled: !hasNextPage, className: "h-9 rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50", children: "Next" })] })] })] }) }));
}
