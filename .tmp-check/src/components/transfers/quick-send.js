"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { contacts } from "@/data/seed";
import { SendIcon, LoaderCircleIcon, CheckCircle2Icon, } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
export function QuickSend({ onSend }) {
    const [selectedContact, setSelectedContact] = useState(contacts[0].id);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [sendState, setSendState] = useState("idle");
    const timeoutRef = useRef(null);
    const selected = contacts.find((c) => c.id === selectedContact);
    const handleSend = () => {
        if (sendState !== "idle" || !amount || parseFloat(amount) <= 0)
            return;
        setSendState("sending");
        timeoutRef.current = setTimeout(() => {
            setSendState("success");
            if (onSend && selected) {
                const newRecord = {
                    id: `tr-${Date.now()}`,
                    type: "sent",
                    contactName: selected.name,
                    contactAvatar: selected.avatar,
                    amount: parseFloat(amount),
                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                    status: "completed",
                    note: note || undefined,
                };
                onSend(newRecord);
            }
            timeoutRef.current = setTimeout(() => {
                setSendState("idle");
                setAmount("");
                setNote("");
            }, 2000);
        }, 1500);
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base font-semibold", children: "Quick Send" }) }), _jsx(CardContent, { children: _jsx(AnimatePresence, { mode: "wait", children: sendState === "success" ? (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "flex flex-col items-center gap-2 py-4", children: [_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.1 }, children: _jsx(CheckCircle2Icon, { className: "size-10 text-emerald-500" }) }), _jsxs("p", { className: "text-sm font-semibold", children: ["$", parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 }), " sent!"] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["To ", selected === null || selected === void 0 ? void 0 : selected.name] })] }, "success")) : (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "flex flex-col gap-4 lg:flex-row lg:items-end", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs text-muted-foreground", children: "To" }), _jsx("div", { className: "flex items-center gap-1 pt-1", children: contacts.slice(0, 6).map((contact) => {
                                            const isSelected = selectedContact === contact.id;
                                            return (_jsx(motion.button, { onClick: () => {
                                                    if (sendState === "idle")
                                                        setSelectedContact(contact.id);
                                                }, className: "relative shrink-0 rounded-full", animate: {
                                                    scale: isSelected ? 1 : 0.85,
                                                    opacity: isSelected ? 1 : 0.6,
                                                }, whileHover: { scale: isSelected ? 1 : 0.95, opacity: 1 }, transition: { type: "spring", stiffness: 400, damping: 25 }, children: _jsxs(Avatar, { className: isSelected
                                                        ? "size-9 ring-2 ring-primary"
                                                        : "size-8", children: [_jsx(AvatarImage, { src: contact.avatar, alt: contact.name }), _jsx(AvatarFallback, { className: "text-[10px]", children: contact.name.split(" ").map((n) => n[0]).join("") })] }) }, contact.id));
                                        }) }), _jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.p, { initial: { opacity: 0, y: 2 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -2 }, transition: { duration: 0.12 }, className: "text-xs text-muted-foreground", children: ["Sending to", " ", _jsx("span", { className: "font-medium text-foreground", children: selected === null || selected === void 0 ? void 0 : selected.name })] }, selectedContact) })] }), _jsxs("div", { className: "flex-1 space-y-1.5 lg:max-w-[160px]", children: [_jsx("label", { className: "text-xs text-muted-foreground", children: "Amount" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground", children: "$" }), _jsx(Input, { type: "text", placeholder: "0.00", value: amount, onChange: (e) => setAmount(e.target.value), disabled: sendState === "sending", className: "h-9 pl-7 tabular-nums" })] })] }), _jsxs("div", { className: "flex-1 space-y-1.5 lg:max-w-[200px]", children: [_jsxs("label", { className: "text-xs text-muted-foreground", children: ["Note ", _jsx("span", { className: "text-muted-foreground/60", children: "(optional)" })] }), _jsx(Input, { type: "text", placeholder: "What's it for?", value: note, onChange: (e) => setNote(e.target.value), disabled: sendState === "sending", className: "h-9" })] }), _jsxs(Button, { className: "h-9 gap-2 px-6", disabled: sendState === "sending" || !amount || parseFloat(amount) <= 0, onClick: handleSend, children: [sendState === "sending" ? (_jsx(LoaderCircleIcon, { className: "size-4 animate-spin" })) : (_jsx(SendIcon, { className: "size-4" })), sendState === "sending" ? "Sending..." : "Send"] })] }, "form")) }) })] }));
}
