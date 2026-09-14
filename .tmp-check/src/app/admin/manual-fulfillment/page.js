import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getBundles } from "@/lib/bundles";
import { getNetworks } from "@/lib/networks";
import { ManualFulfillmentClient } from "./client";
export const dynamic = "force-dynamic";
export default async function ManualFulfillmentPage() {
    const networks = await getNetworks();
    const activeNetworks = networks.filter((n) => n.active);
    const allBundles = await getBundles(); // Already filters by active and providerAvailable
    return (_jsxs("div", { className: "flex flex-col gap-6 p-6 max-w-3xl", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Manual Fulfillment" }), _jsx("p", { className: "text-muted-foreground", children: "Manually trigger a DataMart fulfillment for a customer without requiring a payment flow." })] }), _jsx(ManualFulfillmentClient, { networks: activeNetworks, bundles: allBundles })] }));
}
