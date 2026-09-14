"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { AlertTriangleIcon, Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const DEFAULT_MESSAGE = "Oops, sorry… Play Ato is making a few changes for a better experience. Sorry for any inconvenience.";
export function MaintenanceCard() {
    const [enabled, setEnabled] = React.useState(true);
    const [message, setMessage] = React.useState(DEFAULT_MESSAGE);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        let isMounted = true;
        async function loadState() {
            try {
                const response = await fetch("/api/admin/maintenance", { cache: "no-store" });
                if (!response.ok) {
                    throw new Error("Unable to load maintenance state");
                }
                const payload = (await response.json());
                if (!isMounted)
                    return;
                setEnabled(Boolean(payload.enabled));
                setMessage(payload.message || DEFAULT_MESSAGE);
            }
            catch (err) {
                if (!isMounted)
                    return;
                setError((err === null || err === void 0 ? void 0 : err.message) || "Unable to load maintenance state.");
            }
            finally {
                if (isMounted)
                    setLoading(false);
            }
        }
        void loadState();
        return () => {
            isMounted = false;
        };
    }, []);
    async function save() {
        setSaving(true);
        setError(null);
        try {
            const response = await fetch("/api/admin/maintenance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled, message: message.trim() || DEFAULT_MESSAGE }),
            });
            const payload = (await response.json().catch(() => null));
            if (!response.ok) {
                throw new Error((payload === null || payload === void 0 ? void 0 : payload.error) || "Unable to update maintenance mode.");
            }
            setEnabled(Boolean(payload.enabled));
            setMessage(payload.message || message);
        }
        catch (err) {
            setError((err === null || err === void 0 ? void 0 : err.message) || "Unable to update maintenance mode.");
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(ShieldCheckIcon, { className: "size-4" }), "Maintenance Mode"] }), _jsx(CardDescription, { children: "Temporary site shutdown for public visitors while the platform is being repaired." })] }), _jsxs("div", { className: "flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium", children: [_jsx("span", { className: `inline-block size-2 rounded-full ${enabled ? "bg-red-500" : "bg-emerald-500"}` }), enabled ? "ON" : "OFF"] })] }) }), _jsxs(CardContent, { className: "space-y-5", children: [error && (_jsx("div", { className: "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300", children: error })), _jsxs("div", { className: "flex items-center justify-between rounded-lg border bg-muted/30 p-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [_jsx(AlertTriangleIcon, { className: "size-4 text-amber-500" }), "Maintenance status"] }), _jsx(Switch, { checked: enabled, onCheckedChange: setEnabled, "aria-label": "Maintenance mode toggle" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", children: "Maintenance message" }), _jsx(Input, { value: message, onChange: (event) => setMessage(event.target.value), placeholder: DEFAULT_MESSAGE, disabled: loading })] }), _jsxs("div", { className: "flex items-center justify-between gap-3 pt-2", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: loading ? "Loading…" : enabled ? "Public visitors are being redirected to the maintenance page." : "Public visitors can access the live website." }), _jsxs(Button, { onClick: save, disabled: saving || loading, children: [saving ? _jsx(Loader2Icon, { className: "mr-2 size-4 animate-spin" }) : null, saving ? "Saving..." : "Save changes"] })] })] })] }));
}
