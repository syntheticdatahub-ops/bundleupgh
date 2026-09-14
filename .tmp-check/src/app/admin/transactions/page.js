import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AdminTransactionsTable } from "@/components/admin/transactions-table";
import { getOrdersPage } from "@/lib/orders";
export const dynamic = "force-dynamic";
export default async function AdminTransactionsPage({ searchParams, }) {
    var _a;
    const resolvedParams = await Promise.resolve(searchParams !== null && searchParams !== void 0 ? searchParams : {});
    const requestedPage = Number((_a = resolvedParams.page) !== null && _a !== void 0 ? _a : "1");
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const cursor = typeof resolvedParams.cursor === "string" ? resolvedParams.cursor : null;
    const { orders, hasNextPage, nextCursor } = await getOrdersPage({
        page,
        pageSize: 25,
        cursor,
    });
    return (_jsxs("div", { className: "flex flex-col gap-6 p-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Transactions" }), _jsx("p", { className: "text-muted-foreground", children: "Payment records linked to orders." })] }), _jsx(AdminTransactionsTable, { orders: orders, currentPage: page, hasNextPage: hasNextPage, nextCursor: nextCursor })] }));
}
