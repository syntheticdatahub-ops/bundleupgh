import { fsQuery, fsAdd, fsCount } from "./firestore-rest";
import { findOrdersByRecipientPhone } from "./orders";
import { decodeCursor as decodeCursorToken, decodeCursorState, encodeCursor as encodeCursorToken, encodeCursorState } from "./pagination";
export const DEFAULT_CUSTOMER_PAGE_SIZE = 25;
export function encodeCursor(doc) {
    return encodeCursorToken(doc, "customers");
}
export function decodeCursor(token) {
    return decodeCursorToken(token, "customers");
}
export { encodeCursorState, decodeCursorState };
export async function getCustomers() {
    const docs = await fsQuery("customers", [], { field: "createdAt", direction: "DESCENDING" });
    return docs;
}
export async function getCustomerCount() {
    return fsCount("customers");
}
export async function getCustomersPage({ page = 1, pageSize = DEFAULT_CUSTOMER_PAGE_SIZE, cursor, }) {
    var _a, _b;
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_CUSTOMER_PAGE_SIZE);
    const cursorChain = decodeCursorState(cursor);
    const activeCursorToken = safePage > 1 ? (_a = cursorChain[safePage - 2]) !== null && _a !== void 0 ? _a : null : null;
    const decodedCursor = activeCursorToken ? decodeCursor(activeCursorToken) : null;
    const orderBy = [
        { field: "createdAt", direction: "DESCENDING" },
        { field: "__name__", direction: "DESCENDING" },
    ];
    const docs = await fsQuery("customers", [], orderBy, safePageSize + 1, decodedCursor
        ? {
            values: [decodedCursor.createdAt, { referenceValue: decodedCursor.docPath }],
            mode: "startAfter",
        }
        : undefined);
    const customers = (_b = docs.slice(0, safePageSize)) !== null && _b !== void 0 ? _b : [];
    const hasNextPage = docs.length > safePageSize;
    return {
        customers,
        hasNextPage,
        page: safePage,
        pageSize: safePageSize,
        nextCursor: hasNextPage && customers.length > 0 ? encodeCursor(customers[customers.length - 1]) : undefined,
    };
}
export async function getCustomerPageRows({ page = 1, pageSize = DEFAULT_CUSTOMER_PAGE_SIZE, cursor, }) {
    const { customers, hasNextPage, page: safePage, pageSize: safePageSize, nextCursor } = await getCustomersPage({
        page,
        pageSize,
        cursor,
    });
    const rows = await Promise.all(customers.map(async (customer) => {
        var _a;
        const customerOrders = await findOrdersByRecipientPhone(customer.phone);
        const ordered = [...customerOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const successfulOrders = ordered.filter((o) => {
            const fs = (o.fulfillmentStatus || "").toUpperCase();
            return fs === "SUCCESS" || fs === "DELIVERED";
        });
        const cPhoneLocal = customer.phone.replace(/\D/g, "");
        const displayPhone = cPhoneLocal.length === 10 ? `+233 ${cPhoneLocal.slice(1).replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}` : customer.phone;
        return Object.assign(Object.assign({}, customer), { totalOrders: successfulOrders.length, totalSpent: successfulOrders.reduce((sum, o) => sum + (o.sellingPriceSnapshot || 0), 0), lastNetworkId: ((_a = ordered[0]) === null || _a === void 0 ? void 0 : _a.networkId) || "Unknown", lastOrderDate: ordered[0] ? new Date(ordered[0].createdAt).toLocaleDateString() : "Never", lastOrderTimestamp: ordered[0] ? new Date(ordered[0].createdAt).getTime() : 0, status: successfulOrders.length > 0 ? "active" : "inactive", displayPhone });
    }));
    return {
        customers: rows.sort((a, b) => b.lastOrderTimestamp - a.lastOrderTimestamp),
        hasNextPage,
        page: safePage,
        pageSize: safePageSize,
        nextCursor,
    };
}
export async function getCustomerByPhone(phone) {
    var _a;
    const docs = await fsQuery("customers", [{ field: "phone", op: "EQUAL", value: phone }]);
    return (_a = docs[0]) !== null && _a !== void 0 ? _a : null;
}
export async function createOrUpdateCustomer(phone) {
    const existing = await getCustomerByPhone(phone);
    if (existing)
        return existing;
    const doc = await fsAdd("customers", {
        phone,
    });
    return doc;
}
