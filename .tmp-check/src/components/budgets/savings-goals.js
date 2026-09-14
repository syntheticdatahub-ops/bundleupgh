import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { savingsGoals } from "@/data/seed";
import { PalmtreeIcon, ShieldIcon, CarIcon, HomeIcon, } from "lucide-react";
const iconMap = {
    "palm-tree": _jsx(PalmtreeIcon, { className: "size-5" }),
    shield: _jsx(ShieldIcon, { className: "size-5" }),
    car: _jsx(CarIcon, { className: "size-5" }),
    home: _jsx(HomeIcon, { className: "size-5" }),
};
export function SavingsGoals() {
    return (_jsxs(Card, { className: "col-span-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base font-semibold", children: "Savings Goals" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: savingsGoals.map((g) => {
                        const percent = Math.round((g.currentAmount / g.targetAmount) * 100);
                        const monthsLeft = Math.ceil((g.targetAmount - g.currentAmount) / g.monthlyContribution);
                        const projectedDate = new Date();
                        projectedDate.setMonth(projectedDate.getMonth() + monthsLeft);
                        const deadlineDate = new Date(g.deadline + " 1");
                        const onTrack = projectedDate <= deadlineDate;
                        return (_jsxs("div", { className: "flex gap-4 rounded-xl border p-4", children: [_jsx("div", { className: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground", children: iconMap[g.iconName] }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-semibold", children: g.name }), _jsx(Badge, { variant: onTrack ? "secondary" : "destructive", className: "text-[10px]", children: onTrack ? "On track" : "Behind" })] }), _jsxs("div", { className: "flex items-baseline gap-1", children: [_jsxs("span", { className: "text-lg font-bold tabular-nums", children: ["$", g.currentAmount.toLocaleString()] }), _jsxs("span", { className: "text-xs text-muted-foreground", children: ["/ $", g.targetAmount.toLocaleString()] })] }), _jsx(Progress, { value: percent, className: "h-2" }), _jsxs("div", { className: "flex items-center justify-between text-[11px] text-muted-foreground", children: [_jsxs("span", { children: ["$", g.monthlyContribution, "/mo"] }), _jsxs("span", { children: ["Target: ", g.deadline] })] })] })] }, g.id));
                    }) }) })] }));
}
