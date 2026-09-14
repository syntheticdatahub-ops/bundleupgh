import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";
import { SupportWidget } from "@/components/support/support-widget";
import { redirect } from "next/navigation";
import { getMaintenanceState } from "@/lib/maintenance";
export const dynamic = "force-dynamic";
export default async function PublicLayout({ children }) {
    const state = await getMaintenanceState();
    if (state.enabled) {
        redirect("/maintenance");
    }
    return (_jsxs("div", { className: "flex min-h-svh flex-col", children: [_jsx(PublicNavbar, {}), _jsx("main", { className: "flex-1", children: children }), _jsx(PublicFooter, {}), _jsx(SupportWidget, {})] }));
}
