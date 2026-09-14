"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { ArrowUpIcon, ArrowDownIcon, CheckIcon, LoaderCircleIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { cryptoCoins } from "@/data/seed";
export function MyBalance({ prices }) {
    var _a;
    const [highlightedCoin, setHighlightedCoin] = React.useState("eth");
    const [topUpFlow, setTopUpFlow] = React.useState("idle");
    const [withdrawFlow, setWithdrawFlow] = React.useState("idle");
    const [topUpAmount, setTopUpAmount] = React.useState("");
    const [withdrawAmount, setWithdrawAmount] = React.useState("");
    const [successMsg, setSuccessMsg] = React.useState("");
    const totalBalance = cryptoCoins.reduce((sum, coin) => { var _a; return sum + coin.holdings * ((_a = prices[coin.id]) !== null && _a !== void 0 ? _a : coin.price); }, 0);
    const coin = cryptoCoins.find((c) => c.id === highlightedCoin);
    const coinPrice = coin ? ((_a = prices[coin.id]) !== null && _a !== void 0 ? _a : coin.price) : 0;
    const coinValue = coin ? coin.holdings * coinPrice : 0;
    const stats = [
        {
            label: "Total Profit",
            value: `+$${(totalBalance * 0.033).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            positive: true,
        },
        { label: "Avg. Growing", value: "+14.63%", positive: true },
        {
            label: coin ? coin.symbol : "Best Token",
            value: coin
                ? `$${coinValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "Ethereum",
            positive: null,
        },
    ];
    function handleTopUp() {
        if (topUpFlow === "idle") {
            setTopUpFlow("input");
            return;
        }
        if (topUpFlow === "input") {
            const val = parseFloat(topUpAmount);
            if (!val || val <= 0)
                return;
            setTopUpFlow("loading");
            setTimeout(() => {
                setSuccessMsg(`Topped up $${val.toFixed(2)}`);
                setTopUpFlow("success");
                setTimeout(() => {
                    setTopUpFlow("idle");
                    setTopUpAmount("");
                    setSuccessMsg("");
                }, 2000);
            }, 1000);
        }
    }
    function handleWithdraw() {
        if (withdrawFlow === "idle") {
            setWithdrawFlow("input");
            return;
        }
        if (withdrawFlow === "input") {
            const val = parseFloat(withdrawAmount);
            if (!val || val <= 0)
                return;
            setWithdrawFlow("loading");
            setTimeout(() => {
                setSuccessMsg(`Withdrew $${val.toFixed(2)}`);
                setWithdrawFlow("success");
                setTimeout(() => {
                    setWithdrawFlow("idle");
                    setWithdrawAmount("");
                    setSuccessMsg("");
                }, 2000);
            }, 1000);
        }
    }
    return (_jsxs(Card, { className: "lg:col-span-4", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "My Balance" }), _jsx(CardAction, { children: _jsxs(Select, { value: highlightedCoin, onValueChange: (v) => v && setHighlightedCoin(v), children: [_jsx(SelectTrigger, { size: "sm", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: cryptoCoins.slice(0, 5).map((c) => (_jsx(SelectItem, { value: c.id, children: c.symbol }, c.id))) })] }) })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(motion.p, { initial: { opacity: 0.6, y: -4 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, className: "text-3xl font-bold tabular-nums tracking-tight", children: ["$", totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }, Math.round(totalBalance)), _jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: stats.map((stat) => (_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: stat.label }), _jsx("p", { className: cn("text-sm font-semibold tabular-nums", stat.positive === true && "text-emerald-600 dark:text-emerald-400", stat.positive === false && "text-rose-600 dark:text-rose-400"), children: stat.value })] }, stat.label))) }), _jsx(AnimatePresence, { children: successMsg && (_jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, className: "flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400", children: [_jsx(CheckIcon, { className: "size-4" }), successMsg] })) }), _jsxs(AnimatePresence, { children: [topUpFlow === "input" && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, className: "overflow-hidden", children: _jsx(Input, { type: "text", inputMode: "decimal", placeholder: "Enter amount...", value: topUpAmount, onChange: (e) => setTopUpAmount(e.target.value), className: "mb-2 focus-visible:ring-0", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && handleTopUp() }) })), withdrawFlow === "input" && (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, className: "overflow-hidden", children: _jsx(Input, { type: "text", inputMode: "decimal", placeholder: "Enter amount...", value: withdrawAmount, onChange: (e) => setWithdrawAmount(e.target.value), className: "mb-2 focus-visible:ring-0", autoFocus: true, onKeyDown: (e) => e.key === "Enter" && handleWithdraw() }) }))] }), _jsxs("div", { className: "flex gap-2 pt-1", children: [_jsxs(Button, { className: "flex-1 gap-2", size: "lg", onClick: handleTopUp, disabled: topUpFlow === "loading" || topUpFlow === "success" || withdrawFlow !== "idle", children: [topUpFlow === "loading" ? (_jsx(LoaderCircleIcon, { className: "size-4 animate-spin" })) : (_jsx(ArrowUpIcon, { className: "size-4" })), topUpFlow === "input" ? "Confirm" : topUpFlow === "loading" ? "Processing..." : "Top Up"] }), _jsxs(Button, { variant: "outline", className: "flex-1 gap-2", size: "lg", onClick: handleWithdraw, disabled: withdrawFlow === "loading" || withdrawFlow === "success" || topUpFlow !== "idle", children: [withdrawFlow === "loading" ? (_jsx(LoaderCircleIcon, { className: "size-4 animate-spin" })) : (_jsx(ArrowDownIcon, { className: "size-4" })), withdrawFlow === "input" ? "Confirm" : withdrawFlow === "loading" ? "Processing..." : "Withdraw"] })] })] })] }));
}
