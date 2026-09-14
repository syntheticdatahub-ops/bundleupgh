"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, } from "@/components/ui/command";
import { LayoutDashboardIcon, WalletIcon, ArrowLeftRightIcon, CreditCardIcon, SendIcon, TrendingUpIcon, BitcoinIcon, ChartAreaIcon, TargetIcon, SettingsIcon, BellIcon, LogInIcon, UserPlusIcon, LifeBuoyIcon, SearchIcon, MoonIcon, SunIcon, MonitorIcon, } from "lucide-react";
import { useTheme } from "next-themes";
import { contacts, recentTransactions, cryptoCoins } from "@/data/seed";
export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { setTheme } = useTheme();
    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);
    const run = useCallback((fn) => {
        setOpen(false);
        fn();
    }, []);
    return (_jsx(CommandDialog, { open: open, onOpenChange: setOpen, title: "Command Palette", description: "Search pages, transactions, contacts, and more", children: _jsxs(Command, { children: [_jsx(CommandInput, { placeholder: "Type a command or search..." }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: "No results found." }), _jsx(CommandGroup, { heading: "Pages", children: [
                                { label: "Dashboard", icon: LayoutDashboardIcon, href: "/dashboard" },
                                { label: "Accounts", icon: WalletIcon, href: "/accounts" },
                                { label: "Transactions", icon: ArrowLeftRightIcon, href: "/transactions" },
                                { label: "Transfers", icon: SendIcon, href: "/transfers" },
                                { label: "Cards", icon: CreditCardIcon, href: "/cards" },
                                { label: "Crypto", icon: BitcoinIcon, href: "/crypto" },
                                { label: "Analytics", icon: ChartAreaIcon, href: "/analytics" },
                                { label: "Investments", icon: TrendingUpIcon, href: "/investments" },
                                { label: "Budgets", icon: TargetIcon, href: "/budgets" },
                                { label: "Settings", icon: SettingsIcon, href: "/settings" },
                                { label: "Notifications", icon: BellIcon, href: "/notifications" },
                                { label: "Help & Support", icon: LifeBuoyIcon, href: "/support" },
                                { label: "Sign In", icon: LogInIcon, href: "/sign-in" },
                                { label: "Sign Up", icon: UserPlusIcon, href: "/sign-up" },
                            ].map((page) => (_jsxs(CommandItem, { onSelect: () => run(() => router.push(page.href)), children: [_jsx(page.icon, { className: "mr-2 size-4" }), page.label] }, page.href))) }), _jsx(CommandSeparator, {}), _jsx(CommandGroup, { heading: "Recent Transactions", children: recentTransactions.slice(0, 5).map((tx) => (_jsxs(CommandItem, { onSelect: () => run(() => router.push("/transactions")), children: [_jsx(SearchIcon, { className: "mr-2 size-4" }), tx.merchant, _jsxs("span", { className: "ml-auto text-xs tabular-nums text-muted-foreground", children: [tx.amount > 0 ? "+" : "", "$", Math.abs(tx.amount).toFixed(2)] })] }, tx.id))) }), _jsx(CommandSeparator, {}), _jsx(CommandGroup, { heading: "Quick Transfer", children: contacts.slice(0, 4).map((c) => (_jsxs(CommandItem, { onSelect: () => run(() => router.push("/transfers")), children: [_jsx(SendIcon, { className: "mr-2 size-4" }), "Send to ", c.name] }, c.id))) }), _jsx(CommandSeparator, {}), _jsx(CommandGroup, { heading: "Crypto", children: cryptoCoins.slice(0, 4).map((coin) => (_jsxs(CommandItem, { onSelect: () => run(() => router.push("/crypto")), children: [_jsx(BitcoinIcon, { className: "mr-2 size-4" }), coin.name, _jsxs("span", { className: "ml-auto text-xs tabular-nums text-muted-foreground", children: ["$", coin.price.toLocaleString()] })] }, coin.id))) }), _jsx(CommandSeparator, {}), _jsxs(CommandGroup, { heading: "Theme", children: [_jsxs(CommandItem, { onSelect: () => run(() => setTheme("light")), children: [_jsx(SunIcon, { className: "mr-2 size-4" }), "Light Mode"] }), _jsxs(CommandItem, { onSelect: () => run(() => setTheme("dark")), children: [_jsx(MoonIcon, { className: "mr-2 size-4" }), "Dark Mode"] }), _jsxs(CommandItem, { onSelect: () => run(() => setTheme("system")), children: [_jsx(MonitorIcon, { className: "mr-2 size-4" }), "System Theme"] })] })] })] }) }));
}
