import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionJwt } from "@/lib/auth-verify";
export default async function AdminLayout({ children }) {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");
    if (!(session === null || session === void 0 ? void 0 : session.value)) {
        redirect("/sign-in");
    }
    const user = await verifySessionJwt(session.value);
    if (!user) {
        redirect("/sign-in");
    }
    return (_jsxs(SidebarProvider, { children: [_jsx(AppSidebar, {}), _jsxs(SidebarInset, { children: [_jsxs("header", { className: "flex h-16 shrink-0 items-center gap-2", children: [_jsxs("div", { className: "flex items-center gap-2 px-4", children: [_jsx(SidebarTrigger, { className: "-ml-1" }), _jsx(Separator, { orientation: "vertical", className: "mr-2 h-4" }), _jsx(DynamicBreadcrumb, {})] }), _jsxs("div", { className: "ml-auto flex items-center gap-2 pr-4", children: [_jsxs("kbd", { className: "pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground sm:flex", children: [_jsx("span", { className: "text-xs", children: "\u2318" }), "K"] }), _jsx(ThemeToggle, {})] })] }), _jsx(CommandPalette, {}), _jsx("main", { className: "flex flex-1 flex-col", children: children })] })] }));
}
