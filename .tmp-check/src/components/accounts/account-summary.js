import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { WalletIcon, TrendingUpIcon, TrendingDownIcon, LinkIcon, } from "lucide-react";
import { cn } from "@/lib/utils";
const fmt = (n, currency = "$") => `${currency}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(Math.abs(n))}`;
export function AccountSummary({ accounts }) {
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalChange = accounts.reduce((sum, a) => sum + a.change, 0);
    const isPositive = totalChange >= 0;
    const cards = [
        {
            label: "Total Balance",
            value: fmt(totalBalance),
            icon: WalletIcon,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            label: "Total Change",
            value: `${isPositive ? "+" : "-"}${fmt(totalChange)}`,
            icon: isPositive ? TrendingUpIcon : TrendingDownIcon,
            color: isPositive ? "text-emerald-500" : "text-rose-500",
            bg: isPositive ? "bg-emerald-500/10" : "bg-rose-500/10",
        },
        {
            label: "Linked Accounts",
            value: accounts.length.toString(),
            icon: LinkIcon,
            color: "text-muted-foreground",
            bg: "bg-muted",
        },
    ];
    return (_jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: cards.map((card) => (_jsxs("div", { className: "flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10", children: [_jsx("div", { className: cn("flex size-9 shrink-0 items-center justify-center rounded-full", card.bg), children: _jsx(card.icon, { className: cn("size-4", card.color) }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: card.label }), _jsx("p", { className: "tabular-nums text-base font-semibold tracking-tight", children: card.value })] })] }, card.label))) }));
}
