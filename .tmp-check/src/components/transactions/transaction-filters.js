"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
export function TransactionFilters({ search, setSearch, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter, typeFilter, setTypeFilter, categories, }) {
    const typeOptions = ["all", "income", "expense"];
    return (_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("div", { className: "relative w-full sm:min-w-[200px] sm:flex-1", children: [_jsx(SearchIcon, { className: "pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search transactions...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-8" })] }), _jsxs(Select, { value: categoryFilter, onValueChange: (v) => v && setCategoryFilter(v), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), categories.map((cat) => (_jsx(SelectItem, { value: cat, children: cat }, cat)))] })] }), _jsxs(Select, { value: statusFilter, onValueChange: (v) => v && setStatusFilter(v), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "pending", children: "Pending" }), _jsx(SelectItem, { value: "failed", children: "Failed" })] })] }), _jsx("div", { className: "flex items-center rounded-lg border border-border p-0.5", children: typeOptions.map((opt) => (_jsx("button", { onClick: () => setTypeFilter(opt), className: cn("rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors", typeFilter === opt
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"), children: opt }, opt))) })] }));
}
