"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
const emptySubscribe = () => () => { };
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);
function ContrastIcon({ className }) {
    return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: className, children: [_jsx("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }), _jsx("path", { d: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }), _jsx("path", { d: "M12 3l0 18" }), _jsx("path", { d: "M12 9l4.65 -4.65" }), _jsx("path", { d: "M12 14.3l7.37 -7.37" }), _jsx("path", { d: "M12 19.6l8.85 -8.85" })] }));
}
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useIsMounted();
    if (!mounted) {
        return (_jsx(Button, { variant: "ghost", size: "icon", className: "size-8 rounded-full", children: _jsx("span", { className: "sr-only", children: "Toggle theme" }) }));
    }
    return (_jsxs(Button, { variant: "ghost", size: "icon", className: "size-8 rounded-full", onClick: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"), children: [_jsx(ContrastIcon, { className: "size-[18px]" }), _jsx("span", { className: "sr-only", children: "Toggle theme" })] }));
}
