"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from "react";
import { ArrowDownUpIcon, SettingsIcon, LoaderCircleIcon, CheckCircleIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardAction, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { cryptoCoins } from "@/data/seed";
const TABS = ["Exchange", "Trade", "Buy", "Sell"];
export function TradeForm({ prices }) {
    var _a, _b;
    const [activeTab, setActiveTab] = React.useState("Trade");
    const [amount, setAmount] = React.useState("0.5");
    const [fromCoin, setFromCoin] = React.useState("eth");
    const [toCoin, setToCoin] = React.useState("usd");
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [successDetail, setSuccessDetail] = React.useState("");
    const isBuyMode = activeTab === "Buy";
    const isSellMode = activeTab === "Sell";
    // For Buy mode: amount is in USD, fromCoin is "usd", toCoin is a crypto
    // For Sell mode: amount is in crypto, fromCoin is crypto, toCoin is "usd"
    // For Exchange/Trade: amount is from crypto, converted to toCoin
    const fromPrice = (_a = prices[fromCoin]) !== null && _a !== void 0 ? _a : 0;
    const toPrice = (_b = prices[toCoin]) !== null && _b !== void 0 ? _b : 0;
    const converted = React.useMemo(() => {
        var _a, _b;
        const val = parseFloat(amount || "0");
        if (val <= 0)
            return "0.00";
        if (isBuyMode) {
            // USD -> crypto: val USD / crypto price
            const cryptoPrice = (_a = prices[toCoin]) !== null && _a !== void 0 ? _a : 0;
            if (cryptoPrice <= 0)
                return "0.00";
            return (val / cryptoPrice).toFixed(6);
        }
        if (isSellMode) {
            // Crypto -> USD: val * crypto price
            const cryptoPrice = (_b = prices[fromCoin]) !== null && _b !== void 0 ? _b : 0;
            return (val * cryptoPrice).toFixed(2);
        }
        // Exchange/Trade: crypto -> crypto or crypto -> usd
        if (toCoin === "usd") {
            return (val * fromPrice).toFixed(2);
        }
        if (fromPrice <= 0 || toPrice <= 0)
            return "0.00";
        return ((val * fromPrice) / toPrice).toFixed(6);
    }, [amount, fromCoin, toCoin, fromPrice, toPrice, prices, isBuyMode, isSellMode]);
    // Adapt form fields when tab changes
    React.useEffect(() => {
        if (isBuyMode) {
            setFromCoin("usd");
            if (toCoin === "usd")
                setToCoin("btc");
        }
        else if (isSellMode) {
            if (fromCoin === "usd")
                setFromCoin("eth");
            setToCoin("usd");
        }
        else {
            if (fromCoin === "usd")
                setFromCoin("eth");
            if (toCoin === fromCoin)
                setToCoin("usd");
        }
        // Only run when tab changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);
    function handleTrade() {
        const val = parseFloat(amount || "0");
        if (val <= 0)
            return;
        setLoading(true);
        setTimeout(() => {
            var _a, _b, _c, _d;
            setLoading(false);
            setSuccess(true);
            const fromLabel = fromCoin === "usd" ? "USD" : ((_b = (_a = cryptoCoins.find((c) => c.id === fromCoin)) === null || _a === void 0 ? void 0 : _a.symbol) !== null && _b !== void 0 ? _b : fromCoin.toUpperCase());
            const toLabel = toCoin === "usd" ? "USD" : ((_d = (_c = cryptoCoins.find((c) => c.id === toCoin)) === null || _c === void 0 ? void 0 : _c.symbol) !== null && _d !== void 0 ? _d : toCoin.toUpperCase());
            setSuccessDetail(`${val} ${fromLabel} -> ${converted} ${toLabel}`);
            setTimeout(() => {
                setSuccess(false);
                setSuccessDetail("");
            }, 2000);
        }, 1500);
    }
    function handleSwap() {
        const prevFrom = fromCoin;
        const prevTo = toCoin;
        setFromCoin(prevTo === "usd" ? "btc" : prevTo);
        setToCoin(prevFrom);
    }
    const amountLabel = isBuyMode ? "Amount (USD)" : isSellMode ? "Amount (Crypto)" : "Amount";
    const receivedLabel = isBuyMode ? "You Receive" : isSellMode ? "You Receive (USD)" : "Received";
    return (_jsxs(Card, { className: "lg:col-span-4", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Transaction" }), _jsx(CardAction, { children: _jsx(Button, { variant: "ghost", size: "icon-xs", children: _jsx(SettingsIcon, { className: "size-4 text-muted-foreground" }) }) })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "flex gap-1 rounded-lg bg-muted p-1", children: TABS.map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), className: cn("flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors", tab === activeTab
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"), children: tab }, tab))) }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs text-muted-foreground", children: amountLabel }), _jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-input bg-transparent px-2.5", children: [_jsx(Input, { type: "number", value: amount, onChange: (e) => setAmount(e.target.value), disabled: loading || success, className: "h-10 border-0 bg-transparent px-0 text-base font-semibold tabular-nums shadow-none focus-visible:ring-0" }), isBuyMode ? (_jsx("span", { className: "shrink-0 text-sm font-medium text-muted-foreground px-2", children: "USD" })) : (_jsxs(Select, { value: fromCoin, onValueChange: (v) => v && setFromCoin(v), disabled: loading || success, children: [_jsx(SelectTrigger, { size: "sm", className: "w-auto shrink-0 border-0 bg-transparent shadow-none", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: cryptoCoins.map((coin) => (_jsx(SelectItem, { value: coin.id, children: coin.symbol }, coin.id))) })] }))] })] }), !isBuyMode && !isSellMode && (_jsx("div", { className: "flex justify-center", children: _jsx(Button, { variant: "outline", size: "icon", className: "rounded-full", onClick: handleSwap, disabled: loading || success, children: _jsx(ArrowDownUpIcon, { className: "size-4" }) }) })), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-xs text-muted-foreground", children: receivedLabel }), _jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-input bg-muted/40 px-2.5", children: [_jsx("p", { className: "h-10 flex-1 truncate py-2.5 text-base font-semibold tabular-nums text-muted-foreground", children: converted }), isSellMode ? (_jsx("span", { className: "shrink-0 text-sm font-medium text-muted-foreground px-2", children: "USD" })) : (_jsxs(Select, { value: toCoin, onValueChange: (v) => v && setToCoin(v), disabled: loading || success, children: [_jsx(SelectTrigger, { size: "sm", className: "w-auto shrink-0 border-0 bg-transparent shadow-none", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [!isBuyMode && _jsx(SelectItem, { value: "usd", children: "USD" }), cryptoCoins.map((coin) => (_jsx(SelectItem, { value: coin.id, children: coin.symbol }, coin.id)))] })] }))] })] }), _jsx(AnimatePresence, { mode: "wait", children: success ? (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "flex flex-col items-center gap-1 rounded-lg bg-emerald-500/10 py-3 text-center", children: [_jsx(CheckCircleIcon, { className: "size-6 text-emerald-500" }), _jsx("p", { className: "text-sm font-semibold text-emerald-600 dark:text-emerald-400", children: "Trade completed!" }), successDetail && (_jsx("p", { className: "text-xs text-muted-foreground", children: successDetail }))] }, "success")) : (_jsx(motion.div, { initial: { opacity: 1 }, exit: { opacity: 0 }, children: _jsx(Button, { className: "w-full gap-2", size: "lg", onClick: handleTrade, disabled: loading || !amount || parseFloat(amount) <= 0, children: loading ? (_jsxs(_Fragment, { children: [_jsx(LoaderCircleIcon, { className: "size-4 animate-spin" }), "Processing..."] })) : (`${activeTab} Now`) }) }, "button")) })] })] }));
}
