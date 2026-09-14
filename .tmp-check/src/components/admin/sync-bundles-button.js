"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
export function SyncBundlesButton() {
    const [syncing, setSyncing] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();
    async function handleSync() {
        setSyncing(true);
        setError(null);
        setLastResult(null);
        try {
            const res = await fetch("/api/admin/bundles/sync", { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Sync failed");
                return;
            }
            setLastResult(data);
            router.refresh();
        }
        catch (err) {
            setError(err.message || "Network error during sync");
        }
        finally {
            setSyncing(false);
        }
    }
    return (_jsxs("div", { className: "flex flex-col items-end gap-2", children: [_jsxs(Button, { onClick: handleSync, disabled: syncing, className: "gap-2", children: [_jsx(RefreshCw, { className: cn("h-4 w-4", syncing && "animate-spin") }), syncing ? "Syncing..." : "Sync DataMart Catalog"] }), lastResult && (_jsxs("div", { className: "flex flex-col items-start gap-1 text-xs rounded-lg border px-3 py-2 bg-card text-muted-foreground", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-3.5 w-3.5 text-green-500 shrink-0" }), _jsx("span", { className: "font-medium text-foreground", children: "Catalog Sync Complete" }), _jsxs("span", { children: ["(", new Date(lastResult.syncedAt).toLocaleTimeString(), ")"] })] }), _jsxs("div", { className: "ml-5.5 grid grid-cols-2 gap-x-6 gap-y-0.5 mt-1", children: [_jsxs("span", { children: ["Total imported: ", _jsx("span", { className: "font-medium text-foreground", children: lastResult.imported })] }), _jsxs("span", { children: ["New packages: ", _jsx("span", { className: "text-green-600 dark:text-green-400 font-medium", children: lastResult.created })] }), _jsxs("span", { children: ["Cost updated: ", _jsx("span", { className: "text-blue-600 dark:text-blue-400 font-medium", children: lastResult.updated })] }), _jsxs("span", { children: ["Unchanged: ", _jsx("span", { children: lastResult.unchanged })] }), _jsxs("span", { children: ["Reactivated: ", _jsx("span", { className: "text-purple-600 dark:text-purple-400 font-medium", children: lastResult.reactivated })] }), _jsxs("span", { children: ["Unavailable: ", _jsx("span", { className: "text-red-600 dark:text-red-400 font-medium", children: lastResult.deactivated })] }), lastResult.failed > 0 && _jsxs("span", { className: "text-red-500 col-span-2", children: ["Failed: ", lastResult.failed] })] })] })), error && (_jsxs("div", { className: "flex items-center gap-2 text-xs rounded-lg border border-red-500/20 px-3 py-2 bg-red-500/5 text-red-500", children: [_jsx(XCircle, { className: "h-3.5 w-3.5 shrink-0" }), _jsx("span", { children: error })] }))] }));
}
