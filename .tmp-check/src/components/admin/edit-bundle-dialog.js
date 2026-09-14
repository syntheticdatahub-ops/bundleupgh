"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
export function EditBundleDialog({ bundle, open, onOpenChange }) {
    const router = useRouter();
    const [sellingPrice, setSellingPrice] = useState(bundle.sellingPrice.toString());
    const [active, setActive] = useState(bundle.active);
    const [saving, setSaving] = useState(false);
    // Reset state when bundle changes
    useEffect(() => {
        if (open) {
            setSellingPrice(bundle.sellingPrice.toString());
            setActive(bundle.active);
        }
    }, [bundle, open]);
    const parsedPrice = parseFloat(sellingPrice) || 0;
    const profit = parsedPrice - bundle.providerCost;
    const margin = parsedPrice > 0 ? (profit / parsedPrice) * 100 : 0;
    let warningLevel = "PROFITABLE";
    let warningColor = "text-green-600 dark:text-green-400";
    if (profit < 0) {
        warningLevel = "LOSS";
        warningColor = "text-red-600 dark:text-red-400";
    }
    else if (margin < 5) {
        warningLevel = "LOW MARGIN";
        warningColor = "text-orange-500";
    }
    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/bundles/${bundle.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sellingPrice: parsedPrice,
                    active,
                }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update bundle");
            }
            router.refresh();
            onOpenChange(false);
        }
        catch (error) {
            alert(error.message);
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Edit Bundle: ", bundle.dataSize] }), _jsx(DialogDescription, { children: "Manage retail pricing and visibility for this package." })] }), _jsxs("div", { className: "grid gap-6 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium", children: "Provider DataMart Price (Wholesale)" }), _jsxs("div", { className: "text-xl font-bold text-muted-foreground p-3 bg-muted rounded-md border", children: ["GH\u20B5 ", bundle.providerCost.toFixed(2)] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "This is the cost charged to your wallet." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium", children: "Your Retail Selling Price" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-2.5 text-muted-foreground font-medium", children: "GH\u20B5" }), _jsx(Input, { id: "price", type: "number", step: "0.01", min: "0", className: "pl-12 text-lg font-bold", value: sellingPrice, onChange: (e) => setSellingPrice(e.target.value) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 p-4 border rounded-lg bg-card", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Your Profit" }), _jsxs("div", { className: cn("text-xl font-bold mt-1", warningColor), children: [profit >= 0 ? "+" : "", "GH\u20B5 ", profit.toFixed(2)] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Profit Margin" }), _jsxs("div", { className: cn("text-xl font-bold mt-1", warningColor), children: [margin.toFixed(2), "%"] })] }), _jsx("div", { className: "col-span-2", children: _jsx(Badge, { variant: "outline", className: cn("mt-2", warningColor), children: warningLevel }) })] }), _jsxs("div", { className: "flex items-center justify-between border rounded-lg p-4", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx("p", { className: "text-sm font-medium", children: "Active Status" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Inactive bundles are hidden from customers." })] }), _jsx(Switch, { checked: active, onCheckedChange: setActive })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: saving, children: "Cancel" }), _jsx(Button, { onClick: handleSave, disabled: saving || parsedPrice < 0, children: saving ? "Saving..." : "Save Changes" })] })] }) }));
}
