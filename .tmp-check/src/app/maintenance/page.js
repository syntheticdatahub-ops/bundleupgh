import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { redirect } from "next/navigation";
import { getMaintenanceState } from "@/lib/maintenance";
export const dynamic = "force-dynamic";
export default async function MaintenancePage() {
    const state = await getMaintenanceState();
    if (!state.enabled) {
        redirect("/");
    }
    return (_jsx("main", { className: "flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground", children: _jsxs("div", { className: "w-full max-w-xl rounded-2xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur-sm", children: [_jsx("div", { className: "mb-6 flex justify-center", children: _jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground", children: "P" }) }), _jsxs("div", { className: "space-y-4 text-center", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground", children: "Play Ato" }), _jsx("h1", { className: "text-3xl font-semibold tracking-tight sm:text-4xl", children: "Temporarily unavailable" }), _jsx("p", { className: "text-base leading-7 text-muted-foreground sm:text-lg", children: state.message })] })] }) }));
}
