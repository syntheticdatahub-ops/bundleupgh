"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, } from "@/components/ui/chart";
import { categoryBreakdowns } from "@/data/seed";
const SUBCATEGORY_COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
];
export function CategoryDonut() {
    const [selected, setSelected] = useState(null);
    const total = useMemo(() => categoryBreakdowns.reduce((s, c) => s + c.amount, 0), []);
    const selectedCategory = useMemo(() => { var _a; return (_a = categoryBreakdowns.find((c) => c.category === selected)) !== null && _a !== void 0 ? _a : null; }, [selected]);
    const chartConfig = useMemo(() => {
        if (selectedCategory) {
            const config = {};
            selectedCategory.subcategories.forEach((sub, i) => {
                config[sub.name] = {
                    label: sub.name,
                    color: SUBCATEGORY_COLORS[i % SUBCATEGORY_COLORS.length],
                };
            });
            return config;
        }
        const config = {};
        categoryBreakdowns.forEach((c) => {
            config[c.category] = {
                label: c.category,
                color: c.color,
            };
        });
        return config;
    }, [selectedCategory]);
    const pieData = useMemo(() => {
        if (selectedCategory) {
            return selectedCategory.subcategories.map((sub, i) => ({
                name: sub.name,
                value: sub.amount,
                fill: SUBCATEGORY_COLORS[i % SUBCATEGORY_COLORS.length],
            }));
        }
        return categoryBreakdowns.map((c) => ({
            name: c.category,
            value: c.amount,
            fill: c.color,
        }));
    }, [selectedCategory]);
    const centerAmount = selectedCategory ? selectedCategory.amount : total;
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: selectedCategory
                                ? selectedCategory.category
                                : "Spending by Category" }), selectedCategory && (_jsxs(Button, { variant: "ghost", size: "sm", className: "h-7 gap-1 text-xs", onClick: () => setSelected(null), children: [_jsx(ArrowLeftIcon, { className: "size-3" }), "Back to all"] }))] }) }), _jsxs(CardContent, { children: [_jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, transition: { duration: 0.2 }, children: _jsx(ChartContainer, { config: chartConfig, className: "mx-auto aspect-square h-[280px]", children: _jsxs(PieChart, { children: [_jsx(ChartTooltip, { content: _jsx(ChartTooltipContent, { formatter: (value) => `$${Number(value).toLocaleString()}` }) }), _jsx(Pie, { data: pieData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 75, outerRadius: 110, strokeWidth: 2, stroke: "var(--color-card)", paddingAngle: 2, onClick: (_, index) => {
                                                if (!selectedCategory) {
                                                    setSelected(categoryBreakdowns[index].category);
                                                }
                                            }, className: selectedCategory ? "" : "cursor-pointer", children: pieData.map((entry) => (_jsx(Cell, { fill: entry.fill }, entry.name))) }), _jsxs("text", { x: "50%", y: "47%", textAnchor: "middle", dominantBaseline: "middle", className: "fill-foreground text-2xl font-bold tabular-nums", children: ["$", centerAmount.toLocaleString()] }), _jsx("text", { x: "50%", y: "56%", textAnchor: "middle", dominantBaseline: "middle", className: "fill-muted-foreground text-xs", children: selectedCategory ? "category total" : "total spent" })] }) }) }, selected !== null && selected !== void 0 ? selected : "all") }), _jsx("div", { className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs", children: pieData.map((entry) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "size-2.5 shrink-0 rounded-full", style: { backgroundColor: entry.fill } }), _jsx("span", { className: "truncate text-muted-foreground", children: entry.name }), _jsxs("span", { className: "ml-auto font-medium tabular-nums", children: ["$", entry.value.toLocaleString()] })] }, entry.name))) })] })] }));
}
