"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { accountCards, walletBalance } from "@/data/seed";
import { CreditCardIcon, PlusIcon, TrendingUpIcon, EuroIcon, BitcoinIcon, ChartLineIcon, NfcIcon, XIcon, CheckCircle2Icon, LoaderCircleIcon, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
const initialCards = [
    Object.assign(Object.assign({}, accountCards[0]), { style: "bg-muted text-foreground", icon: _jsx(EuroIcon, { className: "size-5 opacity-30" }), chipColor: "bg-foreground/10", last4: "4589" }),
    Object.assign(Object.assign({}, accountCards[1]), { style: "bg-primary text-primary-foreground", icon: _jsx(BitcoinIcon, { className: "size-5 opacity-30" }), chipColor: "bg-primary-foreground/20", last4: "7321" }),
    Object.assign(Object.assign({}, accountCards[2]), { style: "bg-card text-card-foreground ring-1 ring-border", icon: _jsx(ChartLineIcon, { className: "size-5 opacity-30" }), chipColor: "bg-foreground/10", last4: "9012" }),
];
const newCardOptions = [
    { value: "savings", label: "Savings Account", currency: "$", style: "bg-emerald-600 text-white", icon: _jsx(TrendingUpIcon, { className: "size-5 opacity-30" }), chipColor: "bg-white/20" },
    { value: "business", label: "Business Account", currency: "$", style: "bg-violet-600 text-white", icon: _jsx(CreditCardIcon, { className: "size-5 opacity-30" }), chipColor: "bg-white/20" },
    { value: "travel", label: "Travel Card", currency: "€", style: "bg-amber-600 text-white", icon: _jsx(EuroIcon, { className: "size-5 opacity-30" }), chipColor: "bg-white/20" },
];
export function AccountCards() {
    var _a;
    const [cards, setCards] = useState(initialCards);
    const [order, setOrder] = useState(() => initialCards.map((_, i) => i));
    const [addState, setAddState] = useState("idle");
    const [newCardType, setNewCardType] = useState("savings");
    const [newCardName, setNewCardName] = useState("");
    const cycle = useCallback(() => {
        setOrder((prev) => {
            const next = [...prev];
            const front = next.pop();
            next.unshift(front);
            return next;
        });
    }, []);
    useEffect(() => {
        if (addState !== "idle")
            return;
        const id = setInterval(cycle, 2000);
        return () => clearInterval(id);
    }, [cycle, addState]);
    const handleAdd = () => {
        setAddState("adding");
        setTimeout(() => {
            const option = newCardOptions.find((o) => o.value === newCardType);
            const newCard = {
                id: String(cards.length + 1),
                label: newCardName || option.label,
                balance: "0",
                currency: option.currency,
                variant: "default",
                style: option.style,
                icon: option.icon,
                chipColor: option.chipColor,
                last4: String(Math.floor(1000 + Math.random() * 9000)),
            };
            setCards((prev) => [...prev, newCard]);
            setOrder((prev) => [...prev, prev.length]);
            setAddState("success");
            setTimeout(() => {
                setAddState("idle");
                setNewCardName("");
            }, 1500);
        }, 1200);
    };
    return (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col gap-5 pt-6", children: [_jsx(AnimatePresence, { mode: "wait", children: addState === "idle" ? (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx("div", { className: "relative h-[200px]", children: order.map((cardIndex, stackPos) => {
                                const c = cards[cardIndex];
                                if (!c)
                                    return null;
                                const isFront = stackPos === order.length - 1;
                                const maxOffset = 48 / Math.max(order.length - 1, 1);
                                return (_jsxs(motion.button, { onClick: cycle, layout: true, animate: {
                                        y: stackPos * Math.min(maxOffset, 16),
                                        scale: 1 - (order.length - 1 - stackPos) * (0.12 / Math.max(order.length - 1, 1)),
                                        zIndex: stackPos,
                                    }, transition: { type: "spring", stiffness: 400, damping: 28 }, className: cn("absolute inset-x-0 flex h-[152px] cursor-pointer flex-col justify-between rounded-2xl px-5 py-4", c.style, isFront ? "shadow-xl" : "shadow-md"), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-semibold tracking-wide", children: c.label }), c.icon] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: cn("h-7 w-10 rounded-md", c.chipColor) }), _jsx(NfcIcon, { className: "size-4 opacity-20" })] }), _jsxs("div", { className: "flex items-end justify-between", children: [_jsxs("span", { className: "font-mono text-[10px] tracking-widest opacity-40", children: ["**** ", c.last4] }), _jsx("p", { className: "text-xl font-bold tabular-nums tracking-tight", children: c.currency === "BTC"
                                                        ? `${c.balance} ${c.currency}`
                                                        : `${c.currency}${c.balance}` })] })] }, c.id));
                            }) }) }, "cards")) : (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: "flex h-[200px] flex-col", children: addState === "success" ? (_jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-2", children: [_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 300, damping: 20 }, children: _jsx(CheckCircle2Icon, { className: "size-10 text-emerald-500" }) }), _jsx("p", { className: "text-sm font-semibold", children: "Card added!" }), _jsx("p", { className: "text-xs text-muted-foreground", children: newCardName || ((_a = newCardOptions.find((o) => o.value === newCardType)) === null || _a === void 0 ? void 0 : _a.label) })] })) : addState === "adding" ? (_jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-3", children: [_jsx(LoaderCircleIcon, { className: "size-8 animate-spin text-muted-foreground" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Creating card..." })] })) : (_jsxs("div", { className: "flex flex-1 flex-col gap-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-semibold", children: "Add New Card" }), _jsx(Button, { variant: "ghost", size: "icon", className: "size-7", onClick: () => setAddState("idle"), children: _jsx(XIcon, { className: "size-4" }) })] }), _jsxs(Select, { value: newCardType, onValueChange: (v) => v && setNewCardType(v), children: [_jsx(SelectTrigger, { className: "h-9 text-xs", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: newCardOptions.map((o) => (_jsx(SelectItem, { value: o.value, children: o.label }, o.value))) })] }), _jsx(Input, { placeholder: "Card name (optional)", value: newCardName, onChange: (e) => setNewCardName(e.target.value), className: "h-9 text-xs" }), _jsxs(Button, { className: "h-9 gap-2 text-xs", onClick: handleAdd, children: [_jsx(PlusIcon, { className: "size-3.5" }), "Create Card"] })] })) }, "add-flow")) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(CreditCardIcon, { className: "size-3.5" }), _jsxs("span", { children: [cards.length, " cards"] })] }), _jsx(Button, { variant: "outline", size: "icon", className: "size-7 rounded-full", onClick: () => addState === "idle" && setAddState("form"), children: _jsx(PlusIcon, { className: "size-3.5" }) })] }), _jsxs("div", { className: "space-y-1.5 border-t pt-5", children: [_jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "Wallet Balance" }), _jsxs("p", { className: "text-3xl font-bold tabular-nums tracking-tight", children: ["$", walletBalance.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })] }), _jsxs("div", { className: "flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400", children: [_jsx(TrendingUpIcon, { className: "size-4" }), _jsxs("span", { children: ["+", walletBalance.changePercent, "% this month"] })] })] })] }) }));
}
