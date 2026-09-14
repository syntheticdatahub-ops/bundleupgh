"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { cardsData } from "@/data/seed";
import { InteractiveCard } from "@/components/cards/interactive-card";
import { CardControls } from "@/components/cards/card-controls";
import { VirtualCardGenerator } from "@/components/cards/virtual-card-generator";
import { CardList } from "@/components/cards/card-list";
export function CardsPageClient() {
    var _a, _b, _c, _d;
    const [cards, setCards] = useState(cardsData);
    const [activeCardId, setActiveCardId] = useState(cardsData[0].id);
    const [frozenMap, setFrozenMap] = useState(() => {
        const map = {};
        for (const c of cardsData) {
            map[c.id] = c.frozen;
        }
        return map;
    });
    const [dailyLimits, setDailyLimits] = useState(() => {
        const map = {};
        for (const c of cardsData) {
            map[c.id] = c.dailyLimit;
        }
        return map;
    });
    const activeCard = (_a = cards.find((c) => c.id === activeCardId)) !== null && _a !== void 0 ? _a : cards[0];
    const toggleFreeze = useCallback(() => {
        setFrozenMap((prev) => (Object.assign(Object.assign({}, prev), { [activeCardId]: !prev[activeCardId] })));
    }, [activeCardId]);
    const handleDailyLimitChange = useCallback((val) => {
        setDailyLimits((prev) => (Object.assign(Object.assign({}, prev), { [activeCardId]: val })));
    }, [activeCardId]);
    const handleCardCreated = useCallback((card) => {
        setCards((prev) => [...prev, card]);
        setFrozenMap((prev) => (Object.assign(Object.assign({}, prev), { [card.id]: false })));
        setDailyLimits((prev) => (Object.assign(Object.assign({}, prev), { [card.id]: card.dailyLimit })));
    }, []);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 lg:grid-cols-12", children: [_jsx("div", { className: "flex items-start justify-center lg:col-span-7", children: _jsx(InteractiveCard, { card: activeCard, frozen: (_b = frozenMap[activeCardId]) !== null && _b !== void 0 ? _b : false }) }), _jsx("div", { className: "lg:col-span-5", children: _jsx(CardControls, { card: activeCard, frozen: (_c = frozenMap[activeCardId]) !== null && _c !== void 0 ? _c : false, onToggleFreeze: toggleFreeze, dailyLimit: (_d = dailyLimits[activeCardId]) !== null && _d !== void 0 ? _d : activeCard.dailyLimit, onDailyLimitChange: handleDailyLimitChange }) })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-12", children: [_jsx("div", { className: "lg:col-span-4", children: _jsx(VirtualCardGenerator, { onCardCreated: handleCardCreated }) }), _jsx("div", { className: "lg:col-span-8", children: _jsx(CardList, { cards: cards, activeCardId: activeCardId, onSelect: setActiveCardId, frozenMap: frozenMap }) })] })] }));
}
