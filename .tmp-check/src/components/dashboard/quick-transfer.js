"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { contacts } from "@/data/seed";
import { ChevronRightIcon, SendIcon, LoaderCircleIcon, CheckCircle2Icon, } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
export function QuickTransfer() {
    const [selectedContact, setSelectedContact] = useState(contacts[0].id);
    const [amount, setAmount] = useState("250.00");
    const [sendState, setSendState] = useState("idle");
    const timeoutRef = useRef(null);
    const selected = contacts.find((c) => c.id === selectedContact);
    const handleSend = () => {
        if (sendState !== "idle" || !amount || parseFloat(amount) <= 0)
            return;
        setSendState("sending");
        // simulate network delay
        timeoutRef.current = setTimeout(() => {
            setSendState("success");
            timeoutRef.current = setTimeout(() => {
                setSendState("idle");
            }, 2000);
        }, 1500);
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4", children: [_jsx(CardTitle, { className: "text-base font-semibold", children: "Quick Transfer" }), _jsxs(Button, { variant: "ghost", size: "sm", className: "h-auto gap-1 px-0 text-xs text-muted-foreground", children: ["See All Contacts", _jsx(ChevronRightIcon, { className: "size-3" })] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex items-center py-2", children: contacts.slice(0, 6).map((contact) => {
                                    const isSelected = selectedContact === contact.id;
                                    return (_jsx(motion.button, { onClick: () => {
                                            if (sendState === "idle")
                                                setSelectedContact(contact.id);
                                        }, className: "relative shrink-0 rounded-full", animate: {
                                            scale: isSelected ? 1.2 : 0.9,
                                            marginLeft: isSelected ? 6 : -4,
                                            marginRight: isSelected ? 6 : -4,
                                            zIndex: isSelected ? 10 : 1,
                                            opacity: isSelected ? 1 : 0.7,
                                        }, whileHover: { scale: isSelected ? 1.2 : 1, opacity: 1 }, transition: { type: "spring", stiffness: 400, damping: 25 }, children: _jsxs(Avatar, { className: isSelected
                                                ? "size-11 ring-2 ring-primary ring-offset-2 ring-offset-background"
                                                : "size-10", children: [_jsx(AvatarImage, { src: contact.avatar, alt: contact.name }), _jsx(AvatarFallback, { className: "text-xs", children: contact.name.split(" ").map((n) => n[0]).join("") })] }) }, contact.id));
                                }) }), _jsx(Button, { variant: "outline", size: "icon", className: "size-10 shrink-0 rounded-full", children: _jsx(ChevronRightIcon, { className: "size-4" }) })] }), _jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.p, { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 }, transition: { duration: 0.15 }, className: "text-xs text-muted-foreground", children: ["Sending to", " ", _jsx("span", { className: "font-medium text-foreground", children: selected === null || selected === void 0 ? void 0 : selected.name })] }, selectedContact) }), _jsx(AnimatePresence, { mode: "wait", children: sendState === "success" ? (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "flex flex-col items-center gap-2 py-3", children: [_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.1 }, children: _jsx(CheckCircle2Icon, { className: "size-10 text-emerald-500" }) }), _jsxs("p", { className: "text-sm font-semibold", children: ["$", parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 }), " sent!"] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["To ", selected === null || selected === void 0 ? void 0 : selected.name] })] }, "success")) : (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "flex items-end gap-3", children: [_jsxs("div", { className: "flex-1 space-y-1.5", children: [_jsx("label", { className: "text-xs text-muted-foreground", children: "Amount" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground", children: "$" }), _jsx(Input, { type: "text", value: amount, onChange: (e) => setAmount(e.target.value), disabled: sendState === "sending", className: "h-10 pl-7 text-lg font-semibold tabular-nums" })] })] }), _jsxs(Button, { className: "h-10 gap-2 px-6", disabled: sendState === "sending", onClick: handleSend, children: [sendState === "sending" ? (_jsx(LoaderCircleIcon, { className: "size-4 animate-spin" })) : (_jsx(SendIcon, { className: "size-4" })), sendState === "sending" ? "Sending..." : "Send"] })] }, "form")) })] })] }));
}
