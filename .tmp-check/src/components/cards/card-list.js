"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from "next/image";
import { cn } from "@/lib/utils";
function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}
export function CardList({ cards, activeCardId, onSelect, frozenMap, }) {
    return (_jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", children: cards.map((card) => {
            var _a;
            const isFrozen = (_a = frozenMap[card.id]) !== null && _a !== void 0 ? _a : false;
            const isActive = card.id === activeCardId;
            return (_jsx("button", { type: "button", onClick: () => onSelect(card.id), className: cn("relative aspect-[1.586/1] w-full cursor-pointer overflow-hidden rounded-xl p-3 text-left transition-all", card.color, isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background", isFrozen && "opacity-50 grayscale"), children: _jsxs("div", { className: "flex h-full flex-col justify-between", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("span", { className: "text-xs font-medium leading-tight", children: card.name }), _jsx(Image, { src: card.network === "visa" ? "/logos/visa-com.svg" : "/logos/mastercard-com.svg", alt: card.network, width: 32, height: 20, className: "h-5 w-auto object-contain" })] }), _jsxs("div", { children: [_jsxs("p", { className: "font-mono text-[10px] tabular-nums opacity-80", children: ["**** ", card.last4] }), _jsxs("p", { className: "mt-0.5 text-[10px] font-medium tabular-nums opacity-70", children: [formatCurrency(card.monthlySpend), " spent"] })] })] }) }, card.id));
        }) }));
}
