"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { transferRecords } from "@/data/seed";
import { cn } from "@/lib/utils";
import { TransferStats } from "@/components/transfers/transfer-stats";
import { TransferList } from "@/components/transfers/transfer-list";
import { QuickSend } from "@/components/transfers/quick-send";
const tabs = [
    { key: "all", label: "All" },
    { key: "sent", label: "Sent" },
    { key: "received", label: "Received" },
    { key: "scheduled", label: "Scheduled" },
];
export function TransfersPageClient() {
    const [activeTab, setActiveTab] = useState("all");
    const [transfers, setTransfers] = useState(transferRecords);
    const filtered = useMemo(() => {
        if (activeTab === "all")
            return transfers;
        return transfers.filter((t) => t.type === activeTab);
    }, [activeTab, transfers]);
    function handleCancel(id) {
        setTransfers((prev) => prev.filter((t) => t.id !== id));
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(TransferStats, { transfers: transfers }), _jsx("div", { className: "flex items-center gap-1 rounded-lg bg-muted p-1", children: tabs.map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab.key), className: cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", activeTab === tab.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"), children: tab.label }, tab.key))) }), _jsx(TransferList, { transfers: filtered, onCancel: handleCancel }), _jsx(QuickSend, { onSend: (record) => setTransfers((prev) => [record, ...prev]) })] }));
}
