"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid, ReferenceLine, } from "recharts";
import { ArrowRightIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardAction, } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cryptoCoins } from "@/data/seed";
function generateCandlestickData(basePrice, count) {
    const data = [];
    let price = basePrice * 0.92;
    const now = new Date();
    // Use enough decimal precision so small-price coins have visible candles
    const decimals = basePrice >= 100 ? 2 : basePrice >= 1 ? 4 : 6;
    const factor = Math.pow(10, decimals);
    const round = (v) => Math.round(v * factor) / factor;
    for (let i = count; i > 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        if (date.getDay() === 0 || date.getDay() === 6)
            continue;
        const volatility = price * 0.025;
        const open = price;
        const change = (Math.random() - 0.45) * volatility;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.4;
        const low = Math.min(open, close) - Math.random() * volatility * 0.4;
        data.push({
            date: date.toISOString().split("T")[0],
            openClose: [round(open), round(close)],
            high: round(high),
            low: round(low),
        });
        price = close;
    }
    return data;
}
function CandlestickShape(props) {
    const { x, y, width, height, low, high, openClose: [open, close] } = props;
    const isGrowing = open < close;
    const ratio = Math.abs(height / (open - close)) || 0;
    return (_jsxs("g", { children: [_jsx("path", { className: isGrowing ? "fill-emerald-500" : "fill-rose-500", d: `M ${x},${y} L ${x},${y + height} L ${x + width},${y + height} L ${x + width},${y} Z` }), _jsx("g", { className: isGrowing ? "stroke-emerald-500" : "stroke-rose-500", strokeWidth: "1", children: isGrowing ? (_jsxs(_Fragment, { children: [_jsx("path", { d: `M ${x + width / 2},${y + height} v ${(open - low) * ratio}` }), _jsx("path", { d: `M ${x + width / 2},${y} v ${(close - high) * ratio}` })] })) : (_jsxs(_Fragment, { children: [_jsx("path", { d: `M ${x + width / 2},${y} v ${(close - low) * ratio}` }), _jsx("path", { d: `M ${x + width / 2},${y + height} v ${(open - high) * ratio}` })] })) })] }));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCandlestick(props) {
    const { x, y, width, height, payload } = props;
    if (payload === null || payload === void 0 ? void 0 : payload.openClose) {
        return (_jsx(CandlestickShape, { x: x, y: y, width: width, height: height, low: payload.low, high: payload.high, openClose: payload.openClose }));
    }
    return _jsx(CandlestickShape, { x: 0, y: 0, width: 0, height: 0, low: 0, high: 0, openClose: [0, 0] });
}
/* ── tooltip ──────────────────────────────────────────────────────────── */
function CandlestickTooltip({ active, payload }) {
    var _a;
    if (!active || !(payload === null || payload === void 0 ? void 0 : payload.length))
        return null;
    const d = (_a = payload[0]) === null || _a === void 0 ? void 0 : _a.payload;
    if (!d)
        return null;
    const [open, close] = d.openClose;
    const isGrowing = close > open;
    return (_jsxs("div", { className: "rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md", children: [_jsx("p", { className: "mb-1 font-medium", children: new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-0.5 text-muted-foreground", children: [_jsx("span", { children: "Open" }), _jsx("span", { className: "text-right font-medium text-foreground tabular-nums", children: open.toLocaleString() }), _jsx("span", { children: "High" }), _jsx("span", { className: "text-right font-medium text-foreground tabular-nums", children: d.high.toLocaleString() }), _jsx("span", { children: "Low" }), _jsx("span", { className: "text-right font-medium text-foreground tabular-nums", children: d.low.toLocaleString() }), _jsx("span", { children: "Close" }), _jsx("span", { className: cn("text-right font-medium tabular-nums", isGrowing ? "text-emerald-500" : "text-rose-500"), children: close.toLocaleString() })] })] }));
}
/* ── config ────────────────────────────────────────────────────────────── */
const chartConfig = {
    openClose: { label: "Price", color: "var(--chart-1)" },
};
const PERIODS = ["1D", "1W", "1M", "3M", "1Y", "ALL"];
const PERIOD_DAYS = { "1D": 15, "1W": 30, "1M": 60, "3M": 130, "1Y": 365, ALL: 365 };
export function CoinInsight({ prices, selectedCoin }) {
    var _a, _b, _c;
    const [period, setPeriod] = React.useState("3M");
    const coin = cryptoCoins.find((c) => c.id === selectedCoin);
    const livePrice = (_a = prices[selectedCoin]) !== null && _a !== void 0 ? _a : ((_b = coin === null || coin === void 0 ? void 0 : coin.price) !== null && _b !== void 0 ? _b : 0);
    const data = React.useMemo(() => { var _a; return generateCandlestickData(livePrice, (_a = PERIOD_DAYS[period]) !== null && _a !== void 0 ? _a : 25); }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCoin, period]);
    const minVal = data.reduce((m, d) => Math.min(m, d.low, ...d.openClose), Infinity);
    const maxVal = data.reduce((m, d) => Math.max(m, d.high, ...d.openClose), -Infinity);
    const pad = (maxVal - minVal) * 0.1;
    const lastCandle = data[data.length - 1];
    const lastClose = lastCandle === null || lastCandle === void 0 ? void 0 : lastCandle.openClose[1];
    const lastIsGrowing = lastCandle ? lastCandle.openClose[1] > lastCandle.openClose[0] : true;
    const formatTick = (val, idx) => {
        const d = new Date(val);
        const mo = d.getMonth();
        const yr = d.getFullYear().toString().slice(2);
        if (idx === 0)
            return `${d.toLocaleString("en-US", { month: "short" })} '${yr}`;
        const prev = data[idx - 1];
        if (prev && new Date(prev.date).getMonth() !== mo) {
            return `${d.toLocaleString("en-US", { month: "short" })} '${yr}`;
        }
        return "";
    };
    return (_jsxs(Card, { className: "lg:col-span-8", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 sm:gap-3", children: [_jsxs(CardTitle, { children: [(_c = coin === null || coin === void 0 ? void 0 : coin.name) !== null && _c !== void 0 ? _c : "Coin", " Insight"] }), _jsxs("span", { className: cn("rounded px-2 py-0.5 text-sm font-bold tabular-nums", lastIsGrowing ? "text-emerald-500" : "text-rose-500"), children: ["$", livePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })] })] }), _jsx(CardAction, { children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-1 text-xs text-muted-foreground", children: ["More Insight ", _jsx(ArrowRightIcon, { className: "size-3" })] }) })] }), _jsxs(CardContent, { className: "min-w-0 space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "inline-block size-2.5 rounded-sm bg-emerald-500" }), " Bullish"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "inline-block size-2.5 rounded-sm bg-rose-500" }), " Bearish"] })] }), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25 }, children: _jsx(ChartContainer, { config: chartConfig, className: "aspect-auto h-[340px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-950/5 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-950/25 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/64 [&_.recharts-cartesian-axis-line]:stroke-border/64 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground/72 dark:[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground/64", children: _jsxs(BarChart, { data: data, maxBarSize: 20, margin: { left: 20, right: -5 }, children: [_jsx(CartesianGrid, { vertical: false, strokeWidth: 1 }), _jsx(XAxis, { dataKey: "date", tickLine: false, tickFormatter: formatTick, interval: 0, minTickGap: 5, tickMargin: 12 }), _jsx(YAxis, { domain: [minVal - pad, maxVal + pad], tickCount: 7, tickLine: false, orientation: "right", tickFormatter: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v >= 1 ? v.toFixed(2) : v.toFixed(4) }), lastClose != null && (_jsx(ReferenceLine, { y: lastClose, stroke: "var(--muted-foreground)", opacity: 0.5, strokeWidth: 1, strokeDasharray: "2 2", label: ({ viewBox }) => (_jsxs("g", { transform: `translate(${viewBox.x + viewBox.width + 5},${viewBox.y})`, children: [_jsx("rect", { x: -2, y: -10, width: 50, height: 20, fill: lastIsGrowing ? "var(--color-emerald-500)" : "var(--color-rose-500)", rx: 4 }), _jsx("text", { x: 2, y: 4, fill: "#fff", fontSize: 10, fontWeight: "500", textAnchor: "start", className: "tabular-nums", children: lastClose >= 1000 ? `${(lastClose / 1000).toFixed(1)}k` : lastClose.toFixed(2) })] })) })), _jsx(ChartTooltip, { content: _jsx(CandlestickTooltip, {}) }), _jsx(Bar, { dataKey: "openClose", shape: renderCandlestick, children: data.map((d) => (_jsx(Cell, {}, d.date))) })] }) }) }, `${selectedCoin}-${period}`) }), _jsx("div", { className: "flex flex-wrap items-center gap-1", children: PERIODS.map((p) => (_jsx("button", { onClick: () => setPeriod(p), className: cn("rounded-md px-3 py-1 text-xs font-medium tabular-nums transition-colors", p === period
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"), children: p }, p))) })] })] }));
}
