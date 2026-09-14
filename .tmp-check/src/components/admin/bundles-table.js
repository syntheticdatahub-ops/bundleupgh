"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EditBundleDialog } from "./edit-bundle-dialog";
export function AdminBundlesTable({ bundles, networks }) {
    const [editingBundle, setEditingBundle] = useState(null);
    // Group bundles by networkId
    const bundlesByNetwork = useMemo(() => {
        const grouped = {};
        // Ensure all networks have at least an empty array
        networks.forEach((n) => {
            grouped[n.id] = [];
        });
        // Also handle bundles with unknown networks
        bundles.forEach((b) => {
            if (!grouped[b.networkId]) {
                grouped[b.networkId] = [];
            }
            grouped[b.networkId].push(b);
        });
        // Sort bundles in each network by data size (simple string sort for now, or by provider cost)
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => a.providerCost - b.providerCost);
        });
        return grouped;
    }, [bundles, networks]);
    const networkIds = Object.keys(bundlesByNetwork);
    const defaultTab = networkIds.length > 0 ? networkIds[0] : "";
    const renderTable = (networkId, networkBundles) => {
        if (networkBundles.length === 0) {
            return (_jsx("div", { className: "py-16 text-center text-muted-foreground text-sm", children: "No bundles found for this network. Click Sync DataMart Catalog to import packages." }));
        }
        return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider", children: [_jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Bundle" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "DataMart Cost" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Your Price" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Profit" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Margin" }), _jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-right font-medium", children: "Actions" })] }) }), _jsx("tbody", { children: networkBundles.map((bundle) => {
                            const profit = bundle.sellingPrice - bundle.providerCost;
                            const margin = bundle.sellingPrice > 0 ? (profit / bundle.sellingPrice) * 100 : 0;
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
                            return (_jsxs("tr", { className: "border-b last:border-0 hover:bg-muted/30 transition-colors", children: [_jsx("td", { className: "px-4 py-3 font-semibold", children: bundle.dataSize }), _jsxs("td", { className: "px-4 py-3 text-right text-muted-foreground", children: ["GH\u20B5 ", bundle.providerCost.toFixed(2)] }), _jsxs("td", { className: "px-4 py-3 text-right font-semibold", children: ["GH\u20B5 ", bundle.sellingPrice.toFixed(2)] }), _jsxs("td", { className: cn("px-4 py-3 text-right font-semibold", warningColor), children: [profit >= 0 ? "+" : "", "GH\u20B5 ", profit.toFixed(2)] }), _jsxs("td", { className: "px-4 py-3 text-right font-semibold text-muted-foreground", children: [margin.toFixed(1), "%", _jsx("div", { className: cn("text-[10px] font-bold mt-1", warningColor), children: warningLevel })] }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex flex-col gap-1 text-[11px]", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: cn("w-1.5 h-1.5 rounded-full", bundle.providerAvailable !== false ? "bg-green-500" : "bg-red-500") }), _jsxs("span", { className: cn(bundle.providerAvailable !== false ? "text-muted-foreground" : "text-red-500 font-medium"), children: ["Provider: ", bundle.providerAvailable !== false ? "Available" : "Unavailable"] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: cn("w-1.5 h-1.5 rounded-full", bundle.active ? "bg-green-500" : "bg-muted-foreground") }), _jsxs("span", { className: cn(bundle.active ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"), children: ["Retail: ", bundle.active ? "Active" : "Disabled"] })] })] }) }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setEditingBundle(bundle), children: "Edit" }) })] }, bundle.id));
                        }) })] }) }));
    };
    if (networkIds.length === 0) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "py-16 text-center text-muted-foreground text-sm", children: "No networks found." }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsxs(Tabs, { defaultValue: defaultTab, className: "w-full", children: [_jsx(TabsList, { className: "mb-4", children: networkIds.map((netId) => {
                            const net = networks.find(n => n.id === netId);
                            const label = net ? net.name : netId;
                            return (_jsxs(TabsTrigger, { value: netId, className: "min-w-[100px]", children: [label, _jsx(Badge, { variant: "secondary", className: "ml-2 bg-muted/50 text-muted-foreground font-normal rounded-full px-1.5 py-0", children: bundlesByNetwork[netId].length })] }, netId));
                        }) }), networkIds.map((netId) => (_jsx(TabsContent, { value: netId, className: "mt-0 outline-none", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: renderTable(netId, bundlesByNetwork[netId]) }) }) }, netId)))] }), editingBundle && (_jsx(EditBundleDialog, { bundle: editingBundle, open: !!editingBundle, onOpenChange: (open) => !open && setEditingBundle(null) }))] }));
}
