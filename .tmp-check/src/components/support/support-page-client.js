"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { faqItems, supportTickets, systemStatus, } from "@/data/seed";
import { SearchIcon, ChevronDownIcon, MessageSquarePlusIcon, BookOpenIcon, TicketIcon, ActivityIcon, MailIcon, MessageCircleIcon, HeadphonesIcon, LoaderIcon, CheckCircle2Icon, ClockIcon, CircleDotIcon, AlertCircleIcon, ShieldIcon, CreditCardIcon, WalletIcon, HelpCircleIcon, SendIcon, BotIcon, UserIcon, } from "lucide-react";
const tabs = [
    { id: "faq", label: "FAQ", icon: _jsx(BookOpenIcon, { className: "size-4" }) },
    { id: "tickets", label: "My Tickets", icon: _jsx(TicketIcon, { className: "size-4" }) },
    { id: "contact", label: "Contact Us", icon: _jsx(MessageSquarePlusIcon, { className: "size-4" }) },
    { id: "status", label: "System Status", icon: _jsx(ActivityIcon, { className: "size-4" }) },
];
const categoryIcons = {
    account: _jsx(WalletIcon, { className: "size-3.5" }),
    payments: _jsx(CreditCardIcon, { className: "size-3.5" }),
    security: _jsx(ShieldIcon, { className: "size-3.5" }),
    billing: _jsx(MailIcon, { className: "size-3.5" }),
    general: _jsx(HelpCircleIcon, { className: "size-3.5" }),
};
const categoryColors = {
    account: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    payments: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    security: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    billing: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    general: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};
