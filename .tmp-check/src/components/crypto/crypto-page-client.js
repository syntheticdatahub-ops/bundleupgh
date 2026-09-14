"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import { MyBalance } from "@/components/crypto/my-balance";
import { TopCoins } from "@/components/crypto/top-coins";
import { MyPortfolio } from "@/components/crypto/my-portfolio";
import { CoinInsight } from "@/components/crypto/coin-insight";
import { TradeForm } from "@/components/crypto/trade-form";
import { MarketOverview } from "@/components/crypto/market-overview";
import { cryptoCoins } from "@/data/seed";
export function CryptoPageClient() {
    const [selectedCoin, setSelectedCoin] = React.useState("btc");
    // Build initial prices from seed data
    const [prices, setPrices] = React.useState(() => {
        const initial = {};
        for (const coin of cryptoCoins) {
            initial[coin.id] = coin.price;
        }
        return initial;
    });
    // Store original prices for 24h change calculation
    const originalPrices = React.useMemo(() => {
        const orig = {};
        for (const coin of cryptoCoins) {
            orig[coin.id] = coin.price;
        }
        return orig;
    }, []);
    // Simulate live price drift every 3 seconds
    React.useEffect(() => {
        const interval = setInterval(() => {
            setPrices((prev) => {
                const next = Object.assign({}, prev);
                for (const id of Object.keys(next)) {
                    // Drift +/- 0.3%
                    const drift = 1 + (Math.random() - 0.5) * 0.006;
                    next[id] = Math.round(next[id] * drift * 100) / 100;
                }
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return (_jsxs("div", { className: "grid gap-4 px-4 pb-6 lg:grid-cols-12", children: [_jsx(MyBalance, { prices: prices }), _jsx(TopCoins, { prices: prices, originalPrices: originalPrices, selectedCoin: selectedCoin, onSelectCoin: setSelectedCoin }), _jsx(MyPortfolio, { prices: prices, originalPrices: originalPrices, selectedCoin: selectedCoin, onSelectCoin: setSelectedCoin }), _jsx(CoinInsight, { prices: prices, selectedCoin: selectedCoin }), _jsx(TradeForm, { prices: prices }), _jsx(MarketOverview, { prices: prices, originalPrices: originalPrices, selectedCoin: selectedCoin, onSelectCoin: setSelectedCoin })] }));
}
