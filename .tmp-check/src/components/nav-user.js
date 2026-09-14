"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from "@/components/ui/sidebar";
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
export function NavUser({ user, }) {
    const { isMobile } = useSidebar();
    return (_jsx(SidebarMenu, { children: _jsx(SidebarMenuItem, { children: _jsxs(DropdownMenu, { children: [_jsxs(DropdownMenuTrigger, { render: _jsx(SidebarMenuButton, { size: "lg", className: "aria-expanded:bg-muted" }), children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: user.avatar, alt: user.name }), _jsx(AvatarFallback, { children: "AD" })] }), _jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [_jsx("span", { className: "truncate font-medium", children: user.name }), _jsx("span", { className: "truncate text-xs", children: user.email })] }), _jsx(ChevronsUpDownIcon, { className: "ml-auto size-4" })] }), _jsxs(DropdownMenuContent, { className: "min-w-56 rounded-lg", side: isMobile ? "bottom" : "right", align: "end", sideOffset: 4, children: [_jsx(DropdownMenuGroup, { children: _jsx(DropdownMenuLabel, { className: "p-0 font-normal", children: _jsxs("div", { className: "flex items-center gap-2 px-1 py-1.5 text-left text-sm", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: user.avatar, alt: user.name }), _jsx(AvatarFallback, { children: "AD" })] }), _jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [_jsx("span", { className: "truncate font-medium", children: user.name }), _jsx("span", { className: "truncate text-xs", children: user.email })] })] }) }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { render: _jsx(Link, { href: "/sign-in" }), children: [_jsx(LogOutIcon, {}), "Log out"] })] })] }) }) }));
}