// ── FAQ Tab ──────────────────────────────────────────────────────────────────
const categoryFilters = ["all", "account", "payments", "security", "billing", "general"];
function FaqTab() {
    const [search, setSearch] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState("all");
    const [openId, setOpenId] = React.useState(null);
    const filtered = faqItems.filter((item) => {
        const matchesSearch = !search ||
            item.question.toLowerCase().includes(search.toLowerCase()) ||
            item.answer.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "relative", children: [_jsx(SearchIcon, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search for answers...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9" })] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: categoryFilters.map((cat) => (_jsx("button", { onClick: () => setCategoryFilter(cat), className: cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize", categoryFilter === cat
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"), children: cat === "all" ? "All Topics" : cat }, cat))) })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: _jsx(AnimatePresence, { mode: "popLayout", initial: false, children: filtered.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground", children: [_jsx(SearchIcon, { className: "size-10 opacity-30" }), _jsx("p", { className: "text-sm font-medium", children: "No matching questions" }), _jsx("p", { className: "text-xs", children: "Try a different search term or category" })] }, "empty")) : (filtered.map((item, i) => {
                            const isOpen = openId === item.id;
                            return (_jsx(motion.div, { layout: true, initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.15, delay: i * 0.02 }, className: "border-b last:border-b-0", children: _jsxs("button", { type: "button", onClick: () => setOpenId(isOpen ? null : item.id), className: "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50", children: [_jsx("div", { className: cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", categoryColors[item.category]), children: categoryIcons[item.category] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: cn("text-sm", isOpen ? "font-semibold" : "font-medium"), children: item.question }), _jsx(AnimatePresence, { initial: false, children: isOpen && (_jsxs(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.2 }, className: "overflow-hidden", children: [_jsx("p", { className: "mt-2 text-sm leading-relaxed text-muted-foreground", children: item.answer }), _jsxs("div", { className: "mt-3 flex items-center gap-3", children: [_jsx("span", { className: "text-[11px] text-muted-foreground", children: "Was this helpful?" }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { type: "button", className: "rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600", children: "Yes" }), _jsx("button", { type: "button", className: "rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600", children: "No" })] })] })] })) })] }), _jsx(motion.div, { animate: { rotate: isOpen ? 180 : 0 }, transition: { duration: 0.2 }, className: "mt-0.5 shrink-0", children: _jsx(ChevronDownIcon, { className: "size-4 text-muted-foreground" }) })] }) }, item.id));
                        })) }) }) })] }));
}
// ── Tickets Tab ──────────────────────────────────────────────────────────────
const ticketStatusConfig = {
    open: { label: "Open", icon: _jsx(CircleDotIcon, { className: "size-3" }), className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    "in-progress": { label: "In Progress", icon: _jsx(ClockIcon, { className: "size-3" }), className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    resolved: { label: "Resolved", icon: _jsx(CheckCircle2Icon, { className: "size-3" }), className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
};
const priorityConfig = {
    high: { label: "High", dot: "bg-rose-500" },
    medium: { label: "Medium", dot: "bg-amber-500" },
    low: { label: "Low", dot: "bg-muted-foreground" },
};
function TicketsTab() {
    const [tickets] = React.useState(supportTickets);
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "grid grid-cols-3 gap-3", children: ["open", "in-progress", "resolved"].map((status) => {
                    const count = tickets.filter((t) => t.status === status).length;
                    const cfg = ticketStatusConfig[status];
                    return (_jsx(Card, { children: _jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [_jsx("div", { className: cn("flex size-9 items-center justify-center rounded-xl", cfg.className), children: cfg.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-bold tabular-nums", children: count }), _jsx("p", { className: "text-[11px] text-muted-foreground", children: cfg.label })] })] }) }, status));
                }) }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Ticket History" }), _jsx(CardDescription, { children: "Track progress on your support requests" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "relative space-y-0", children: [_jsx("div", { className: "absolute left-[18px] top-3 bottom-3 w-px bg-border" }), tickets.map((ticket, i) => {
                                    const sCfg = ticketStatusConfig[ticket.status];
                                    const pCfg = priorityConfig[ticket.priority];
                                    return (_jsxs(motion.div, { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.1 }, className: "relative flex gap-4 pb-6 last:pb-0", children: [_jsx("div", { className: cn("relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 bg-background", sCfg.className), children: sCfg.icon }), _jsxs("div", { className: "flex-1 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-sm font-semibold", children: ticket.subject }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: "font-mono text-[10px] text-muted-foreground", children: ["#", ticket.id] }), _jsxs("span", { className: "flex items-center gap-1 text-[11px] text-muted-foreground", children: [_jsx("span", { className: cn("size-1.5 rounded-full", pCfg.dot) }), pCfg.label, " priority"] })] })] }), _jsxs(Badge, { variant: "outline", className: cn("shrink-0 gap-1 text-[10px]", sCfg.className), children: [sCfg.icon, sCfg.label] })] }), _jsxs("div", { className: "mt-3 flex items-center gap-4 text-[11px] text-muted-foreground", children: [_jsxs("span", { children: ["Created ", ticket.createdAt] }), _jsxs("span", { children: ["Updated ", ticket.lastUpdate] })] })] })] }, ticket.id));
                                })] }) })] })] }));
}
const botResponses = [
    "Thanks for reaching out! Let me look into that for you.",
    "I can see your account. Let me pull up the relevant details.",
    "I've escalated this to our specialist team. You should hear back within 2 hours.",
    "Is there anything else I can help you with today?",
];
function LiveChatSimulator() {
    const [messages, setMessages] = React.useState([
        { id: "welcome", sender: "bot", text: "Hi there! I'm Vault Assistant. How can I help you today?" },
    ]);
    const [input, setInput] = React.useState("");
    const [typing, setTyping] = React.useState(false);
    const responseIdx = React.useRef(0);
    const scrollRef = React.useRef(null);
    React.useEffect(() => {
        var _a;
        (_a = scrollRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, typing]);
    function handleSend() {
        if (!input.trim())
            return;
        const userMsg = { id: `u-${Date.now()}`, sender: "user", text: input.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setTyping(true);
        setTimeout(() => {
            const botText = botResponses[responseIdx.current % botResponses.length];
            responseIdx.current++;
            setTyping(false);
            setMessages((prev) => [...prev, { id: `b-${Date.now()}`, sender: "bot", text: botText }]);
        }, 1200 + Math.random() * 800);
    }
    return (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-3 border-b bg-primary/5 px-4 py-3", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground", children: _jsx(BotIcon, { className: "size-4" }) }), _jsx("span", { className: "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold", children: "Vault Assistant" }), _jsx("p", { className: "text-[11px] text-muted-foreground", children: "Online \u00B7 Avg. reply: 30s" })] })] }), _jsxs("div", { ref: scrollRef, className: "h-[280px] overflow-y-auto p-4 space-y-3", children: [_jsx(AnimatePresence, { initial: false, children: messages.map((msg) => (_jsxs(motion.div, { initial: { opacity: 0, y: 8, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.2 }, className: cn("flex gap-2", msg.sender === "user" && "flex-row-reverse"), children: [_jsx("div", { className: cn("flex size-7 shrink-0 items-center justify-center rounded-full", msg.sender === "bot" ? "bg-primary text-primary-foreground" : "bg-muted"), children: msg.sender === "bot" ? _jsx(BotIcon, { className: "size-3.5" }) : _jsx(UserIcon, { className: "size-3.5 text-muted-foreground" }) }), _jsx("div", { className: cn("max-w-[75%] rounded-2xl px-3.5 py-2 text-sm", msg.sender === "bot"
                                        ? "rounded-tl-sm bg-muted"
                                        : "rounded-tr-sm bg-primary text-primary-foreground"), children: msg.text })] }, msg.id))) }), _jsx(AnimatePresence, { children: typing && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "flex items-center gap-2", children: [_jsx("div", { className: "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground", children: _jsx(BotIcon, { className: "size-3.5" }) }), _jsx("div", { className: "flex gap-1 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-3", children: [0, 1, 2].map((i) => (_jsx(motion.span, { className: "size-1.5 rounded-full bg-muted-foreground/50", animate: { y: [0, -4, 0] }, transition: { duration: 0.6, delay: i * 0.15, repeat: Infinity } }, i))) })] })) })] }), _jsx("div", { className: "border-t p-3", children: _jsxs("form", { onSubmit: (e) => { e.preventDefault(); handleSend(); }, className: "flex gap-2", children: [_jsx(Input, { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Type a message...", className: "flex-1", disabled: typing }), _jsx(Button, { type: "submit", size: "icon", disabled: !input.trim() || typing, children: _jsx(SendIcon, { className: "size-4" }) })] }) })] }));
}
function ContactChannels() {
    return (_jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: [
            { icon: _jsx(MessageCircleIcon, { className: "size-5" }), label: "Live Chat", desc: "Avg. wait: 2 min", badge: "Online", badgeColor: "bg-emerald-500", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
            { icon: _jsx(MailIcon, { className: "size-5" }), label: "Email Support", desc: "Response within 24h", badge: null, badgeColor: "", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
            { icon: _jsx(HeadphonesIcon, { className: "size-5" }), label: "Phone", desc: "Mon-Fri, 9am-6pm", badge: null, badgeColor: "", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
        ].map((ch) => (_jsx(Card, { className: "group cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20", children: _jsxs(CardContent, { className: "flex items-center gap-3 p-4", children: [_jsx("div", { className: cn("flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110", ch.color), children: ch.icon }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "text-sm font-semibold", children: ch.label }), ch.badge && _jsx("span", { className: cn("size-1.5 rounded-full", ch.badgeColor) })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: ch.desc })] })] }) }, ch.label))) }));
}
function TicketForm() {
    const [sending, setSending] = React.useState(false);
    const [sent, setSent] = React.useState(false);
    function handleSubmit(e) {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            setSending(false);
            setSent(true);
            setTimeout(() => setSent(false), 3000);
        }, 1500);
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(MessageSquarePlusIcon, { className: "size-4 text-primary" }), "Submit a Ticket"] }), _jsx(CardDescription, { children: "Describe your issue and we'll get back to you" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "t-subject", children: "Subject" }), _jsx(Input, { id: "t-subject", placeholder: "Brief description", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "t-category", children: "Category" }), _jsxs(Select, { defaultValue: "general", children: [_jsx(SelectTrigger, { id: "t-category", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "account", children: "Account" }), _jsx(SelectItem, { value: "payments", children: "Payments" }), _jsx(SelectItem, { value: "security", children: "Security" }), _jsx(SelectItem, { value: "billing", children: "Billing" }), _jsx(SelectItem, { value: "general", children: "General" })] })] })] })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "t-priority", children: "Priority" }), _jsxs(Select, { defaultValue: "medium", children: [_jsx(SelectTrigger, { id: "t-priority", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "t-email", children: "Email" }), _jsx(Input, { id: "t-email", type: "email", defaultValue: "abderrahim@fintech.com" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "t-desc", children: "Description" }), _jsx(Textarea, { id: "t-desc", placeholder: "Please provide as much detail as possible...", rows: 4, required: true })] }), _jsxs("div", { className: "flex items-center justify-end gap-3", children: [_jsx(AnimatePresence, { mode: "wait", children: sent && (_jsxs(motion.span, { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0 }, className: "flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400", children: [_jsx(CheckCircle2Icon, { className: "size-4" }), "Ticket submitted!"] })) }), _jsx(Button, { type: "submit", disabled: sending || sent, children: sending ? _jsxs(_Fragment, { children: [_jsx(LoaderIcon, { className: "size-4 animate-spin" }), " Sending..."] }) : _jsxs(_Fragment, { children: [_jsx(SendIcon, { className: "size-4" }), " Submit Ticket"] }) })] })] }) })] }));
}
function ContactTab() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(ContactChannels, {}), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsx(LiveChatSimulator, {}), _jsx(TicketForm, {})] })] }));
}
// ── Status Tab ───────────────────────────────────────────────────────────────
const statusColors = { operational: "#10b981", degraded: "#f59e0b", outage: "#ef4444" };
const statusLabels = { operational: "Operational", degraded: "Degraded", outage: "Outage" };
function StatusTab() {
    const allOperational = systemStatus.every((s) => s.status === "operational");
    // Generate fake uptime data for 90 days
    const uptimeData = React.useMemo(() => {
        return Array.from({ length: 90 }, (_, i) => {
            if (i === 52)
                return "outage";
            if (i === 53 || i === 67)
                return "degraded";
            return "operational";
        });
    }, []);
    const uptimePct = ((uptimeData.filter((d) => d === "operational").length / uptimeData.length) * 100).toFixed(2);
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(Card, { className: allOperational ? "ring-1 ring-emerald-500/20" : "ring-1 ring-amber-500/20", children: _jsxs(CardContent, { className: "flex items-center gap-4 p-6", children: [_jsx(motion.div, { animate: { scale: [1, 1.1, 1] }, transition: { duration: 2, repeat: Infinity }, className: cn("flex size-14 items-center justify-center rounded-2xl", allOperational ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"), children: allOperational ? _jsx(CheckCircle2Icon, { className: "size-7" }) : _jsx(AlertCircleIcon, { className: "size-7" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold", children: allOperational ? "All Systems Operational" : "Partial System Degradation" }), _jsx("p", { className: "text-sm text-muted-foreground", children: allOperational ? "All services running smoothly" : "Some services experiencing issues" })] }), _jsxs("div", { className: "ml-auto hidden text-right sm:block", children: [_jsxs("p", { className: "text-2xl font-bold tabular-nums", children: [uptimePct, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "90-day uptime" })] })] }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Service Status" }) }), _jsx(CardContent, { className: "space-y-3", children: systemStatus.map((service, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.06 }, className: "flex items-center gap-4 rounded-lg border p-3", children: [_jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: "text-sm font-medium", children: service.name }) }), _jsx(TooltipProvider, { children: _jsx("div", { className: "hidden items-center gap-[1.5px] md:flex", children: uptimeData.slice(-30).map((status, j) => (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { render: _jsx("div", { className: "h-6 w-[4px] rounded-sm transition-colors", style: { backgroundColor: service.status === "operational" ? statusColors[status] : statusColors[service.status] } }) }), _jsx(TooltipContent, { children: _jsxs("span", { className: "text-xs tabular-nums", children: [30 - j, " days ago \u00B7 ", statusLabels[status]] }) })] }, j))) }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(motion.span, { className: "size-2 rounded-full", style: { backgroundColor: statusColors[service.status] }, animate: service.status === "operational" ? {} : { opacity: [1, 0.4, 1] }, transition: { duration: 1.5, repeat: Infinity } }), _jsx("span", { className: cn("text-xs font-medium min-w-[80px]", service.status === "operational" ? "text-emerald-600 dark:text-emerald-400"
                                                : service.status === "degraded" ? "text-amber-600 dark:text-amber-400"
                                                    : "text-rose-600 dark:text-rose-400"), children: statusLabels[service.status] })] })] }, service.name))) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Uptime \u2014 Last 90 Days" }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "size-2 rounded-sm bg-emerald-500" }), " Up"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "size-2 rounded-sm bg-amber-500" }), " Degraded"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "size-2 rounded-sm bg-rose-500" }), " Down"] })] })] }) }), _jsxs(CardContent, { children: [_jsx(TooltipProvider, { children: _jsx("div", { className: "flex gap-[1.5px]", children: uptimeData.map((status, i) => (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { render: _jsx(motion.div, { initial: { height: 0 }, animate: { height: 32 }, transition: { delay: i * 0.008, duration: 0.3 }, className: "flex-1 rounded-sm", style: { backgroundColor: statusColors[status] } }) }), _jsx(TooltipContent, { children: _jsxs("span", { className: "text-xs tabular-nums", children: [90 - i, " days ago \u00B7 ", statusLabels[status]] }) })] }, i))) }) }), _jsxs("div", { className: "mt-2 flex items-center justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: "90 days ago" }), _jsxs("span", { className: "font-medium text-foreground tabular-nums", children: [uptimePct, "% uptime"] }), _jsx("span", { children: "Today" })] })] })] })] }));
}
// ── Main Page ────────────────────────────────────────────────────────────────
export function SupportPageClient() {
    const [activeTab, setActiveTab] = React.useState("faq");
    const tabContent = {
        faq: _jsx(FaqTab, {}),
        tickets: _jsx(TicketsTab, {}),
        contact: _jsx(ContactTab, {}),
        status: _jsx(StatusTab, {}),
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Help & Support" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Find answers, chat with us, submit tickets, and check system status" })] }), _jsxs("div", { className: "flex flex-1 flex-col gap-6 lg:flex-row", children: [_jsxs("div", { className: "flex shrink-0 flex-col gap-4 lg:w-52", children: [_jsx("nav", { className: "hidden flex-col gap-1 lg:flex", children: tabs.map((tab) => (_jsxs(Button, { variant: activeTab === tab.id ? "secondary" : "ghost", size: "sm", className: cn("justify-start gap-2", activeTab === tab.id && "font-semibold"), onClick: () => setActiveTab(tab.id), children: [tab.icon, tab.label] }, tab.id))) }), _jsx("div", { className: "-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:hidden", children: tabs.map((tab) => (_jsxs(Button, { variant: activeTab === tab.id ? "secondary" : "ghost", size: "sm", className: "shrink-0 gap-1.5 text-xs", onClick: () => setActiveTab(tab.id), children: [tab.icon, tab.label] }, tab.id))) })] }), _jsx("div", { className: "min-w-0 flex-1", children: tabContent[activeTab] })] })] }));
}
