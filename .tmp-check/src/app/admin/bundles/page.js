import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AdminBundlesTable } from "@/components/admin/bundles-table";
import { getAllBundles } from "@/lib/bundles";
import { getNetworks } from "@/lib/networks";
import { SyncBundlesButton } from "@/components/admin/sync-bundles-button";
export const dynamic = "force-dynamic";
export default async function AdminBundlesPage() {
    const bundles = await getAllBundles();
    const networks = await getNetworks();
    return (_jsxs("div", { className: "flex flex-col gap-6 p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Bundles" }), _jsx("p", { className: "text-muted-foreground", children: "Manage data plans and pricing." })] }), _jsx(SyncBundlesButton, {})] }), _jsx(AdminBundlesTable, { bundles: bundles, networks: networks })] }));
}
