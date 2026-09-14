"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
const NETWORK_COLORS = {
    mtn: { bg: "#ffcc00", text: "text-black", card: "bg-[#ffcc00] hover:bg-[#f5c200]", pill: "bg-black/10 text-black" },
    telecel: { bg: "#e20010", text: "text-white", card: "bg-[#e20010] hover:bg-[#c9000e]", pill: "bg-white/20 text-white" },
    airteltigo: { bg: "#0033a0", text: "text-white", card: "bg-[#0033a0] hover:bg-[#002b85]", pill: "bg-white/20 text-white" },
};
export function NetworksSection({ networks, bundles }) {
    const [openNetworkId, setOpenNetworkId] = useState(null);
    const router = useRouter();
    const handleNetworkClick = (id) => {
        setOpenNetworkId(prev => prev === id ? null : id);
    };
    const handleBundleClick = (bundle) => {
        router.push(`/buy?bundleId=${bundle.id}`);
    };
    return (_jsx("section", { className: "py-24", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs(motion.div, { className: "text-center mb-16", initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-100px" }, children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold tracking-tight mb-4", children: "Supported Networks" }), _jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto text-lg", children: "We provide instant data top-ups for all major networks in Ghana. Click a network to browse packages." })] }), _jsx("div", { className: "max-w-4xl mx-auto space-y-4", children: networks.map((network, index) => {
                        var _a, _b;
                        const colors = (_a = NETWORK_COLORS[network.id.toLowerCase()]) !== null && _a !== void 0 ? _a : {
                            bg: (_b = network.color) !== null && _b !== void 0 ? _b : "#888",
                            text: "text-white",
                            card: "hover:opacity-90",
                            pill: "bg-white/20 text-white",
                        };
                        const isOpen = openNetworkId === network.id;
                        const networkBundles = bundles
                            .filter(b => b.networkId === network.id)
                            .sort((a, b) => a.sellingPrice - b.sellingPrice);
                        return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-100px" }, transition: { delay: index * 0.1, type: "spring", stiffness: 100 }, children: [_jsxs("button", { onClick: () => handleNetworkClick(network.id), className: cn("w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-200 cursor-pointer", colors.card, colors.text, isOpen && "rounded-b-none"), style: { backgroundColor: isOpen ? undefined : undefined }, children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "size-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner", style: { backgroundColor: "rgba(0,0,0,0.15)" }, children: network.name[0] }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-bold text-lg leading-none", children: network.name }), _jsxs("div", { className: "text-sm opacity-75 mt-0.5 flex items-center gap-1.5", children: [_jsxs("span", { className: "relative flex size-2", children: [_jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-50" }), _jsx("span", { className: "relative inline-flex rounded-full size-2 bg-current" })] }), "Systems Operational \u00B7 ", networkBundles.length, " packages"] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: cn("text-sm font-medium px-3 py-1 rounded-full", colors.pill), children: "Browse packages" }), _jsx(motion.div, { animate: { rotate: isOpen ? 180 : 0 }, transition: { duration: 0.25 }, children: _jsx(ChevronDownIcon, { className: "size-5 opacity-70" }) })] })] }), _jsx(AnimatePresence, { initial: false, children: isOpen && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, className: "overflow-hidden", children: _jsx("div", { className: "rounded-b-2xl p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2", style: { backgroundColor: colors.bg }, children: networkBundles.length === 0 ? (_jsx("p", { className: cn("col-span-4 text-center py-4 text-sm opacity-70", colors.text), children: "No bundles available right now. Check back after a catalog sync." })) : (networkBundles.map((bundle) => (_jsxs(motion.button, { whileHover: { scale: 1.04 }, whileTap: { scale: 0.97 }, onClick: () => handleBundleClick(bundle), className: cn("flex flex-col items-start p-3 rounded-xl cursor-pointer text-left transition-all", colors.text, "bg-black/10 hover:bg-black/20"), children: [_jsx("span", { className: "font-bold text-lg leading-none", children: bundle.dataSize }), _jsx("span", { className: "text-[10px] opacity-70 mt-0.5 mb-2", children: "No Expiry" }), _jsxs("span", { className: "font-semibold text-sm mt-auto", children: ["GHS ", bundle.sellingPrice.toFixed(2)] })] }, bundle.id)))) }) })) })] }, network.id));
                    }) })] }) }));
}
