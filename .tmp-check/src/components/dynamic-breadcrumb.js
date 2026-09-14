"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb";
const labelMap = {
    dashboard: "Overview",
    admin: "Overview",
    orders: "Orders",
    customers: "Customers",
    bundles: "Bundles",
    transactions: "Transactions",
    analytics: "Analytics",
    notifications: "Notifications",
    settings: "Settings",
    support: "Help & Support",
};
export function DynamicBreadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0)
        return null;
    return (_jsx(Breadcrumb, { children: _jsx(BreadcrumbList, { children: segments.map((segment, index) => {
                const href = "/" + segments.slice(0, index + 1).join("/");
                const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
                const isLast = index === segments.length - 1;
                return (_jsx(BreadcrumbItem, { className: index === 0 && segments.length > 1 ? "hidden md:block" : undefined, children: isLast ? (_jsx(BreadcrumbPage, { children: label })) : (_jsxs(_Fragment, { children: [_jsx(BreadcrumbLink, { render: _jsx(Link, { href: href }), children: label }), _jsx(BreadcrumbSeparator, { className: "hidden md:block" })] })) }, href));
            }) }) }));
}
