"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowLeftRightIcon, BellIcon, ChartAreaIcon, DatabaseIcon, LayoutDashboardIcon, LifeBuoyIcon, PackageIcon, UsersIcon, ZapIcon, } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar";
const data = {
    user: {
        name: "Admin User",
        email: "admin@bundleup.com.gh",
        avatar: "/avatars/user.jpg",
    },
    navManagement: [
        {
            title: "Overview",
            url: "/admin",
            icon: LayoutDashboardIcon,
        },
        {
            title: "Orders",
            url: "/admin/orders",
            icon: PackageIcon,
        },
        {
            title: "Customers",
            url: "/admin/customers",
            icon: UsersIcon,
        },
        {
            title: "Bundles",
            url: "/admin/bundles",
            icon: DatabaseIcon,
        },
        {
            title: "Transactions",
            url: "/admin/transactions",
            icon: ArrowLeftRightIcon,
        },
        {
            title: "Manual Fulfillment",
            url: "/admin/manual-fulfillment",
            icon: ZapIcon,
        },
    ],
    navInsights: [
        {
            title: "Analytics",
            url: "/admin/analytics",
            icon: ChartAreaIcon,
        },
    ],
    navSecondary: [
        {
            title: "Notifications",
            url: "/admin/notifications",
            icon: BellIcon,
        },
        {
            title: "Help & Support",
            url: "/admin/support",
            icon: LifeBuoyIcon,
        },
    ],
};
export function AppSidebar(_a) {
    var props = __rest(_a, []);
    return (_jsxs(Sidebar, Object.assign({ variant: "inset" }, props, { children: [_jsx(SidebarHeader, { children: _jsx(SidebarMenu, { children: _jsx(SidebarMenuItem, { children: _jsxs(SidebarMenuButton, { size: "lg", render: _jsx("a", { href: "/admin" }), children: [_jsx("div", { className: "flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground", children: _jsx(ZapIcon, { className: "size-4" }) }), _jsxs("div", { className: "grid flex-1 text-left text-sm leading-tight", children: [_jsx("span", { className: "truncate font-semibold", children: "BundleUp" }), _jsx("span", { className: "truncate text-xs", children: "Admin Dashboard" })] })] }) }) }) }), _jsxs(SidebarContent, { children: [_jsx(NavMain, { items: data.navManagement, title: "Management" }), _jsx(NavMain, { items: data.navInsights, title: "Insights" }), _jsx(NavMain, { items: data.navSecondary, title: "System", className: "mt-auto" })] }), _jsx(SidebarFooter, { children: _jsx(NavUser, { user: data.user }) })] })));
}
