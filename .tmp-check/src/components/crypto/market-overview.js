"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import Image from "next/image";
import { SearchIcon, SlidersHorizontalIcon, MoreHorizontalIcon, TrendingUpIcon, TrendingDownIcon, ArrowUpIcon, ArrowDownIcon, } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardAction, } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { cryptoCoins } from "@/data/seed";
function compactNumber(n) {
    if (n >= 1e12)
        return `${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)
        return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6)
        return `${(n / 1e6).toFixed(2)}M`;
    return n.toLocaleString();
}
export function MarketOverview({ prices, originalPrices, selectedCoin, onSelectCoin }) {
    const [search, setSearch] = React.useState("");
    const [sortField, setSortField] = React.useState(null);
    const [sortDir, setSortDir] = React.useState(null);
    // Track flash directions in state (not refs) for React 19 compliance
    const [flashes, setFlashes] = React.useState({});
    const [prevPrices, setPrevPrices] = React.useState(prices);
    React.useEffect(() => {
        var _a, _b;
        const newFlashes = {};
        for (const coin of cryptoCoins) {
            const prev = (_a = prevPrices[coin.id]) !== null && _a !== void 0 ? _a : coin.price;
            const curr = (_b = prices[coin.id]) !== null && _b !== void 0 ? _b : coin.price;
            if (curr > prev)
                newFlashes[coin.id] = "up";
            else if (curr < prev)
                newFlashes[coin.id] = "down";
            else
                newFlashes[coin.id] = null;
        }
        setFlashes(newFlashes);
        const timer = setTimeout(() => {
            setPrevPrices(Object.assign({}, prices));
            setFlashes({});
        }, 600);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prices]);
    function handleSort(field) {
        if (sortField === field) {
            // Cycle: asc -> desc -> none
            if (sortDir === "asc")
                setSortDir("desc");
            else if (sortDir === "desc") {
                setSortField(null);
                setSortDir(null);
            }
            else
                setSortDir("asc");
        }
        else {
            setSortField(field);
            setSortDir("asc");
        }
    }
    // Build coin data with live prices
    const coinsWithLive = cryptoCoins.map((coin) => {
        var _a, _b;
        const livePrice = (_a = prices[coin.id]) !== null && _a !== void 0 ? _a : coin.price;
        const origPrice = (_b = originalPrices[coin.id]) !== null && _b !== void 0 ? _b : coin.price;
        const change24h = origPrice > 0 ? ((livePrice - origPrice) / origPrice) * 100 : 0;
        // Recalculate volume and market cap proportionally
        const priceRatio = origPrice > 0 ? livePrice / origPrice : 1;
        const volume = Math.round(coin.volume24h * priceRatio);
        const marketCap = Math.round(coin.marketCap * priceRatio);
        return Object.assign(Object.assign({}, coin), { livePrice, change24h, liveVolume: volume, liveMarketCap: marketCap });
    });
    const filtered = coinsWithLive.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase()));
    const sorted = React.useMemo(() => {
        if (!sortField || !sortDir)
            return filtered;
        return [...filtered].sort((a, b) => {
            let aVal, bVal;
            switch (sortField) {
                case "price":
                    aVal = a.livePrice;
                    bVal = b.livePrice;
                    break;
                case "volume":
                    aVal = a.liveVolume;
                    bVal = b.liveVolume;
                    break;
                case "change":
                    aVal = a.change24h;
                    bVal = b.change24h;
                    break;
                default: return 0;
            }
            return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        });
    }, [filtered, sortField, sortDir]);
    function SortIndicator({ field }) {
        if (sortField !== field)
            return null;
        return sortDir === "asc" ? (_jsx(ArrowUpIcon, { className: "ml-1 inline size-3" })) : (_jsx(ArrowDownIcon, { className: "ml-1 inline size-3" }));
    }
    return (_jsxs(Card, { className: "lg:col-span-8", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Market Overview" }), _jsxs(CardAction, { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(SearchIcon, { className: "absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" }), _jsx(Input, { placeholder: "Search...", value: search, onChange: (e) => setSearch(e.target.value), className: "h-7 w-36 pl-7 text-xs" })] }), _jsx(Button, { variant: "outline", size: "icon-xs", children: _jsx(SlidersHorizontalIcon, { className: "size-3.5" }) })] })] }), _jsx(CardContent, { className: "px-0", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "pl-4", children: "Assets" }), _jsxs(TableHead, { className: "cursor-pointer select-none text-right", onClick: () => handleSort("price"), children: ["Price", _jsx(SortIndicator, { field: "price" })] }), _jsxs(TableHead, { className: "hidden cursor-pointer select-none text-right sm:table-cell", onClick: () => handleSort("volume"), children: ["Volume", _jsx(SortIndicator, { field: "volume" })] }), _jsxs(TableHead, { className: "cursor-pointer select-none text-right", onClick: () => handleSort("change"), children: ["Change", _jsx(SortIndicator, { field: "change" })] }), _jsx(TableHead, { className: "w-10 pr-4" })] }) }), _jsxs(TableBody, { children: [sorted.map((coin) => {
                                        var _a;
                                        const positive = coin.change24h >= 0;
                                        const flash = (_a = flashes[coin.id]) !== null && _a !== void 0 ? _a : null;
                                        return (_jsxs(TableRow, { className: cn("cursor-pointer transition-colors", selectedCoin === coin.id && "bg-muted/60"), onClick: () => onSelectCoin(coin.id), children: [_jsx(TableCell, { className: "pl-4", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Image, { src: coin.logo, alt: coin.name, width: 28, height: 28, className: "size-7 rounded-full" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium leading-tight", children: coin.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: coin.symbol })] })] }) }), _jsx(TableCell, { className: "text-right font-medium tabular-nums", children: _jsxs(motion.span, { initial: flash
                                                            ? { backgroundColor: flash === "up" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)" }
                                                            : undefined, animate: { backgroundColor: "rgba(0,0,0,0)" }, transition: { duration: 0.6 }, className: "rounded px-1", children: ["$", coin.livePrice.toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })] }, coin.livePrice) }), _jsx(TableCell, { className: "hidden text-right tabular-nums text-muted-foreground sm:table-cell", children: compactNumber(coin.liveVolume) }), _jsx(TableCell, { className: "text-right", children: _jsxs("span", { className: cn("inline-flex items-center gap-0.5 text-xs font-medium tabular-nums", positive
                                                            ? "text-emerald-600 dark:text-emerald-400"
                                                            : "text-rose-600 dark:text-rose-400"), children: [positive ? (_jsx(TrendingUpIcon, { className: "size-3" })) : (_jsx(TrendingDownIcon, { className: "size-3" })), positive ? "+" : "", coin.change24h.toFixed(2), "%"] }) }), _jsx(TableCell, { className: "pr-4", onClick: (e) => e.stopPropagation(), children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { render: _jsx(Button, { variant: "ghost", size: "icon-xs" }), children: _jsx(MoreHorizontalIcon, { className: "size-4" }) }), _jsxs(DropdownMenuContent, { side: "bottom", align: "end", children: [_jsx(DropdownMenuItem, { children: "Buy" }), _jsx(DropdownMenuItem, { children: "Sell" }), _jsx(DropdownMenuItem, { onSelect: () => onSelectCoin(coin.id), children: "View Chart" })] })] }) })] }, coin.id));
                                    }), sorted.length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "h-24 text-center text-muted-foreground", children: "No coins match your search." }) }))] })] }) }) })] }));
}
