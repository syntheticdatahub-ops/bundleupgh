"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ChevronDownIcon, MailIcon, ClockIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
const faqs = [
    {
        title: "Buying Data",
        items: [
            { q: "How do I buy data on BundleUp?", a: "Simply enter your phone number, choose your network (we usually detect it automatically), pick the bundle you want, and pay via Paystack. Your data will be delivered instantly." },
            { q: "Do I need an account to buy data?", a: "No, you do not need to register or create an account. Just enter your phone number to get started." },
            { q: "Which networks do you support?", a: "We currently support MTN, Telecel, and AirtelTigo." },
            { q: "How fast will my data be delivered?", a: "Delivery is instant. Typically, you will receive your data in under 60 seconds after a successful payment." },
        ]
    },
    {
        title: "Payments",
        items: [
            { q: "How do I pay?", a: "All payments are processed securely through Paystack. You can pay using Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo Money), Visa, or Mastercard." },
            { q: "Is it safe to pay on BundleUp?", a: "Yes. We use industry-standard 256-bit encryption and we never store your payment details. All transactions are securely handled by Paystack." },
            { q: "What if my payment fails?", a: "If a payment fails, your account or mobile money wallet will not be charged. If you were charged but the data wasn't delivered, please contact support for an immediate resolution." },
        ]
    },
    {
        title: "Orders & Delivery",
        items: [
            { q: "How do I track my order?", a: "You can visit the Track Order page (bundleup.com.gh/track) and enter your phone number to see the status of all your recent purchases." },
            { q: "What if my data doesn't arrive?", a: "In rare cases, network delays might occur. If your data doesn't arrive within 10 minutes, please contact our support team." },
            { q: "Can I get a refund?", a: "Yes. If your payment was successful but we failed to deliver the data bundle, we will process a full refund within 24-48 hours." },
            { q: "My number isn't detected correctly — what do I do?", a: "If our system misidentifies your network based on the prefix (e.g., if you ported your number), you can simply click on the correct network during the purchase flow." },
        ]
    }
];
export function HelpFaq() {
    const [openItems, setOpenItems] = useState({});
    const toggleItem = (id) => {
        setOpenItems(prev => (Object.assign(Object.assign({}, prev), { [id]: !prev[id] })));
    };
    return (_jsxs("div", { className: "max-w-3xl mx-auto w-full pt-12 pb-24 px-4", children: [_jsxs("div", { className: "mb-12 text-center", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight mb-4", children: "Help & FAQ" }), _jsx("p", { className: "text-muted-foreground text-lg max-w-2xl mx-auto", children: "Everything you need to know about using BundleUp. Can't find the answer you're looking for? Contact our support team." })] }), _jsx("div", { className: "space-y-12 mb-16", children: faqs.map((category, idx) => (_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold mb-6 pb-2 border-b", children: category.title }), _jsx("div", { className: "space-y-4", children: category.items.map((item, itemIdx) => {
                                const id = `${idx}-${itemIdx}`;
                                const isOpen = openItems[id];
                                return (_jsxs("div", { className: "border rounded-lg overflow-hidden bg-card", children: [_jsxs("button", { onClick: () => toggleItem(id), className: "w-full flex justify-between items-center p-5 text-left font-semibold hover:bg-muted/50 transition-colors", children: [item.q, _jsx(ChevronDownIcon, { className: `size-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}` })] }), isOpen && (_jsx("div", { className: "p-5 pt-0 text-muted-foreground leading-relaxed border-t bg-muted/20", children: _jsx("div", { className: "pt-4", children: item.a }) }))] }, itemIdx));
                            }) })] }, idx))) }), _jsx(Card, { className: "bg-primary/5 border-primary/20", children: _jsx(CardContent, { className: "p-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8", children: _jsxs("div", { className: "flex-1 space-y-4", children: [_jsx("h3", { className: "text-xl font-bold", children: "Still need help?" }), _jsx("p", { className: "text-muted-foreground", children: "Our support team is always ready to help you with any issues regarding your purchases." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 pt-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [_jsx(MailIcon, { className: "size-4 text-primary" }), "syntheticdatahub@gmail.com"] }), _jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [_jsx(ClockIcon, { className: "size-4 text-primary" }), "Available 8am\u20138pm GMT"] })] })] }) }) })] }));
}
