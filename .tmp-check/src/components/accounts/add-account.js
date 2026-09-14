"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { PlusIcon, CheckIcon, LoaderIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
const accountTypes = [
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Savings" },
    { value: "crypto", label: "Crypto" },
    { value: "investment", label: "Investment" },
];
const typeColors = {
    checking: "bg-blue-500",
    savings: "bg-emerald-500",
    crypto: "bg-orange-500",
    investment: "bg-violet-500",
};
export function AddAccount({ onAdd }) {
    const [step, setStep] = useState("idle");
    const [institution, setInstitution] = useState("");
    const [accountType, setAccountType] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    function handleConnect() {
        if (!institution || !accountType || !accountNumber)
            return;
        setStep("loading");
        setTimeout(() => {
            var _a;
            const newAccount = {
                id: `ba-${Date.now()}`,
                name: `${institution} ${accountType.charAt(0).toUpperCase() + accountType.slice(1)}`,
                type: accountType,
                institution,
                institutionLogo: `/logos/${institution.toLowerCase().replace(/\s+/g, "")}-com.png`,
                accountNumber: `****${accountNumber.slice(-4)}`,
                balance: 0,
                currency: "$",
                change: 0,
                changePercent: 0,
                lastActivity: "Just now",
                color: (_a = typeColors[accountType]) !== null && _a !== void 0 ? _a : "bg-gray-500",
            };
            onAdd(newAccount);
            setStep("success");
            setTimeout(() => {
                setStep("idle");
                setInstitution("");
                setAccountType("");
                setAccountNumber("");
            }, 1500);
        }, 1500);
    }
    return (_jsx(Card, { className: cn("flex min-h-[180px] items-center justify-center border-2 border-dashed ring-0 transition-colors", step === "idle" && "cursor-pointer hover:border-primary/40 hover:bg-muted/30"), onClick: () => step === "idle" && setStep("form"), children: _jsx(CardContent, { className: "flex w-full flex-col items-center justify-center", children: _jsxs(AnimatePresence, { mode: "wait", children: [step === "idle" && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "flex flex-col items-center gap-2 text-muted-foreground", children: [_jsx("div", { className: "flex size-10 items-center justify-center rounded-full bg-muted", children: _jsx(PlusIcon, { className: "size-5" }) }), _jsx("span", { className: "text-sm font-medium", children: "Link New Account" })] }, "idle")), step === "form" && (_jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, className: "flex w-full flex-col gap-3", onClick: (e) => e.stopPropagation(), children: [_jsx(Input, { placeholder: "Institution name", value: institution, onChange: (e) => setInstitution(e.target.value) }), _jsxs(Select, { value: accountType, onValueChange: (v) => v && setAccountType(v), children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Account type" }) }), _jsx(SelectContent, { children: accountTypes.map((t) => (_jsx(SelectItem, { value: t.value, children: t.label }, t.value))) })] }), _jsx(Input, { placeholder: "Account number", value: accountNumber, onChange: (e) => setAccountNumber(e.target.value) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => {
                                            setStep("idle");
                                            setInstitution("");
                                            setAccountType("");
                                            setAccountNumber("");
                                        }, children: "Cancel" }), _jsx(Button, { size: "sm", className: "flex-1", disabled: !institution || !accountType || !accountNumber, onClick: handleConnect, children: "Connect" })] })] }, "form")), step === "loading" && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "flex flex-col items-center gap-2 text-muted-foreground", children: [_jsx(LoaderIcon, { className: "size-6 animate-spin" }), _jsx("span", { className: "text-sm", children: "Connecting..." })] }, "loading")), step === "success" && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0 }, className: "flex flex-col items-center gap-2 text-emerald-500", children: [_jsx("div", { className: "flex size-10 items-center justify-center rounded-full bg-emerald-500/10", children: _jsx(CheckIcon, { className: "size-5" }) }), _jsx("span", { className: "text-sm font-medium", children: "Connected!" })] }, "success"))] }) }) }));
}
