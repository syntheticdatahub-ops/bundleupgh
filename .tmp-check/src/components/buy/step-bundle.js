"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
export function StepBundle({ bundles, selectedNetwork, bundleId, phone, onSelect, onBack, onContinue, }) {
    const [isConfirming, setIsConfirming] = useState(false);
    return (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, className: "p-6 md:p-8", children: [_jsxs(motion.div, { animate: { opacity: isConfirming ? 0 : 1, y: isConfirming ? -10 : 0 }, transition: { duration: 0.3 }, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("button", { onClick: onBack, disabled: isConfirming, className: "flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors", children: [_jsx(ArrowLeftIcon, { className: "size-4 mr-1" }), " Change number"] }), selectedNetwork && (_jsxs("span", { className: "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", style: { borderColor: selectedNetwork.color, color: selectedNetwork.color }, children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full", style: { backgroundColor: selectedNetwork.color } }), selectedNetwork.name, " detected"] }))] }), _jsx("h2", { className: "text-xl font-semibold mb-1", children: "Choose your bundle" }), _jsx("p", { className: "text-muted-foreground text-sm mb-6", children: phone ? `Select a package for +233 ${phone}` : "Select a data package." })] }), _jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8 relative", children: bundles.map((bundle) => {
                    const isSelected = bundleId === bundle.id;
                    let cardColor = "";
                    let textColor = "";
                    let mutedColor = "text-muted-foreground";
                    let priceColor = "text-primary";
                    let tagBg = "bg-primary text-primary-foreground";
                    let borderClass = isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border";
                    let hoverClass = !isConfirming ? "hover:border-primary/50" : "";
                    if (selectedNetwork) {
                        const net = selectedNetwork.id.toLowerCase();
                        if (net === "mtn") {
                            cardColor = "bg-[#ffcc00]";
                            textColor = "text-black";
                            mutedColor = "text-black/70";
                            priceColor = "text-black";
                            tagBg = "bg-black text-[#ffcc00]";
                            borderClass = isSelected ? "border-black ring-2 ring-black shadow-md" : "border-transparent";
                            hoverClass = !isConfirming ? "hover:ring-1 hover:ring-black/50" : "";
                        }
                        else if (net === "telecel") {
                            cardColor = "bg-[#e20010]";
                            textColor = "text-white";
                            mutedColor = "text-white/80";
                            priceColor = "text-white";
                            tagBg = "bg-white text-[#e20010]";
                            borderClass = isSelected ? "border-white ring-2 ring-white shadow-md" : "border-transparent";
                            hoverClass = !isConfirming ? "hover:ring-1 hover:ring-white/50" : "";
                        }
                        else if (net === "airteltigo") {
                            cardColor = "bg-[#0033a0]";
                            textColor = "text-white";
                            mutedColor = "text-white/80";
                            priceColor = "text-white";
                            tagBg = "bg-white text-[#0033a0]";
                            borderClass = isSelected ? "border-white ring-2 ring-white shadow-md" : "border-transparent";
                            hoverClass = !isConfirming ? "hover:ring-1 hover:ring-white/50" : "";
                        }
                    }
                    return (_jsxs(motion.label, { animate: {
                            opacity: isConfirming && !isSelected ? 0 : 1,
                            scale: isConfirming && isSelected ? 1.05 : 1,
                            filter: isConfirming && !isSelected ? "blur(8px)" : "blur(0px)",
                            zIndex: isConfirming && isSelected ? 10 : 1
                        }, transition: { duration: 0.5, type: "spring", bounce: 0.3 }, className: cn("relative flex flex-col p-3 border rounded-xl cursor-pointer transition-all", !bundle.active && "opacity-40 pointer-events-none", cardColor, textColor, borderClass, hoverClass, isConfirming && isSelected && "shadow-2xl"), children: [_jsx("input", { type: "radio", name: "bundle", className: "sr-only", checked: isSelected, onChange: () => {
                                    if (bundle.active && !isConfirming) {
                                        onSelect(bundle.id);
                                        setIsConfirming(true);
                                        setTimeout(() => onContinue(bundle.id), 600);
                                    }
                                }, disabled: !bundle.active || isConfirming }), bundle.tag && (_jsx("span", { className: cn("absolute -top-2 right-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full", tagBg), children: bundle.tag.replace("-", " ") })), _jsx("div", { className: "flex items-center gap-1 mb-0.5", children: selectedNetwork && (_jsx("span", { className: "text-[10px] font-bold opacity-80 uppercase tracking-tighter", children: selectedNetwork.name })) }), _jsx("span", { className: "font-bold text-xl leading-none mb-1", children: bundle.dataSize }), _jsx("span", { className: cn("text-[10px] mb-2", mutedColor), children: "No Expiry" }), _jsxs("div", { className: "mt-auto flex items-end justify-between", children: [_jsxs("span", { className: cn("font-semibold text-sm", priceColor), children: ["GHS ", bundle.sellingPrice.toFixed(2)] }), _jsx("span", { className: cn("text-[9px] px-1.5 py-0.5 rounded opacity-80 font-medium", (selectedNetwork === null || selectedNetwork === void 0 ? void 0 : selectedNetwork.id) === "mtn" ? "bg-black/10" : "bg-white/20"), children: "Buy" })] })] }, bundle.id));
                }) })] }, "step-3"));
}
