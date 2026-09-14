"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeftIcon, CheckCircle2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export function StepNetwork({ phone, networks, networkId, detectedNetworkId, onChange, onBack, onContinue, }) {
    var _a, _b;
    const [pendingId, setPendingId] = useState(null);
    const handleSelect = (id) => {
        if (detectedNetworkId && id !== detectedNetworkId) {
            setPendingId(id);
        }
        else {
            onChange(id);
            setTimeout(onContinue, 350);
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, className: "p-6 md:p-8 relative", children: [_jsxs("button", { onClick: onBack, className: "flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors", children: [_jsx(ArrowLeftIcon, { className: "size-4 mr-1" }), " Change number"] }), _jsx("h2", { className: "text-xl font-semibold mb-1", children: "Select network" }), _jsxs("p", { className: "text-muted-foreground text-sm mb-6", children: ["Confirm the network for ", _jsxs("span", { className: "font-medium text-foreground", children: ["+233 ", phone] }), "."] }), _jsx("div", { className: "grid gap-3 mb-4", children: networks.map((network) => (_jsxs("label", { className: cn("relative flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all hover:bg-muted/50", networkId === network.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-border"), children: [_jsx("input", { type: "radio", name: "network", className: "sr-only", checked: networkId === network.id, onChange: () => handleSelect(network.id) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-1 h-8 rounded-full", style: { backgroundColor: network.color } }), _jsxs("div", { children: [_jsx("span", { className: "font-semibold text-base", children: network.name }), detectedNetworkId === network.id && (_jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: "(detected)" }))] })] }), networkId === network.id && _jsx(CheckCircle2Icon, { className: "text-primary size-5" })] }, network.id))) }), _jsx(AnimatePresence, { children: pendingId && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm rounded-2xl", children: _jsxs(motion.div, { initial: { scale: 0.9, y: 16, opacity: 0 }, animate: { scale: 1, y: 0, opacity: 1 }, exit: { scale: 0.9, y: 16, opacity: 0 }, transition: { type: "spring", damping: 22, stiffness: 300 }, className: "bg-card border shadow-2xl rounded-2xl p-6 w-full max-w-sm relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" }), _jsx("h3", { className: "text-xl font-bold mb-2", children: "Are you sure?" }), _jsxs("p", { className: "text-muted-foreground text-sm mb-6 leading-relaxed", children: ["This number looks like a", " ", _jsx("strong", { className: "text-foreground", children: (_a = networks.find((n) => n.id === detectedNetworkId)) === null || _a === void 0 ? void 0 : _a.name }), " ", "number. Selecting the wrong network will cause the transaction to fail."] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs(Button, { className: "w-full", onClick: () => {
                                            onChange(pendingId);
                                            setPendingId(null);
                                            setTimeout(onContinue, 350);
                                        }, children: ["Yes, use ", (_b = networks.find((n) => n.id === pendingId)) === null || _b === void 0 ? void 0 : _b.name] }), _jsx(Button, { variant: "ghost", className: "w-full", onClick: () => setPendingId(null), children: "Cancel" })] })] }) })) })] }, "step-2"));
}
