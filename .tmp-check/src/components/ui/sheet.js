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
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
function Sheet(_a) {
    var props = __rest(_a, []);
    return _jsx(SheetPrimitive.Root, Object.assign({ "data-slot": "sheet" }, props));
}
function SheetTrigger(_a) {
    var props = __rest(_a, []);
    return _jsx(SheetPrimitive.Trigger, Object.assign({ "data-slot": "sheet-trigger" }, props));
}
function SheetClose(_a) {
    var props = __rest(_a, []);
    return _jsx(SheetPrimitive.Close, Object.assign({ "data-slot": "sheet-close" }, props));
}
function SheetPortal(_a) {
    var props = __rest(_a, []);
    return _jsx(SheetPrimitive.Portal, Object.assign({ "data-slot": "sheet-portal" }, props));
}
function SheetOverlay(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(SheetPrimitive.Backdrop, Object.assign({ "data-slot": "sheet-overlay", className: cn("fixed inset-0 z-50 bg-[#02060a]/45 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-md", className) }, props)));
}
function SheetContent(_a) {
    var { className, children, side = "right", showCloseButton = true } = _a, props = __rest(_a, ["className", "children", "side", "showCloseButton"]);
    return (_jsxs(SheetPortal, { children: [_jsx(SheetOverlay, {}), _jsxs(SheetPrimitive.Popup, Object.assign({ "data-slot": "sheet-content", "data-side": side, className: cn("fixed z-50 flex flex-col gap-4 border border-white/10 bg-[#090b0f]/90 bg-clip-padding text-sm text-popover-foreground shadow-[0_30px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/5 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-starting-style:translate-y-full data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-full data-[side=right]:data-starting-style:translate-x-full data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:-translate-y-full data-[side=top]:data-starting-style:-translate-y-full data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm", className) }, props, { children: [children, showCloseButton && (_jsxs(SheetPrimitive.Close, { "data-slot": "sheet-close", render: _jsx(Button, { variant: "ghost", className: "absolute top-3 right-3", size: "icon-sm" }), children: [_jsx(XIcon, {}), _jsx("span", { className: "sr-only", children: "Close" })] }))] }))] }));
}
function SheetHeader(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx("div", Object.assign({ "data-slot": "sheet-header", className: cn("flex flex-col gap-0.5 p-4", className) }, props)));
}
function SheetFooter(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx("div", Object.assign({ "data-slot": "sheet-footer", className: cn("mt-auto flex flex-col gap-2 p-4", className) }, props)));
}
function SheetTitle(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(SheetPrimitive.Title, Object.assign({ "data-slot": "sheet-title", className: cn("font-heading text-base font-medium text-foreground", className) }, props)));
}
function SheetDescription(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (_jsx(SheetPrimitive.Description, Object.assign({ "data-slot": "sheet-description", className: cn("text-sm text-muted-foreground", className) }, props)));
}
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, };
