import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from "react";
import { BuyFlow } from "@/components/buy/buy-flow";
import { getNetworks } from "@/lib/networks";
import { getBundles } from "@/lib/bundles";
import { GlobeBackground } from "@/components/buy/globe-background";
export const dynamic = "force-dynamic";
export default async function BuyPage() {
    const networks = await getNetworks();
    const bundles = await getBundles();
    return (_jsxs("div", { className: "relative bg-muted/10 min-h-svh overflow-hidden", children: [_jsx(GlobeBackground, {}), _jsx(Suspense, { fallback: _jsx("div", { className: "p-12 text-center text-muted-foreground", children: "Loading..." }), children: _jsx(BuyFlow, { initialNetworks: networks, initialBundles: bundles }) })] }));
}
