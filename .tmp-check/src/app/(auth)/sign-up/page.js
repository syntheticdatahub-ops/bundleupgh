"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { LandmarkIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, Loader2Icon, CheckIcon, ShieldCheckIcon, UserIcon, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton, } from "@/components/ui/input-group";
import dynamic from "next/dynamic";
const GlobeDemo = dynamic(() => import("@/components/globe-demo"), {
    ssr: false,
});
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};
const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};
export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!agreed)
            return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        }, 1500);
    };
    return (_jsxs("div", { className: "flex min-h-svh", children: [_jsxs("div", { className: "relative hidden w-1/2 flex-col justify-between bg-zinc-950 lg:flex", children: [_jsxs(Link, { href: "/dashboard", className: "relative z-20 flex items-center gap-2.5 p-8", children: [_jsx("div", { className: "flex size-8 items-center justify-center rounded-lg bg-white text-black", children: _jsx(LandmarkIcon, { className: "size-4" }) }), _jsx("span", { className: "text-sm font-semibold text-white", children: "Shadcn Fintech" })] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center overflow-hidden", children: _jsx(GlobeDemo, {}) }), _jsx("div", { className: "relative z-20 mt-auto p-8", children: _jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm", children: [_jsx("blockquote", { className: "text-sm leading-relaxed text-white/80", children: "\u201CCompound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.\u201D" }), _jsx("p", { className: "mt-3 text-xs text-white/50", children: "\u2014 Albert Einstein" })] }) })] }), _jsx("div", { className: "flex flex-1 items-center justify-center bg-background px-6 py-12", children: _jsxs(motion.div, { className: "w-full max-w-sm", variants: containerVariants, initial: "hidden", animate: "visible", children: [_jsx(motion.div, { className: "mb-8 flex flex-col items-center lg:hidden", variants: itemVariants, children: _jsx("div", { className: "flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground", children: _jsx(LandmarkIcon, { className: "size-5" }) }) }), _jsxs(motion.div, { className: "text-center", variants: itemVariants, children: [_jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Create your account" }), _jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Start managing your finances today" })] }), _jsxs(motion.div, { className: "mt-8 grid grid-cols-2 gap-3", variants: itemVariants, children: [_jsxs(Button, { variant: "outline", size: "lg", className: "gap-2", children: [_jsx(Image, { src: "/logos/google-com.png", alt: "Google", width: 16, height: 16, className: "size-4" }), _jsx("span", { className: "text-sm", children: "Google" })] }), _jsxs(Button, { variant: "outline", size: "lg", className: "gap-2", children: [_jsx(Image, { src: "/logos/apple-com.png", alt: "Apple", width: 16, height: 16, className: "size-4" }), _jsx("span", { className: "text-sm", children: "Apple" })] })] }), _jsxs(motion.div, { className: "relative my-6 flex items-center", variants: itemVariants, children: [_jsx("div", { className: "flex-1 border-t border-border" }), _jsx("span", { className: "mx-3 text-xs text-muted-foreground", children: "or continue with" }), _jsx("div", { className: "flex-1 border-t border-border" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs(motion.div, { variants: itemVariants, children: [_jsx("label", { htmlFor: "name", className: "mb-1.5 block text-sm font-medium", children: "Full name" }), _jsxs(InputGroup, { children: [_jsx(InputGroupAddon, { align: "inline-start", children: _jsx(UserIcon, { className: "size-4 text-muted-foreground" }) }), _jsx(InputGroupInput, { id: "name", type: "text", placeholder: "John Doe", required: true })] })] }), _jsxs(motion.div, { variants: itemVariants, children: [_jsx("label", { htmlFor: "email", className: "mb-1.5 block text-sm font-medium", children: "Email" }), _jsxs(InputGroup, { children: [_jsx(InputGroupAddon, { align: "inline-start", children: _jsx(MailIcon, { className: "size-4 text-muted-foreground" }) }), _jsx(InputGroupInput, { id: "email", type: "email", placeholder: "name@example.com", required: true })] })] }), _jsxs(motion.div, { variants: itemVariants, children: [_jsx("label", { htmlFor: "password", className: "mb-1.5 block text-sm font-medium", children: "Password" }), _jsxs(InputGroup, { children: [_jsx(InputGroupAddon, { align: "inline-start", children: _jsx(LockIcon, { className: "size-4 text-muted-foreground" }) }), _jsx(InputGroupInput, { id: "password", type: showPassword ? "text" : "password", placeholder: "Create a password", required: true }), _jsx(InputGroupAddon, { align: "inline-end", children: _jsx(InputGroupButton, { size: "icon-xs", variant: "ghost", onClick: () => setShowPassword(!showPassword), "aria-label": showPassword ? "Hide password" : "Show password", children: showPassword ? (_jsx(EyeOffIcon, { className: "size-3.5 text-muted-foreground" })) : (_jsx(EyeIcon, { className: "size-3.5 text-muted-foreground" })) }) })] })] }), _jsxs(motion.div, { className: "flex items-start gap-2.5", variants: itemVariants, children: [_jsx(Checkbox, { id: "terms", checked: agreed, onCheckedChange: (checked) => setAgreed(checked), className: "mt-0.5" }), _jsxs("label", { htmlFor: "terms", className: "text-sm text-muted-foreground", children: ["I agree to the", " ", _jsx(Link, { href: "#", className: "font-medium text-foreground underline-offset-4 hover:underline", children: "Terms of Service" }), " ", "and", " ", _jsx(Link, { href: "#", className: "font-medium text-foreground underline-offset-4 hover:underline", children: "Privacy Policy" })] })] }), _jsx(motion.div, { variants: itemVariants, className: "pt-1", children: _jsx(Button, { type: "submit", size: "lg", className: "w-full", disabled: isLoading || isSuccess || !agreed, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2Icon, { className: "size-4 animate-spin" }), _jsx("span", { children: "Creating account..." })] })) : isSuccess ? (_jsxs(_Fragment, { children: [_jsx(CheckIcon, { className: "size-4" }), _jsx("span", { children: "Account created!" })] })) : (_jsx("span", { children: "Create account" })) }) })] }), _jsxs(motion.p, { className: "mt-6 text-center text-sm text-muted-foreground", variants: itemVariants, children: ["Already have an account?", " ", _jsx(Link, { href: "/sign-in", className: "font-medium text-foreground underline-offset-4 transition-colors hover:underline", children: "Sign in" })] }), _jsxs(motion.div, { className: "mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60", variants: itemVariants, children: [_jsx(ShieldCheckIcon, { className: "size-3.5" }), _jsx("span", { children: "256-bit SSL encrypted" })] })] }) })] }));
}
