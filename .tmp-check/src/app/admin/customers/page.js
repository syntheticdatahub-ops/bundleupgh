import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AdminCustomersTable } from "@/components/admin/customers-table";
import { getCustomerCount, getCustomerPageRows } from "@/lib/customers";
import { getSuccessfulOrdersCount } from "@/lib/orders";
export const dynamic = "force-dynamic";
export default async function AdminCustomersPage({ searchParams, }) {
    var _a;
    const resolvedParams = await Promise.resolve(searchParams !== null && searchParams !== void 0 ? searchParams : {});
    const requestedPage = Number((_a = resolvedParams.page) !== null && _a !== void 0 ? _a : "1");
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const cursor = typeof resolvedParams.cursor === "string" ? resolvedParams.cursor : null;
    const totalCustomers = await getCustomerCount();
    const totalOrders = await getSuccessfulOrdersCount();
    const { customers: pageRows, hasNextPage, nextCursor } = await getCustomerPageRows({
        page,
        pageSize: 25,
        cursor,
    });
    return (_jsxs("div", { className: "flex flex-col gap-6 p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Customers" }), _jsx("p", { className: "text-muted-foreground", children: "Accounts built from phone-number purchase history." })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm bg-muted/40 border px-4 py-2 rounded-lg", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-muted-foreground text-xs", children: "Total Customers" }), _jsx("span", { className: "font-bold", children: totalCustomers })] }), _jsx("div", { className: "w-px h-8 bg-border" }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-muted-foreground text-xs", children: "Total Orders" }), _jsx("span", { className: "font-bold", children: totalOrders })] })] })] }), _jsx(AdminCustomersTable, { customers: pageRows, currentPage: page, hasNextPage: hasNextPage, nextCursor: nextCursor })] }));
}
