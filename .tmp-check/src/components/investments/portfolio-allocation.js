"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useCallback } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { ChartContainer, } from "@/components/ui/chart";
import { holdings } from "@/data/seed";
const SECTOR_COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
];
export function PortfolioAllocation() {
    const [activeIndex, setActiveIndex] = useState(null);
    const { sectorData, totalValue } = useMemo(() => {
        var _a;
        const map = new Map();
        for (const h of holdings) {
            const value = h.quantity * h.currentPrice;
            map.set(h.sector, ((_a = map.get(h.sector)) !== null && _a !== void 0 ? _a : 0) + value);
        }
        const data = Array.from(map.entries()).map(([sector, value], i) => ({
            name: sector,
            value: Math.round(value * 100) / 100,
            fill: SECTOR_COLORS[i % SECTOR_COLORS.length],
        }));
        const total = data.reduce((s, d) => s + d.value, 0);
        return { sectorData: data, totalValue: total };
    }, []);
    const chartConfig = useMemo(() => {
        const config = {};
        sectorData.forEach((s) => {
            config[s.name] = { label: s.name, color: s.fill };
        });
        return config;
    }, [sectorData]);
    const onPieEnter = useCallback((_, index) => {
        setActiveIndex(index);
    }, []);
    const onPieLeave = useCallback(() => {
        setActiveIndex(null);
    }, []);
    const centerLabel = useMemo(() => {
        if (activeIndex !== null && sectorData[activeIndex]) {
            const s = sectorData[activeIndex];
            const pct = ((s.value / totalValue) * 100).toFixed(1);
            return { title: s.name, value: s.value, pct };
        }
        return { title: "Total Value", value: totalValue, pct: null };
    }, [activeIndex, sectorData, totalValue]);
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Portfolio Allocation" }) }), _jsxs(CardContent, { children: [_jsx(ChartContainer, { config: chartConfig, className: "mx-auto aspect-square h-[260px]", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: sectorData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: "60%", outerRadius: "80%", strokeWidth: 2, stroke: "var(--color-card)", paddingAngle: 2, onMouseEnter: onPieEnter, onMouseLeave: onPieLeave, children: sectorData.map((entry, i) => (_jsx(Cell, { fill: entry.fill, opacity: activeIndex === null || activeIndex === i ? 1 : 0.4, strokeWidth: activeIndex === i ? 3 : 2 }, entry.name))) }), _jsx("text", { x: "50%", y: "44%", textAnchor: "middle", dominantBaseline: "middle", className: "fill-muted-foreground text-[10px]", children: centerLabel.title }), _jsxs("text", { x: "50%", y: "52%", textAnchor: "middle", dominantBaseline: "middle", className: "fill-foreground text-xl font-bold tabular-nums", children: ["$", centerLabel.value.toLocaleString(undefined, { maximumFractionDigits: 0 })] }), centerLabel.pct && (_jsxs("text", { x: "50%", y: "60%", textAnchor: "middle", dominantBaseline: "middle", className: "fill-muted-foreground text-[10px] tabular-nums", children: [centerLabel.pct, "%"] }))] }) }), _jsx("div", { className: "mt-2 grid gap-1.5 text-xs", children: sectorData.map((entry) => {
                            const pct = ((entry.value / totalValue) * 100).toFixed(1);
                            return (_jsxs("div", { className: "flex items-center gap-2", onMouseEnter: () => setActiveIndex(sectorData.indexOf(entry)), onMouseLeave: () => setActiveIndex(null), children: [_jsx("span", { className: "size-2.5 shrink-0 rounded-full", style: { backgroundColor: entry.fill } }), _jsx("span", { className: "truncate text-muted-foreground", children: entry.name }), _jsxs("span", { className: "ml-auto font-medium tabular-nums", children: [pct, "%"] })] }, entry.name));
                        }) })] })] }));
}
