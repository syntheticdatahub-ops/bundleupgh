import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandmarkIcon } from "lucide-react";
export default function NotFound() {
    return (_jsxs("div", { className: "flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-4 text-center", children: [_jsx("div", { className: "flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground", children: _jsx(LandmarkIcon, { className: "size-8" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: "text-4xl font-bold tabular-nums", children: "404" }), _jsx("p", { className: "text-muted-foreground", children: "This page doesn't exist." })] }), _jsx(Button, { render: _jsx(Link, { href: "/dashboard" }), children: "Back to Dashboard" })] }));
}
