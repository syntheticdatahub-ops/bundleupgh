"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { EmptyState } from "@/components/empty-state";
import { CreditCardIcon, FileTextIcon, InfoIcon, MoreHorizontalIcon, StickyNoteIcon, } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
const fmt = (n) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
}).format(Math.abs(n));
function statusBadge(status) {
    switch (status) {
        case "completed":
            return _jsx(Badge, { variant: "default", children: "Completed" });
        case "pending":
            return (_jsx(Badge, { variant: "outline", className: "text-amber-500 dark:text-amber-400", children: "Pending" }));
        case "failed":
            return _jsx(Badge, { variant: "destructive", children: "Failed" });
    }
}
export function TransactionTable({ transactions, selectedIds, setSelectedIds, expandedId, setExpandedId, }) {
    const allSelected = transactions.length > 0 && transactions.every((t) => selectedIds.has(t.id));
    const someSelected = transactions.some((t) => selectedIds.has(t.id)) && !allSelected;
    function toggleAll() {
        if (allSelected) {
            setSelectedIds(new Set());
        }
        else {
            setSelectedIds(new Set(transactions.map((t) => t.id)));
        }
    }
    function toggleOne(id) {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        }
        else {
            next.add(id);
        }
        setSelectedIds(next);
    }
    return (_jsx("div", { className: "overflow-hidden rounded-xl ring-1 ring-foreground/10", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-10 pl-3", children: _jsx("input", { type: "checkbox", checked: allSelected, ref: (el) => {
                                            if (el)
                                                el.indeterminate = someSelected;
                                        }, onChange: toggleAll, className: "size-4 cursor-pointer rounded accent-primary" }) }), _jsx(TableHead, { children: "Merchant" }), _jsx(TableHead, { className: "hidden sm:table-cell", children: "Transaction ID" }), _jsx(TableHead, { className: "text-right", children: "Amount" }), _jsx(TableHead, { className: "hidden md:table-cell", children: "Date" }), _jsx(TableHead, { className: "hidden lg:table-cell", children: "Status" }), _jsx(TableHead, { className: "w-10" })] }) }), _jsxs(TableBody, { children: [transactions.length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, children: _jsx(EmptyState, { variant: "filter", className: "py-12" }) }) })), transactions.map((tx) => {
                                const isExpanded = expandedId === tx.id;
                                return (_jsx(TransactionRow, { tx: tx, isSelected: selectedIds.has(tx.id), isExpanded: isExpanded, onToggleSelect: () => toggleOne(tx.id), onToggleExpand: () => setExpandedId(isExpanded ? null : tx.id) }, tx.id));
                            })] })] }) }) }));
}
function TransactionRow({ tx, isSelected, isExpanded, onToggleSelect, onToggleExpand, }) {
    return (_jsxs(_Fragment, { children: [_jsxs(TableRow, { className: cn("group cursor-pointer", isSelected && "bg-muted/50", isExpanded && "border-b-0"), onClick: onToggleExpand, children: [_jsx(TableCell, { className: "pl-3", children: _jsx("input", { type: "checkbox", checked: isSelected, onChange: onToggleSelect, onClick: (e) => e.stopPropagation(), className: "size-4 cursor-pointer rounded accent-primary" }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Image, { src: tx.logo, alt: tx.merchant, width: 32, height: 32, className: "size-8 rounded-lg object-cover", unoptimized: true }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-sm font-medium", children: tx.merchant }), _jsx(Badge, { variant: "secondary", className: "mt-0.5 text-[10px]", children: tx.category })] })] }) }), _jsx(TableCell, { className: "hidden sm:table-cell", children: _jsx("span", { className: "font-mono text-xs text-muted-foreground", children: tx.transactionId }) }), _jsx(TableCell, { className: "text-right", children: _jsxs("span", { className: cn("tabular-nums text-sm font-semibold", tx.type === "income" ? "text-emerald-500" : "text-foreground"), children: [tx.type === "income" ? "+" : "-", fmt(tx.amount)] }) }), _jsx(TableCell, { className: "hidden md:table-cell", children: _jsx("span", { className: "text-sm text-muted-foreground", children: tx.date }) }), _jsx(TableCell, { className: "hidden lg:table-cell", children: statusBadge(tx.status) }), _jsx(TableCell, { children: _jsx(Button, { variant: "ghost", size: "icon-xs", className: "opacity-0 transition-opacity group-hover:opacity-100", onClick: (e) => {
                                e.stopPropagation();
                            }, children: _jsx(MoreHorizontalIcon, { className: "size-4" }) }) })] }), _jsx(AnimatePresence, { initial: false, children: isExpanded && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-0", children: _jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.2, ease: "easeInOut" }, className: "overflow-hidden", children: _jsxs("div", { className: "flex flex-wrap gap-4 border-b bg-muted/30 px-4 py-3 pl-12 text-sm", children: [tx.merchantInfo && (_jsxs("div", { className: "flex items-start gap-2 text-muted-foreground", children: [_jsx(InfoIcon, { className: "mt-0.5 size-3.5 shrink-0" }), _jsx("span", { children: tx.merchantInfo })] })), tx.cardLast4 && (_jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [_jsx(CreditCardIcon, { className: "size-3.5 shrink-0" }), _jsxs("span", { className: "tabular-nums", children: ["Paid with card ending ****", tx.cardLast4] })] })), tx.notes && (_jsxs("div", { className: "flex items-start gap-2 text-muted-foreground", children: [_jsx(StickyNoteIcon, { className: "mt-0.5 size-3.5 shrink-0" }), _jsx("span", { children: tx.notes })] })), _jsxs(Button, { variant: "ghost", size: "xs", className: "ml-auto", children: [_jsx(FileTextIcon, { className: "size-3.5" }), "View Receipt"] })] }) }) }) })) })] }));
}
