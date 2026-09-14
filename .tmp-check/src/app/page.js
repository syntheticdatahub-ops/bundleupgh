import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { HeroSection } from "@/components/public/hero-section";
import { HowItWorks } from "@/components/public/how-it-works";
import { NetworksSection } from "@/components/public/networks-section";
import { SupportWidget } from "@/components/support/support-widget";
import { getBundles } from "@/lib/bundles";
import { getNetworks } from "@/lib/networks";
import { redirect } from "next/navigation";
import { getMaintenanceState } from "@/lib/maintenance";
export const dynamic = "force-dynamic";
export default async function HomePage() {
    const maintenance = await getMaintenanceState();
    if (maintenance.enabled) {
        redirect("/maintenance");
    }
    const [networks, bundles] = await Promise.all([getNetworks(), getBundles()]);
    const activeNetworks = networks.filter((n) => n.active);
    return (_jsxs("div", { className: "flex min-h-svh flex-col", children: [_jsx(PublicNavbar, {}), _jsxs("main", { className: "flex-1", children: [_jsx(HeroSection, {}), _jsx(HowItWorks, {}), _jsx(NetworksSection, { networks: activeNetworks, bundles: bundles })] }), _jsx(PublicFooter, {}), _jsx(SupportWidget, {})] }));
}
