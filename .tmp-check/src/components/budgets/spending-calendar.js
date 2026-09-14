"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dailySpending } from "@/data/seed";
import { cn } from "@/lib/utils";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function SpendingCalendar() {
    const { weeks, maxAmount } = useMemo(() => {
        var _a;
        const map = new Map(dailySpending.map((d) => [d.date, d.amount]));
        // Build April 2026 calendar
        const firstDay = new Date(2026, 3, 1); // April 1
        const startPad = firstDay.getDay(); // day of week offset
        const daysInMonth = 30;
        const cells = [];
        for (let i = 0; i < startPad; i++)
            cells.push({ day: null, amount: 0, date: "" });
        let max = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `2026-04-${String(d).padStart(2, "0")}`;
            const amount = (_a = map.get(dateStr)) !== null && _a !== void 0 ? _a : 0;
            if (amount > max)
                max = amount;
            cells.push({ day: d, amount, date: dateStr });
        }
        const weeks = [];
        for (let i = 0; i < cells.length; i += 7) {
            weeks.push(cells.slice(i, i + 7));
        }
        // Pad last week
        const last = weeks[weeks.length - 1];
        while (last.length < 7)
            last.push({ day: null, amount: 0, date: "" });
        return { weeks, maxAmount: max };
    }, []);
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base font-semibold", children: "April 2026 Spending" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground", children: DAYS.map((d) => (_jsx("div", { className: "py-1", children: d }, d))) }), _jsx("div", { className: "mt-1 grid gap-1", children: weeks.map((week, wi) => (_jsx("div", { className: "grid grid-cols-7 gap-1", children: week.map((cell, ci) => {
                                if (cell.day === null) {
                                    return _jsx("div", {}, ci);
                                }
                                const intensity = cell.amount === 0
                                    ? 0
                                    : Math.min(Math.round((cell.amount / maxAmount) * 4), 4);
                                const isToday = cell.day === 13; // April 13 (today in seed)
                                return (_jsxs("div", { className: cn("flex flex-col items-center justify-center rounded-lg py-1.5 text-center transition-colors", intensity === 0 && "bg-transparent", intensity === 1 && "bg-primary/10", intensity === 2 && "bg-primary/20", intensity === 3 && "bg-primary/35", intensity === 4 && "bg-primary/50", isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"), children: [_jsx("span", { className: "text-[11px] font-medium", children: cell.day }), cell.amount > 0 && (_jsxs("span", { className: "hidden text-[9px] tabular-nums text-muted-foreground sm:inline", children: ["$", cell.amount] }))] }, ci));
                            }) }, wi))) })] })] }));
}
