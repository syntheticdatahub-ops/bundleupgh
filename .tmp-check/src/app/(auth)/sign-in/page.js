"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { ZapIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, Loader2Icon, CheckIcon, ShieldCheckIcon, } from "lucide-react";
import { Button } from "@/components/ui/button";
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
export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            const res = await fetch("/api/auth/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            });
            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    router.push("/admin");
                }, 1000);
            }
            else {
                const payload = await res.json().catch(() => null);
                setError((payload === null || payload === void 0 ? void 0 : payload.error) || "Failed to create session.");
                setIsLoading(false);
            }
        }
        catch (err) {
            console.error(err);
            setError("Invalid email or password.");
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "flex min-h-svh", children: [_jsxs("div", { className: "relative hidden w-1/2 flex-col justify-between bg-zinc-950 lg:flex", children: [_jsxs(Link, { href: "/dashboard", className: "relative z-20 flex items-center gap-2.5 p-8", children: [_jsx("div", { className: "flex size-8 items-center justify-center rounded-lg bg-white text-black", children: _jsx(ZapIcon, { className: "size-4" }) }), _jsx("span", { className: "text-sm font-semibold text-white", children: "BundleUp" })] }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center overflow-hidden", children: _jsx(GlobeDemo, {}) }), _jsx("div", { className: "relative z-20 mt-auto p-8", children: _jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm", children: [_jsx("blockquote", { className: "text-sm leading-relaxed text-white/80", children: "\u201CThe best time to start investing was yesterday. The second best time is now.\u201D" }), _jsx("p", { className: "mt-3 text-xs text-white/50", children: "\u2014 BundleUp" })] }) })] }), _jsx("div", { className: "flex flex-1 items-center justify-center bg-background px-6 py-12", children: _jsxs(motion.div, { className: "w-full max-w-sm", variants: containerVariants, initial: "hidden", animate: "visible", children: [_jsx(motion.div, { className: "mb-8 flex flex-col items-center lg:hidden", variants: itemVariants, children: _jsx("div", { className: "flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground", children: _jsx(ZapIcon, { className: "size-5" }) }) }), _jsxs(motion.div, { className: "text-center", variants: itemVariants, children: [_jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Welcome back" }), _jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Sign in to your BundleUp admin account" })] }), _jsxs(motion.div, { className: "mt-8 grid grid-cols-2 gap-3", variants: itemVariants, children: [_jsxs(Button, { variant: "outline", size: "lg", className: "gap-2", children: [_jsx(Image, { src: "/logos/google-com.png", alt: "Google", width: 16, height: 16, className: "size-4" }), _jsx("span", { className: "text-sm", children: "Google" })] }), _jsxs(Button, { variant: "outline", size: "lg", className: "gap-2", children: [_jsx(Image, { src: "/logos/apple-com.png", alt: "Apple", width: 16, height: 16, className: "size-4" }), _jsx("span", { className: "text-sm", children: "Apple" })] })] }), _jsxs(motion.div, { className: "relative my-6 flex items-center", variants: itemVariants, children: [_jsx("div", { className: "flex-1 border-t border-border" }), _jsx("span", { className: "mx-3 text-xs text-muted-foreground", children: "or continue with" }), _jsx("div", { className: "flex-1 border-t border-border" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(motion.div, { variants: itemVariants, className: "text-sm font-medium text-destructive", children: error })), _jsxs(motion.div, { variants: itemVariants, children: [_jsx("label", { htmlFor: "email", className: "mb-1.5 block text-sm font-medium", children: "Email" }), _jsxs(InputGroup, { children: [_jsx(InputGroupAddon, { align: "inline-start", children: _jsx(MailIcon, { className: "size-4 text-muted-foreground" }) }), _jsx(InputGroupInput, { id: "email", type: "email", placeholder: "name@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })] })] }), _jsxs(motion.div, { variants: itemVariants, children: [_jsxs("div", { className: "mb-1.5 flex items-center justify-between", children: [_jsx("label", { htmlFor: "password", className: "text-sm font-medium", children: "Password" }), _jsx(Link, { href: "#", className: "text-xs text-muted-foreground transition-colors hover:text-foreground", children: "Forgot password?" })] }), _jsxs(InputGroup, { children: [_jsx(InputGroupAddon, { align: "inline-start", children: _jsx(LockIcon, { className: "size-4 text-muted-foreground" }) }), _jsx(InputGroupInput, { id: "password", type: showPassword ? "text" : "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), required: true }), _jsx(InputGroupAddon, { align: "inline-end", children: _jsx(InputGroupButton, { type: "button", size: "icon-xs", variant: "ghost", onClick: () => setShowPassword(!showPassword), "aria-label": showPassword ? "Hide password" : "Show password", children: showPassword ? (_jsx(EyeOffIcon, { className: "size-3.5 text-muted-foreground" })) : (_jsx(EyeIcon, { className: "size-3.5 text-muted-foreground" })) }) })] })] }), _jsx(motion.div, { variants: itemVariants, className: "pt-1", children: _jsx(Button, { type: "submit", size: "lg", className: "w-full", disabled: isLoading || isSuccess, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2Icon, { className: "size-4 animate-spin" }), _jsx("span", { children: "Signing in..." })] })) : isSuccess ? (_jsxs(_Fragment, { children: [_jsx(CheckIcon, { className: "size-4" }), _jsx("span", { children: "Success!" })] })) : (_jsx("span", { children: "Sign in" })) }) })] }), _jsxs(motion.p, { className: "mt-6 text-center text-sm text-muted-foreground", variants: itemVariants, children: ["Don't have an account?", " ", _jsx(Link, { href: "/sign-up", className: "font-medium text-foreground underline-offset-4 transition-colors hover:underline", children: "Sign up" })] }), _jsxs(motion.div, { className: "mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60", variants: itemVariants, children: [_jsx(ShieldCheckIcon, { className: "size-3.5" }), _jsx("span", { children: "256-bit SSL encrypted" })] })] }) })] }));
}
