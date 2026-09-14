"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SmartphoneIcon, NetworkIcon, CheckCircleIcon } from "lucide-react";
import { motion } from "motion/react";
export function HowItWorks() {
    const steps = [
        {
            icon: SmartphoneIcon,
            title: "Enter your number",
            description: "Type in your Ghanaian phone number. We automatically detect your network provider."
        },
        {
            icon: NetworkIcon,
            title: "Select a bundle",
            description: "Choose from a wide variety of affordable data packages tailored for your network."
        },
        {
            icon: CheckCircleIcon,
            title: "Get connected",
            description: "Pay securely via Paystack. Your data bundle is delivered to your phone instantly."
        }
    ];
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };
    return (_jsx("section", { className: "py-24 bg-muted/30", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs(motion.div, { className: "text-center max-w-2xl mx-auto mb-16", initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-100px" }, transition: { duration: 0.5 }, children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold tracking-tight mb-4", children: "How it works" }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Getting data has never been this simple. Follow these three easy steps." })] }), _jsxs(motion.div, { className: "grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative", variants: containerVariants, initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-100px" }, children: [_jsx("div", { className: "hidden md:block absolute top-8 left-[15%] right-[15%] h-0.5 bg-border -z-10" }), steps.map((step) => {
                            const Icon = step.icon;
                            return (_jsxs(motion.div, { variants: itemVariants, className: "flex flex-col items-center text-center relative group", children: [_jsx("div", { className: "size-16 rounded-2xl bg-background border shadow-sm flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300", children: _jsx(Icon, { className: "size-8 text-primary" }) }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: step.title }), _jsx("p", { className: "text-muted-foreground", children: step.description })] }, step.title));
                        })] })] }) }));
}
