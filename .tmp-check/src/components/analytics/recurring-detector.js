"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { recurringCharges } from "@/data/seed";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, FlagIcon, CircleDashedIcon } from "lucide-react";
const CYCLE = ["unset", "wanted", "review"];
function nextStatus(current) {
    const idx = CYCLE.indexOf(current);
    return CYCLE[(idx + 1) % CYCLE.length];
}
function StatusIcon({ status }) {
    switch (status) {
        case "wanted":
            return _jsx(CheckCircle2Icon, { className: "size-4 text-emerald-500" });
        case "review":
            return _jsx(FlagIcon, { className: "size-4 text-amber-500" });
        default:
            return _jsx(CircleDashedIcon, { className: "size-4 text-muted-foreground/50" });
    }
}
export function RecurringDetector() {
    const [statuses, setStatuses] = useState(() => {
        const map = {};
        recurringCharges.forEach((c) => {
            map[c.id] = c.status;
        });
        return map;
    });
    const monthlyTotal = useMemo(() => recurringCharges.reduce((s, c) => {
        if (c.frequency === "yearly")
            return s + c.amount / 12;
        return s + c.amount;
    }, 0), []);
    const summary = useMemo(() => {
        let wanted = 0;
        let review = 0;
        Object.values(statuses).forEach((s) => {
            if (s === "wanted")
                wanted++;
            if (s === "review")
                review++;
        });
        return { wanted, review };
    }, [statuses]);
    function toggleStatus(id) {
        setStatuses((prev) => (Object.assign(Object.assign({}, prev), { [id]: nextStatus(prev[id]) })));
    }
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx(CardTitle, { children: "Recurring Charges" }), _jsxs(CardDescription, { children: [_jsxs("span", { className: "tabular-nums font-medium text-foreground", children: ["$", monthlyTotal.toFixed(2)] }), "/month total"] })] }) }) }), _jsx(CardContent, { className: "space-y-1", children: recurringCharges.map((charge) => {
                    const status = statuses[charge.id];
                    return (_jsxs("div", { className: cn("flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"), children: [_jsx(Image, { src: charge.logo, alt: charge.merchant, width: 28, height: 28, unoptimized: true, className: "size-7 rounded-md" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: charge.merchant }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Next: ", charge.nextDate] })] }), _jsxs("div", { className: "text-right mr-2", children: [_jsxs("p", { className: "text-sm font-medium tabular-nums", children: ["$", charge.amount.toFixed(2)] }), _jsx("p", { className: "text-[10px] text-muted-foreground capitalize", children: charge.frequency })] }), _jsx("button", { type: "button", onClick: () => toggleStatus(charge.id), className: "rounded-full p-1 transition-colors hover:bg-muted", "aria-label": `Toggle status for ${charge.merchant}`, children: _jsx(StatusIcon, { status: status }) })] }, charge.id));
                }) }), _jsx(CardFooter, { children: _jsxs("div", { className: "flex w-full items-center justify-between text-xs text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(CheckCircle2Icon, { className: "size-3.5 text-emerald-500" }), _jsx("span", { className: "tabular-nums", children: summary.wanted }), " wanted"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(FlagIcon, { className: "size-3.5 text-amber-500" }), _jsx("span", { className: "tabular-nums", children: summary.review }), " flagged for review"] })] }) })] }));
}
