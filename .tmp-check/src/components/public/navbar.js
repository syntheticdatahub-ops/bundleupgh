"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
const navLinks = [
    { title: "Home", href: "/" },
    { title: "Buy Data", href: "/buy" },
    { title: "Track Order", href: "/track" },
    { title: "Help", href: "/help" },
];
export function PublicNavbar() {
    const pathname = usePathname();
    return (_jsx("header", { className: "sticky top-0 z-50 w-full bg-transparent", children: _jsxs("div", { className: "container mx-auto flex h-16 md:h-18 items-center justify-between px-4", children: [_jsxs(Link, { href: "/", className: "flex items-center gap-2.5", children: [_jsx("div", { className: "flex size-10 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-black/30", children: _jsx(Image, { src: "/logo1.png", alt: "BundleUp logo", width: 40, height: 40, className: "h-full w-full object-cover" }) }), _jsx("span", { className: "font-bold text-base tracking-tight", children: "BundleUp" })] }), _jsxs("nav", { className: "hidden md:flex items-center gap-6 text-sm font-medium", children: [navLinks.map((link) => (_jsx(Link, { href: link.href, className: cn("transition-colors hover:text-foreground/80", pathname === link.href ? "text-foreground" : "text-foreground/60"), children: link.title }, link.title))), _jsx(Button, { nativeButton: false, render: _jsx(Link, { href: "/buy" }), size: "sm", className: "ml-2", children: "Buy Data" })] }), _jsx("div", { className: "flex md:hidden items-center gap-3", children: _jsxs(Sheet, { children: [_jsx(SheetTrigger, { render: _jsxs("button", { type: "button", className: "flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/8 hover:shadow-[0_12px_35px_rgba(15,23,42,0.28)]", children: [_jsx(MenuIcon, { className: "size-4" }), _jsx("span", { className: "sr-only", children: "Toggle menu" })] }) }), _jsxs(SheetContent, { side: "right", className: "w-[86vw] max-w-[360px] rounded-l-[28px] border border-white/10 bg-[#070a0e]/95 p-0 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl", children: [_jsx("div", { className: "flex items-center justify-between border-b border-white/5 px-6 pb-5 pt-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex size-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-sm", children: _jsx(Image, { src: "/logo1.png", alt: "BundleUp logo", width: 36, height: 36, className: "h-full w-full object-cover" }) }), _jsx("span", { className: "text-lg font-semibold tracking-tight", children: "BundleUp" })] }) }), _jsxs("div", { className: "flex flex-col space-y-6 px-8 py-8", children: [navLinks.map((link) => {
                                                const isActive = pathname === link.href;
                                                return (_jsxs(Link, { href: link.href, className: "group flex items-center gap-4 text-base transition-all duration-300", children: [_jsx("div", { className: "flex w-3 items-center justify-center", children: isActive ? (_jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]" })) : (_jsx("div", { className: "h-1.5 w-1.5 rounded-full bg-transparent transition-colors group-hover:bg-white/10" })) }), _jsx("span", { className: cn("font-medium tracking-wide transition-colors duration-300", isActive ? "text-white" : "text-white/50 group-hover:text-white/80"), children: link.title })] }, link.title));
                                            }), _jsx("div", { className: "pt-6", children: _jsx(Button, { nativeButton: false, render: _jsx(Link, { href: "/buy" }), className: "w-full h-12 rounded-2xl bg-blue-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.24)] transition-all hover:scale-[1.02] hover:bg-blue-500 hover:shadow-[0_12px_40px_rgba(37,99,235,0.35)]", children: "Buy Data \u2192" }) })] })] })] }) })] }) }));
}
