"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}
export function CardControls({ card, frozen, onToggleFreeze, dailyLimit, onDailyLimitChange, }) {
    const spendPercent = card.monthlyLimit > 0
        ? Math.round((card.monthlySpend / card.monthlyLimit) * 100)
        : 0;
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Card Controls" }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx("p", { className: "text-sm font-medium", children: "Card Status" }), _jsx("p", { className: cn("text-xs", frozen ? "text-destructive" : "text-muted-foreground"), children: frozen ? "Frozen" : "Active" })] }), _jsx(Switch, { checked: frozen, onCheckedChange: (checked) => {
                                    if (checked !== frozen)
                                        onToggleFreeze();
                                } })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium", children: "Daily Limit" }), _jsx("span", { className: "text-sm font-medium tabular-nums", children: formatCurrency(dailyLimit) })] }), _jsx(Slider, { value: [dailyLimit], min: 0, max: 10000, step: 100, onValueChange: (value) => {
                                    const v = Array.isArray(value) ? value[0] : value;
                                    onDailyLimitChange(v);
                                } }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground tabular-nums", children: [_jsx("span", { children: "$0" }), _jsx("span", { children: "$10,000" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium", children: "Monthly Usage" }), _jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [spendPercent, "%"] })] }), _jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-muted", children: _jsx("div", { className: cn("h-full rounded-full transition-all", spendPercent >= 90
                                        ? "bg-destructive"
                                        : spendPercent >= 70
                                            ? "bg-amber-500"
                                            : "bg-primary"), style: { width: `${Math.min(spendPercent, 100)}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground tabular-nums", children: [_jsx("span", { children: formatCurrency(card.monthlySpend) }), _jsx("span", { children: formatCurrency(card.monthlyLimit) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium", children: "Card Info" }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(Badge, { variant: card.type === "virtual" ? "secondary" : "outline", children: card.type }), _jsx(Badge, { variant: "outline", className: "uppercase", children: card.network }), _jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: ["**** ", card.last4] })] })] })] })] }));
}
