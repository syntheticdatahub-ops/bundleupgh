"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "motion/react";
import { PhoneIcon, PackageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const NETWORK_BG = {
    mtn: "#ffcc00",
    telecel: "#e20010",
    airteltigo: "#0033a0",
};
export function StepPhone({ phone, onChange, onSubmit, detectedNetwork, preselectedBundle, preselectedNetwork }) {
    var _a, _b;
    const netColor = preselectedNetwork
        ? (_a = NETWORK_BG[preselectedNetwork.id.toLowerCase()]) !== null && _a !== void 0 ? _a : preselectedNetwork.color
        : null;
    const isLight = (preselectedNetwork === null || preselectedNetwork === void 0 ? void 0 : preselectedNetwork.id.toLowerCase()) === "mtn";
    return (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 }, className: "p-6 md:p-8", children: [preselectedBundle && preselectedNetwork && (_jsxs(motion.div, { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, className: "flex items-center gap-3 rounded-xl p-3 mb-6", style: { backgroundColor: netColor !== null && netColor !== void 0 ? netColor : "#888" }, children: [_jsx("div", { className: "size-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0", style: { backgroundColor: "rgba(0,0,0,0.15)" }, children: _jsx(PackageIcon, { className: "size-5", style: { color: isLight ? "black" : "white" } }) }), _jsxs("div", { style: { color: isLight ? "black" : "white" }, children: [_jsxs("div", { className: "text-xs opacity-75 font-medium", children: [preselectedNetwork.name, " \u00B7 No Expiry"] }), _jsxs("div", { className: "font-bold text-lg leading-none", children: [preselectedBundle.dataSize, _jsxs("span", { className: "text-sm font-normal ml-2", children: ["GHS ", preselectedBundle.sellingPrice.toFixed(2)] })] })] })] })), _jsx("h2", { className: "text-xl font-semibold mb-1", children: preselectedBundle ? "Who receives the data?" : "Enter recipient number" }), _jsx("p", { className: "text-muted-foreground text-sm mb-6", children: preselectedBundle
                    ? `Enter the ${(_b = preselectedNetwork === null || preselectedNetwork === void 0 ? void 0 : preselectedNetwork.name) !== null && _b !== void 0 ? _b : ""} number that will receive the ${preselectedBundle.dataSize}.`
                    : "This is the number that will receive the data. It doesn't have to be yours." }), _jsxs("form", { onSubmit: onSubmit, className: "flex flex-col gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(PhoneIcon, { className: "absolute left-3.5 top-3.5 size-5 text-muted-foreground" }), _jsx(Input, { placeholder: "024 XXX XXXX", className: "pl-11 h-12 text-lg tracking-wide", value: phone, onChange: (e) => onChange(e.target.value.replace(/\D/g, "")), autoFocus: true, inputMode: "tel" }), detectedNetwork && (_jsx(motion.span, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, className: "absolute right-3 top-3 text-xs font-bold px-2 py-1 rounded-full text-white", style: { backgroundColor: detectedNetwork.color }, children: detectedNetwork.name }))] }), _jsx(Button, { type: "submit", size: "lg", className: "w-full h-12 text-base", disabled: phone.length < 9, children: preselectedBundle ? `Continue to pay GHS ${preselectedBundle.sellingPrice.toFixed(2)} →` : "Continue →" })] }), _jsx("p", { className: "mt-6 text-center text-xs text-muted-foreground", children: "No account required. The data goes directly to the recipient." })] }, "step-1"));
}
