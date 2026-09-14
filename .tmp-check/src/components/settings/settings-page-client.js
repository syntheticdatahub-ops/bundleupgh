"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { UserIcon, ShieldIcon, BellIcon, CreditCardIcon, PaletteIcon, LoaderIcon, MonitorIcon, SunIcon, MoonIcon, CheckIcon, DownloadIcon, SmartphoneIcon, LaptopIcon, TabletIcon, SparklesIcon, AlertTriangleIcon, CheckCircle2Icon, } from "lucide-react";
const tabs = [
    { id: "profile", label: "Profile", icon: _jsx(UserIcon, { className: "size-4" }) },
    { id: "security", label: "Security", icon: _jsx(ShieldIcon, { className: "size-4" }) },
    { id: "notifications", label: "Notifications", icon: _jsx(BellIcon, { className: "size-4" }) },
    { id: "billing", label: "Billing", icon: _jsx(CreditCardIcon, { className: "size-4" }) },
    { id: "appearance", label: "Appearance", icon: _jsx(PaletteIcon, { className: "size-4" }) },
];
// ── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
    const [saving, setSaving] = React.useState(false);
    const [name, setName] = React.useState("Abderrahim G.");
    const [email, setEmail] = React.useState("abderrahim@fintech.com");
    function handleSave() {
        setSaving(true);
        setTimeout(() => setSaving(false), 1200);
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Profile Information" }), _jsx(CardDescription, { children: "Update your account profile details" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { className: "size-16", children: [_jsx(AvatarImage, { src: "/avatars/user.jpg", alt: "User avatar" }), _jsx(AvatarFallback, { className: "text-lg", children: "AG" })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: name }), _jsx("p", { className: "text-sm text-muted-foreground", children: email })] })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "name", children: "Full Name" }), _jsx(Input, { id: "name", value: name, onChange: (e) => setName(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "email", children: "Email Address" }), _jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value) })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs(Button, { onClick: handleSave, disabled: saving, children: [saving && _jsx(LoaderIcon, { className: "size-4 animate-spin" }), saving ? "Saving..." : "Save Changes"] }) })] })] }));
}
// ── Security Tab ─────────────────────────────────────────────────────────────
const mockSessions = [
    { device: "MacBook Pro", icon: _jsx(LaptopIcon, { className: "size-4" }), location: "San Francisco, CA", lastActive: "Active now" },
    { device: "iPhone 15", icon: _jsx(SmartphoneIcon, { className: "size-4" }), location: "San Francisco, CA", lastActive: "2 hours ago" },
    { device: "iPad Air", icon: _jsx(TabletIcon, { className: "size-4" }), location: "New York, NY", lastActive: "3 days ago" },
];
function SecurityTab() {
    const [twoFA, setTwoFA] = React.useState(true);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Change Password" }), _jsx(CardDescription, { children: "Update your password to keep your account secure" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "current-pw", children: "Current Password" }), _jsx(Input, { id: "current-pw", type: "password", placeholder: "Enter current password" })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "new-pw", children: "New Password" }), _jsx(Input, { id: "new-pw", type: "password", placeholder: "Enter new password" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium", htmlFor: "confirm-pw", children: "Confirm Password" }), _jsx(Input, { id: "confirm-pw", type: "password", placeholder: "Confirm new password" })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { children: "Update Password" }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Two-Factor Authentication" }), _jsx(CardDescription, { children: "Add an extra layer of security to your account" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-sm font-medium", children: twoFA ? "Enabled" : "Disabled" }), _jsx("p", { className: "text-sm text-muted-foreground", children: twoFA
                                                ? "Your account is protected with 2FA"
                                                : "Enable 2FA for enhanced security" })] }), _jsx(Switch, { checked: twoFA, onCheckedChange: setTwoFA })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Active Sessions" }), _jsx(CardDescription, { children: "Manage devices logged into your account" })] }), _jsx(CardContent, { className: "space-y-3", children: mockSessions.map((s) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex size-8 items-center justify-center rounded-full bg-muted", children: s.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: s.device }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [s.location, " \u00B7 ", s.lastActive] })] })] }), s.lastActive !== "Active now" && (_jsx(Button, { variant: "outline", size: "sm", children: "Revoke" }))] }, s.device))) })] })] }));
}
// ── Notifications Tab ────────────────────────────────────────────────────────
const notifToggles = [
    { id: "email", label: "Email Notifications", description: "Receive notifications via email", default: true },
    { id: "push", label: "Push Notifications", description: "Receive push notifications on your devices", default: true },
    { id: "transaction", label: "Transaction Alerts", description: "Get notified for every transaction", default: true },
    { id: "security", label: "Security Alerts", description: "Alerts for suspicious activity and logins", default: true },
    { id: "marketing", label: "Marketing Emails", description: "Receive product updates and offers", default: false },
    { id: "digest", label: "Weekly Digest", description: "A weekly summary of your account activity", default: true },
];
function NotificationsTab() {
    const [settings, setSettings] = React.useState(() => Object.fromEntries(notifToggles.map((t) => [t.id, t.default])));
    function toggle(id) {
        setSettings((prev) => (Object.assign(Object.assign({}, prev), { [id]: !prev[id] })));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Notification Preferences" }), _jsx(CardDescription, { children: "Choose what notifications you want to receive" })] }), _jsx(CardContent, { className: "space-y-1", children: notifToggles.map((t) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg px-1 py-3", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx("p", { className: "text-sm font-medium", children: t.label }), _jsx("p", { className: "text-sm text-muted-foreground", children: t.description })] }), _jsx(Switch, { checked: settings[t.id], onCheckedChange: () => toggle(t.id) })] }, t.id))) })] }));
}
// ── Billing Tab ──────────────────────────────────────────────────────────────
const invoices = [
    { date: "Mar 01, 2026", amount: "$0.00", status: "Free Plan", id: "INV-001" },
    { date: "Feb 01, 2026", amount: "$0.00", status: "Free Plan", id: "INV-002" },
    { date: "Jan 01, 2026", amount: "$0.00", status: "Free Plan", id: "INV-003" },
];
const freeFeatures = [
    "1 bank account connection",
    "Basic transaction tracking",
    "Monthly budget tracking",
    "Standard support",
];
const proFeatures = [
    "Unlimited bank connections",
    "Advanced analytics & insights",
    "Unlimited virtual cards",
    "Priority support",
    "Custom budget categories",
    "Export to CSV & PDF",
];
function BillingTab() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Current Plan" }), _jsx(CardDescription, { children: "You are currently on the free plan" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Vault Free" }), _jsx(Badge, { variant: "secondary", children: "Current" })] }), _jsx("ul", { className: "mt-3 space-y-1.5", children: freeFeatures.map((f) => (_jsxs("li", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(CheckIcon, { className: "size-3.5 text-emerald-500" }), f] }, f))) })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-2xl font-bold tabular-nums", children: "$0" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "/month" })] })] }), _jsxs("div", { className: "rounded-lg border bg-muted/30 p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(SparklesIcon, { className: "size-4 text-primary" }), _jsx("h4", { className: "font-semibold", children: "Vault Pro" })] }), _jsx("ul", { className: "mt-3 space-y-1.5", children: proFeatures.map((f) => (_jsxs("li", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(CheckIcon, { className: "size-3.5 text-primary" }), f] }, f))) })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-2xl font-bold tabular-nums", children: "$12" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "/month" })] })] }), _jsx("div", { className: "mt-4", children: _jsx(Button, { children: "Upgrade to Pro" }) })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Method" }), _jsx(CardDescription, { children: "Manage your payment details" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex size-8 items-center justify-center rounded-full bg-muted", children: _jsx(CreditCardIcon, { className: "size-4" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Visa ending in 4589" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Expires 09/28" })] })] }), _jsx(Button, { variant: "outline", size: "sm", children: "Update" })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Billing History" }), _jsx(CardDescription, { children: "Download past invoices and receipts" })] }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Amount" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { className: "text-right", children: "Invoice" })] }) }), _jsx(TableBody, { children: invoices.map((inv) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: inv.date }), _jsx(TableCell, { className: "tabular-nums", children: inv.amount }), _jsx(TableCell, { children: _jsx(Badge, { variant: "secondary", children: inv.status }) }), _jsx(TableCell, { className: "text-right", children: _jsxs(Button, { variant: "ghost", size: "icon-xs", children: [_jsx(DownloadIcon, { className: "size-3.5" }), _jsx("span", { className: "sr-only", children: "Download" })] }) })] }, inv.id))) })] }) })] })] }));
}
// ── Appearance Tab ───────────────────────────────────────────────────────────
function AppearanceTab() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    const themes = [
        { id: "light", label: "Light", icon: _jsx(SunIcon, { className: "size-5" }) },
        { id: "dark", label: "Dark", icon: _jsx(MoonIcon, { className: "size-5" }) },
        { id: "system", label: "System", icon: _jsx(MonitorIcon, { className: "size-5" }) },
    ];
    if (!mounted)
        return null;
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Appearance" }), _jsx(CardDescription, { children: "Customize how Vault looks on your device" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: themes.map((t) => (_jsxs("button", { type: "button", onClick: () => setTheme(t.id), className: cn("flex flex-col items-center gap-2 rounded-lg border-2 p-6 transition-all hover:bg-muted/50", theme === t.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border"), children: [t.icon, _jsx("span", { className: "text-sm font-medium", children: t.label }), theme === t.id && (_jsx(CheckIcon, { className: "size-4 text-primary" }))] }, t.id))) }) })] }));
}
function ResetDataTab() {
    const [confirmation, setConfirmation] = React.useState("");
    const [isResetting, setIsResetting] = React.useState(false);
    const [resetStatus, setResetStatus] = React.useState({
        type: "idle",
        message: "",
    });
    const confirmationText = "RESET BUNDLEUP DATA";
    const canReset = confirmation.trim() === confirmationText;
    async function handleReset() {
        var _a, _b;
        if (!canReset) {
            setResetStatus({ type: "error", message: `Type "${confirmationText}" to confirm.` });
            return;
        }
        setIsResetting(true);
        setResetStatus({ type: "idle", message: "" });
        try {
            const response = await fetch("/api/admin/reset-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmation: confirmationText }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error((_a = data === null || data === void 0 ? void 0 : data.error) !== null && _a !== void 0 ? _a : "Reset failed.");
            }
            setResetStatus({
                type: "success",
                message: (_b = data === null || data === void 0 ? void 0 : data.message) !== null && _b !== void 0 ? _b : "Reset request accepted.",
            });
            setConfirmation("");
        }
        catch (error) {
            setResetStatus({
                type: "error",
                message: error.message || "Unable to process reset request.",
            });
        }
        finally {
            setIsResetting(false);
        }
    }
    return (_jsxs(Card, { className: "border-destructive/40 bg-destructive/5", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2 text-destructive", children: [_jsx(AlertTriangleIcon, { className: "size-5" }), "Danger Zone"] }), _jsx(CardDescription, { children: "This section permanently removes customer, order, and payment data. Bundles and admin configuration remain protected." })] }), _jsxs(CardContent, { className: "space-y-5", children: [_jsxs("div", { className: "rounded-lg border border-destructive/40 bg-background/60 p-4 text-sm text-muted-foreground", children: [_jsx("p", { className: "font-medium text-foreground", children: "Protected reset" }), _jsxs("ul", { className: "mt-2 list-disc space-y-1 pl-5", children: [_jsx("li", { children: "Only an authenticated admin can trigger this action." }), _jsx("li", { children: "Only approved business data collections are cleared." }), _jsx("li", { children: "Bundles, networks, and admin settings are never deleted." })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { htmlFor: "reset-confirmation", className: "text-sm font-medium text-foreground", children: ["Type ", _jsx("span", { className: "font-mono font-semibold", children: confirmationText }), " to confirm"] }), _jsx(Input, { id: "reset-confirmation", value: confirmation, onChange: (event) => setConfirmation(event.target.value), placeholder: confirmationText, className: "font-mono" })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "This action is irreversible once the reset request is approved." }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { children: _jsxs(Button, { variant: "destructive", size: "sm", disabled: !canReset || isResetting, className: "w-full sm:w-auto", children: [isResetting ? _jsx(LoaderIcon, { className: "size-4 animate-spin" }) : _jsx(AlertTriangleIcon, { className: "size-4" }), isResetting ? "Resetting..." : "Reset Business Data"] }) }), _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Confirm reset" }), _jsx(DialogDescription, { children: "This will clear the business data in the approved reset collections. Bundles and admin configuration are excluded." })] }), _jsxs("div", { className: "rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-muted-foreground", children: ["Confirmed phrase: ", _jsx("span", { className: "font-mono font-semibold text-foreground", children: confirmationText })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", type: "button", children: "Cancel" }), _jsx(Button, { variant: "destructive", type: "button", onClick: handleReset, disabled: isResetting, children: isResetting ? "Resetting..." : "Proceed with reset" })] })] })] })] }), resetStatus.type !== "idle" && (_jsxs("div", { className: cn("flex items-start gap-2 rounded-lg border p-3 text-sm", resetStatus.type === "success"
                            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                            : "border-destructive/30 bg-destructive/5 text-destructive"), children: [resetStatus.type === "success" ? (_jsx(CheckCircle2Icon, { className: "mt-0.5 size-4 shrink-0" })) : (_jsx(AlertTriangleIcon, { className: "mt-0.5 size-4 shrink-0" })), _jsx("span", { children: resetStatus.message })] }))] })] }));
}
// ── Main Settings Page ───────────────────────────────────────────────────────
export function SettingsPageClient() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = React.useState(tabs.some((t) => t.id === tabParam) ? tabParam : "profile");
    const tabContent = {
        profile: _jsx(ProfileTab, {}),
        security: _jsx(SecurityTab, {}),
        notifications: _jsx(NotificationsTab, {}),
        billing: _jsx(BillingTab, {}),
        appearance: _jsxs(_Fragment, { children: [_jsx(AppearanceTab, {}), _jsx("div", { className: "mt-6", children: _jsx(ResetDataTab, {}) })] }),
    };
    return (_jsxs("div", { className: "flex flex-1 flex-col gap-4 lg:flex-row lg:gap-6", children: [_jsx("nav", { className: "hidden w-52 shrink-0 flex-col gap-1 lg:flex", children: tabs.map((tab) => (_jsxs(Button, { variant: activeTab === tab.id ? "secondary" : "ghost", size: "sm", className: cn("justify-start gap-2", activeTab === tab.id && "font-semibold"), onClick: () => setActiveTab(tab.id), children: [tab.icon, tab.label] }, tab.id))) }), _jsx("div", { className: "-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:hidden", children: tabs.map((tab) => (_jsxs(Button, { variant: activeTab === tab.id ? "secondary" : "ghost", size: "sm", className: "shrink-0 gap-1.5 text-xs", onClick: () => setActiveTab(tab.id), children: [tab.icon, tab.label] }, tab.id))) }), _jsx("div", { className: "min-w-0 flex-1", children: tabContent[activeTab] })] }));
}
