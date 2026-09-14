"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { aiInsights } from "@/data/seed";
import { cn } from "@/lib/utils";
import { BrainIcon, SparklesIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon, } from "lucide-react";
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};
const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
};
function TrendIcon({ trend }) {
    switch (trend) {
        case "up":
            return _jsx(TrendingUpIcon, { className: "size-3" });
        case "down":
            return _jsx(TrendingDownIcon, { className: "size-3" });
        default:
            return _jsx(MinusIcon, { className: "size-3" });
    }
}
export function AiInsights() {
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(SparklesIcon, { className: "size-4 text-primary" }), "AI Insights"] }) }), _jsx(CardContent, { children: _jsx(motion.div, { variants: container, initial: "hidden", animate: "show", className: "grid gap-3", children: aiInsights.map((insight, i) => (_jsxs(motion.div, { variants: item, className: "flex gap-3 rounded-lg border border-border/50 bg-muted/30 p-3", children: [_jsx("div", { className: "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10", children: i % 2 === 0 ? (_jsx(BrainIcon, { className: "size-4 text-primary" })) : (_jsx(SparklesIcon, { className: "size-4 text-primary" })) }), _jsxs("div", { className: "flex-1 min-w-0 space-y-1.5", children: [_jsx("p", { className: "text-sm leading-snug", children: insight.text }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums", insight.trend === "up" &&
                                                    "bg-rose-500/10 text-rose-600 dark:text-rose-400", insight.trend === "down" &&
                                                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", insight.trend === "neutral" &&
                                                    "bg-muted text-muted-foreground"), children: [_jsx(TrendIcon, { trend: insight.trend }), insight.percentChange > 0
                                                        ? `${insight.percentChange}%`
                                                        : "No change"] }), _jsx("span", { className: "text-[11px] text-muted-foreground", children: insight.category })] })] })] }, insight.id))) }) })] }));
}
