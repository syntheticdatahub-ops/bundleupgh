"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar";
export function NavMain({ items, title, className, }) {
    const pathname = usePathname();
    return (_jsxs(SidebarGroup, { className: className, children: [title && _jsx(SidebarGroupLabel, { children: title }), _jsx(SidebarMenu, { children: items.map((item) => {
                    const Icon = item.icon;
                    return (_jsx(SidebarMenuItem, { children: _jsxs(SidebarMenuButton, { isActive: pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url)), tooltip: item.title, render: _jsx(Link, { href: item.url }), children: [_jsx(Icon, { className: "size-4" }), _jsx("span", { children: item.title })] }) }, item.title));
                }) })] }));
}
