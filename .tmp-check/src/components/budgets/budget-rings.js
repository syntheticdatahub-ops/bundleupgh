"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { budgetCategories } from "@/data/seed";
import { motion } from "motion/react";
import { UtensilsIcon, CarIcon, Gamepad2Icon, ShoppingBagIcon, RepeatIcon, HeartPulseIcon, GraduationCapIcon, PlaneIcon, } from "lucide-react";
import { cn } from "@/lib/utils";
const iconMap = {
    utensils: _jsx(UtensilsIcon, { className: "size-5" }),
    car: _jsx(CarIcon, { className: "size-5" }),
    "gamepad-2": _jsx(Gamepad2Icon, { className: "size-5" }),
    "shopping-bag": _jsx(ShoppingBagIcon, { className: "size-5" }),
    repeat: _jsx(RepeatIcon, { className: "size-5" }),
    "heart-pulse": _jsx(HeartPulseIcon, { className: "size-5" }),
    "graduation-cap": _jsx(GraduationCapIcon, { className: "size-5" }),
    plane: _jsx(PlaneIcon, { className: "size-5" }),
};
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
export function BudgetRings() {
    return (_jsxs(Card, { className: "col-span-full", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base font-semibold", children: "Monthly Budgets" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-2 gap-6 sm:grid-cols-4", children: budgetCategories.map((b, i) => {
                        const percent = Math.min((b.spent / b.budget) * 100, 100);
                        const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
                        const isOver = b.spent > b.budget;
                        return (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsxs("div", { className: "relative size-24", children: [_jsxs("svg", { viewBox: "0 0 100 100", className: "size-full -rotate-90", children: [_jsx("circle", { cx: "50", cy: "50", r: RADIUS, fill: "none", stroke: "currentColor", className: "text-muted", strokeWidth: "8" }), _jsx(motion.circle, { cx: "50", cy: "50", r: RADIUS, fill: "none", stroke: "currentColor", className: isOver ? "text-destructive" : b.color, strokeWidth: "8", strokeLinecap: "round", strokeDasharray: CIRCUMFERENCE, initial: { strokeDashoffset: CIRCUMFERENCE }, animate: Object.assign({ strokeDashoffset: offset }, (isOver
                                                        ? { scale: [1, 1.03, 1], opacity: [1, 0.8, 1] }
                                                        : {})), transition: {
                                                        strokeDashoffset: {
                                                            duration: 1,
                                                            delay: i * 0.1,
                                                            ease: "easeOut",
                                                        },
                                                        scale: isOver
                                                            ? { duration: 1.5, repeat: Infinity }
                                                            : undefined,
                                                        opacity: isOver
                                                            ? { duration: 1.5, repeat: Infinity }
                                                            : undefined,
                                                    } })] }), _jsx("div", { className: cn("absolute inset-0 flex items-center justify-center", isOver ? "text-destructive" : b.color), children: iconMap[b.iconName] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs font-medium", children: b.category }), _jsxs("p", { className: "text-xs tabular-nums text-muted-foreground", children: ["$", b.spent.toLocaleString(), " ", _jsxs("span", { className: "text-muted-foreground/60", children: ["/ $", b.budget.toLocaleString()] })] })] })] }, b.id));
                    }) }) })] }));
}
