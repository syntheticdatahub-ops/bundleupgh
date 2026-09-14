"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LoaderIcon, CopyIcon, CheckIcon, PlusIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
function randomDigits(n) {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}
export function VirtualCardGenerator({ onCardCreated, }) {
    const [step, setStep] = useState("idle");
    const [name, setName] = useState("");
    const [limit, setLimit] = useState("");
    const [newCard, setNewCard] = useState(null);
    const [copied, setCopied] = useState(false);
    const reset = useCallback(() => {
        setStep("idle");
        setName("");
        setLimit("");
        setNewCard(null);
        setCopied(false);
    }, []);
    const handleGenerate = useCallback(() => {
        if (!name.trim())
            return;
        setStep("loading");
        const last4 = randomDigits(4);
        const card = {
            id: `vc-${Date.now()}`,
            name: name.trim(),
            type: "virtual",
            last4,
            cardNumber: `${randomDigits(4)} ${randomDigits(4)} ${randomDigits(4)} ${last4}`,
            holder: "ALEX MORGAN",
            expiry: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${String(new Date().getFullYear() + 3).slice(-2)}`,
            cvv: randomDigits(3),
            network: Math.random() > 0.5 ? "visa" : "mastercard",
            frozen: false,
            dailyLimit: 1000,
            monthlySpend: 0,
            monthlyLimit: Number(limit) || 3000,
            color: "bg-muted text-foreground",
        };
        setTimeout(() => {
            setNewCard(card);
            setStep("success");
            onCardCreated(card);
            setTimeout(() => {
                reset();
            }, 4000);
        }, 1200);
    }, [name, limit, onCardCreated, reset]);
    const handleCopy = useCallback(() => {
        if (!newCard)
            return;
        navigator.clipboard.writeText(newCard.cardNumber.replace(/\s/g, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [newCard]);
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Generate Virtual Card" }) }), _jsx(CardContent, { children: _jsxs(AnimatePresence, { mode: "wait", children: [step === "idle" && (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, children: [_jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "Create a disposable virtual card for online purchases." }), _jsxs(Button, { onClick: () => setStep("form"), className: "w-full", children: [_jsx(PlusIcon, { className: "size-4" }), "Create Virtual Card"] })] }, "idle")), step === "form" && (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, className: "space-y-3", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Card Name" }), _jsx(Input, { placeholder: "e.g. Netflix Sub", value: name, onChange: (e) => setName(e.target.value) })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Monthly Limit ($)" }), _jsx(Input, { type: "number", placeholder: "3000", value: limit, onChange: (e) => setLimit(e.target.value) })] }), _jsxs("div", { className: "flex gap-2 pt-1", children: [_jsx(Button, { variant: "outline", className: "flex-1", onClick: reset, children: "Cancel" }), _jsx(Button, { className: "flex-1", disabled: !name.trim(), onClick: handleGenerate, children: "Generate" })] })] }, "form")), step === "loading" && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "flex flex-col items-center gap-3 py-6", children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { repeat: Infinity, duration: 1, ease: "linear" }, children: _jsx(LoaderIcon, { className: "size-6 text-muted-foreground" }) }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Generating..." })] }, "loading")), step === "success" && newCard && (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, className: "space-y-3", children: [_jsxs("div", { className: "rounded-lg bg-muted/50 p-3", children: [_jsx("p", { className: "mb-1 text-xs text-muted-foreground", children: "Card Number" }), _jsx(motion.p, { className: "font-mono text-sm font-medium tabular-nums", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6 }, children: newCard.cardNumber }), _jsxs("div", { className: "mt-2 flex gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Exp" }), _jsx("p", { className: "text-xs font-medium tabular-nums", children: newCard.expiry })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "CVV" }), _jsx("p", { className: "text-xs font-medium tabular-nums", children: newCard.cvv })] })] })] }), _jsx(Button, { variant: "outline", size: "sm", className: "w-full", onClick: (e) => {
                                        e.stopPropagation();
                                        handleCopy();
                                    }, children: copied ? (_jsxs(_Fragment, { children: [_jsx(CheckIcon, { className: "size-3.5" }), "Copied!"] })) : (_jsxs(_Fragment, { children: [_jsx(CopyIcon, { className: "size-3.5" }), "Copy Number"] })) })] }, "success"))] }) })] }));
}
