"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { detectNetworkCode } from "@/lib/phone";
import dynamic from "next/dynamic";
const GlobeDemo = dynamic(() => import("@/components/globe-demo"), {
    ssr: false,
});
const NETWORK_META = {
    mtn: { name: "MTN", color: "#ffcc00", text: "text-black" },
    telecel: { name: "Telecel", color: "#e20010", text: "text-white" },
    airteltigo: { name: "AirtelTigo", color: "#0033a0", text: "text-white" },
};
export function HeroSection() {
    const [phone, setPhone] = useState("");
    const router = useRouter();
    const detectedCode = phone.length >= 3 ? detectNetworkCode(phone) : null;
    const detectedNet = detectedCode ? NETWORK_META[detectedCode] : null;
    const handleContinue = () => {
        if (phone) {
            router.push(`/buy?phone=${encodeURIComponent(phone)}`);
        }
        else {
            router.push("/buy");
        }
    };
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };
    return (_jsxs("section", { className: "relative overflow-hidden min-h-screen -mt-16 flex items-center pt-28 pb-12 md:pt-36 md:pb-24 lg:pt-44 lg:pb-32", children: [_jsx("div", { className: "absolute inset-0 -z-20 pointer-events-none flex items-center justify-center opacity-50 lg:translate-y-0 lg:translate-x-1/4 lg:opacity-40", children: _jsx("div", { className: "w-[150%] h-[150%] max-w-[800px] max-h-[800px] lg:w-[100%] lg:h-[100%] lg:max-w-[1000px] lg:max-h-[1000px]", children: _jsx(GlobeDemo, {}) }) }), _jsx("div", { className: "absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-screen opacity-50" }), _jsx("div", { className: "absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen opacity-50" }), _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "grid gap-12 lg:grid-cols-2 lg:gap-8 items-center", children: [_jsxs(motion.div, { className: "flex flex-col items-center text-center lg:items-start lg:text-left", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-100px" }, children: [_jsxs(motion.h1, { variants: itemVariants, className: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight", children: ["Buy mobile data.", _jsx("br", {}), _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500", children: "Instantly." })] }), _jsx(motion.p, { variants: itemVariants, className: "text-lg text-muted-foreground mb-8 max-w-md", children: "MTN. Telecel. AirtelTigo. Data delivered in seconds, no account needed." }), _jsx(motion.div, { variants: itemVariants, className: "lg:hidden w-full max-w-sm mt-4", children: _jsxs("div", { className: "bg-[#111318] border border-white/10 rounded-2xl p-4 w-full text-left shadow-2xl", children: [_jsx("label", { className: "text-sm font-medium text-white/90 mb-3 block", children: "Ghanaian mobile number" }), _jsxs("div", { className: "flex items-center bg-[#1C1F26] border border-white/10 rounded-xl overflow-hidden mb-4 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all", children: [_jsxs("div", { className: "flex items-center gap-2 pl-3 pr-2 py-3 border-r border-white/10 select-none", children: [_jsx("span", { className: "text-base leading-none", title: "Ghana", children: "\uD83C\uDDEC\uD83C\uDDED" }), _jsx("span", { className: "text-white font-medium text-sm", children: "+233" }), _jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-white/50", children: _jsx("path", { d: "m6 9 6 6 6-6" }) })] }), _jsx("input", { type: "tel", placeholder: "24 123 4567", className: "flex-1 bg-transparent border-none outline-none text-white px-3 py-3 text-sm placeholder:text-white/30 w-full min-w-0", value: phone, onChange: (e) => setPhone(e.target.value.replace(/\D/g, "")), onKeyDown: (e) => e.key === "Enter" && handleContinue() }), detectedNet && (_jsx(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, className: "shrink-0 flex items-center justify-center text-[10px] font-bold px-2 py-1 rounded-md mr-1", style: { backgroundColor: detectedNet.color, color: detectedNet.text === "text-black" ? "#000" : "#fff" }, children: detectedNet.name })), _jsx("div", { className: "pr-3 pl-2 py-3 text-white/40 cursor-pointer hover:text-white/70 transition-colors", children: _jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", ry: "2" }), _jsx("circle", { cx: "12", cy: "10", r: "3" }), _jsx("path", { d: "M7 22v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" })] }) })] }), _jsxs(Button, { onClick: handleContinue, className: "w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl h-12 text-base font-medium shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all", children: ["Buy Data ", _jsx("span", { className: "ml-1", children: "\u2192" })] })] }) })] }), _jsx(motion.div, { className: "hidden lg:block", initial: { opacity: 0, scale: 0.95, x: 20 }, whileInView: { opacity: 1, scale: 1, x: 0 }, viewport: { once: true }, transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.2 }, children: _jsxs(Card, { className: "w-full max-w-md mx-auto shadow-2xl border-white/20 bg-white/10 dark:bg-black/40 backdrop-blur-xl relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-white/20 to-white/0 dark:from-white/5 dark:to-transparent pointer-events-none" }), _jsxs(CardContent, { className: "p-8 relative z-10", children: [_jsx("h3", { className: "text-2xl font-bold mb-2", children: "Get Started" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Enter your number to view bundles" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "phone", className: "text-sm font-medium", children: "Phone Number" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "phone", placeholder: "+233 XX XXX XXXX", className: "h-12 text-lg bg-background/50 backdrop-blur-sm border-white/20 dark:border-white/10 focus-visible:ring-primary/50 pr-24", value: phone, onChange: (e) => setPhone(e.target.value.replace(/\D/g, "")), onKeyDown: (e) => e.key === "Enter" && handleContinue() }), detectedNet && (_jsx(motion.span, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, className: "absolute right-3 top-2.5 text-xs font-bold px-2.5 py-1.5 rounded-md", style: { backgroundColor: detectedNet.color, color: detectedNet.text === "text-black" ? "#000" : "#fff" }, children: detectedNet.name }))] })] }), _jsx(Button, { size: "lg", className: "w-full h-12 text-base mt-2 shadow-lg shadow-primary/25", onClick: handleContinue, children: "Continue \u2192" })] }), _jsxs("div", { className: "mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })] }), "Payments secured by Paystack"] })] })] }) })] }) })] }));
}
