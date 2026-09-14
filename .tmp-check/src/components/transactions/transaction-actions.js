"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { AnimatePresence, motion } from "motion/react";
import { DownloadIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
export function TransactionActions({ selectedCount, onExport, onClear, }) {
    return (_jsx(AnimatePresence, { children: selectedCount > 0 && (_jsx(motion.div, { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 100, opacity: 0 }, transition: { type: "spring", damping: 25, stiffness: 300 }, className: "fixed inset-x-0 bottom-0 z-50 flex items-center justify-center p-4 md:pl-[calc(var(--sidebar-width)+1rem)]", children: _jsxs("div", { className: "flex items-center gap-3 rounded-xl bg-card px-4 py-2.5 shadow-lg ring-1 ring-foreground/10", children: [_jsxs("span", { className: "tabular-nums text-sm font-medium", children: [selectedCount, " selected"] }), _jsx("div", { className: "h-4 w-px bg-border" }), _jsxs(Button, { variant: "outline", size: "sm", onClick: onExport, children: [_jsx(DownloadIcon, { className: "size-3.5" }), "Export CSV"] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: onClear, children: [_jsx(XIcon, { className: "size-3.5" }), "Clear"] })] }) })) }));
}
