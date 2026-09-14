import { fsQuery, fsGet, fsAdd, fsUpdate } from "./firestore-rest";
import { generatePhoneVariants } from "./phone";
import { decodeCursor as decodeCursorToken, decodeCursorState, encodeCursor as encodeCursorToken, encodeCursorState } from "./pagination";
function generateReference() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "BU-";
    for (let i = 0; i < 6; i++)
        ref += chars[Math.floor(Math.random() * chars.length)];
    return ref;
}
export async function getOrderById(id) {
    var _a;
    const doc = await fsGet("orders", id);
    return (_a = doc) !== null && _a !== void 0 ? _a : null;
}
export async function getOrderByReference(reference) {
    var _a;
    // Indexed path only. We intentionally do NOT fall back to a full getOrders()
    // scan on a miss: a single-document lookup must never escalate into reading
    // the entire /orders collection (Phase 1 audit fix).
    const docs = await fsQuery("orders", [{ field: "publicReference", op: "EQUAL", value: reference }]);
    return (_a = docs[0]) !== null && _a !== void 0 ? _a : null;
}
export async function getOrderByPublicReference(reference) {
    return getOrderByReference(reference);
}
export function extractPublicReferenceFromPaystackReference(reference) {
    if (!reference)
        return null;
    const trimmed = reference.trim();
    const suffixIndex = trimmed.lastIndexOf("-");
    if (suffixIndex <= 4)
        return null;
    const candidate = trimmed.slice(4, suffixIndex);
    return candidate.startsWith("BU-") || candidate.startsWith("PAY-") ? candidate.replace(/^PAY-/, "") : candidate;
}
export async function getOrderByProviderReference(providerReference) {
    var _a, _b;
    const docs = await fsQuery("orders", [{ field: "paymentReference", op: "EQUAL", value: providerReference }]);
    const match = (_a = docs[0]) !== null && _a !== void 0 ? _a : null;
    if (match)
        return match;
    // Fallback to legacy field
    const fallbackDocs = await fsQuery("orders", [{ field: "providerReference", op: "EQUAL", value: providerReference }]);
    const fallbackMatchDoc = (_b = fallbackDocs[0]) !== null && _b !== void 0 ? _b : null;
    if (fallbackMatchDoc)
        return fallbackMatchDoc;
    const derivedPublicReference = extractPublicReferenceFromPaystackReference(providerReference);
    if (derivedPublicReference) {
        const orderByPublicReference = await getOrderByPublicReference(derivedPublicReference);
        if (orderByPublicReference)
            return orderByPublicReference;
    }
    // Removed full getOrders() fallback (Phase 1 audit fix): a payment/webhook
    // lookup that misses must return null rather than scan the entire collection.
    return null;
}
export async function getOrderByFulfillmentProviderReference(reference) {
    var _a;
    const docs = await fsQuery("orders", [{ field: "fulfillmentProviderReference", op: "EQUAL", value: reference }]);
    // Removed full getOrders() fallback (Phase 1 audit fix): a DataMart webhook
    // lookup that misses returns null (the caller stores the event and moves on)
    // instead of scanning the entire /orders collection.
    return (_a = docs[0]) !== null && _a !== void 0 ? _a : null;
}
export const DEFAULT_ADMIN_PAGE_SIZE = 25;
export function encodeCursor(doc) {
    return encodeCursorToken(doc, "orders");
}
export function decodeCursor(token) {
    return decodeCursorToken(token, "orders");
}
export { encodeCursorState, decodeCursorState };
export async function getOrders() {
    const docs = await fsQuery("orders", [], { field: "createdAt", direction: "DESCENDING" });
    return docs;
}
export async function getRecentOrders(limit = 10) {
    const docs = await fsQuery("orders", [], { field: "createdAt", direction: "DESCENDING" }, limit);
    return docs;
}
export async function getOperationalOrders(limit = 200) {
    const docs = await fsQuery("orders", [{ field: "paymentStatus", op: "IN", value: ["SUCCESS", "PAID", "NOT_APPLICABLE"] }], { field: "createdAt", direction: "DESCENDING" }, limit);
    return docs;
}
export async function getOperationalOrderMetrics() {
    const { fsCount, fsAggregateSum } = await import("./firestore-rest");
    const operationalFilter = [{ field: "paymentStatus", op: "IN", value: ["SUCCESS", "PAID", "NOT_APPLICABLE"] }];
    const [totalOrders, deliveredOrders, pendingOrders, failedOrders, totalRevenue, estimatedProfit] = await Promise.all([
        fsCount("orders", operationalFilter),
        fsCount("orders", [{ field: "fulfillmentStatus", op: "IN", value: ["SUCCESS", "DELIVERED"] }]),
        fsCount("orders", [{ field: "fulfillmentStatus", op: "IN", value: ["PROCESSING", "ON_HOLD", "PENDING"] }]),
        fsCount("orders", [{ field: "fulfillmentStatus", op: "IN", value: ["FAILED", "REFUND_PENDING", "REFUNDED"] }]),
        fsAggregateSum("orders", "sellingPriceSnapshot", operationalFilter),
        fsAggregateSum("orders", "profitSnapshot", operationalFilter),
    ]);
    return {
        totalOrders,
        totalRevenue,
        deliveredOrders,
        pendingOrders,
        failedOrders,
        estimatedProfit,
    };
}
export async function getNetworkBreakdownStats(networks) {
    const { fsCount, fsAggregateSum } = await import("./firestore-rest");
    const operationalFilter = [{ field: "paymentStatus", op: "IN", value: ["SUCCESS", "PAID", "NOT_APPLICABLE"] }];
    const stats = await Promise.all(networks.map(async (net) => {
        const networkFilter = [...operationalFilter, { field: "networkId", op: "EQUAL", value: net.id }];
        const [orders, revenue] = await Promise.all([
            fsCount("orders", networkFilter),
            fsAggregateSum("orders", "sellingPriceSnapshot", networkFilter),
        ]);
        return {
            network: net.name,
            color: net.color,
            orders,
            revenue,
        };
    }));
    return stats.sort((a, b) => b.orders - a.orders);
}
export async function getOrdersPage({ page = 1, pageSize = DEFAULT_ADMIN_PAGE_SIZE, cursor, }) {
    var _a, _b;
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_ADMIN_PAGE_SIZE);
    const cursorChain = decodeCursorState(cursor);
    const activeCursorToken = safePage > 1 ? (_a = cursorChain[safePage - 2]) !== null && _a !== void 0 ? _a : null : null;
    const decodedCursor = activeCursorToken ? decodeCursor(activeCursorToken) : null;
    const orderBy = [
        { field: "createdAt", direction: "DESCENDING" },
        { field: "__name__", direction: "DESCENDING" },
    ];
    const docs = await fsQuery("orders", [], orderBy, safePageSize + 1, decodedCursor
        ? {
            values: [decodedCursor.createdAt, { referenceValue: decodedCursor.docPath }],
            mode: "startAfter",
        }
        : undefined);
    const orders = (_b = docs.slice(0, safePageSize)) !== null && _b !== void 0 ? _b : [];
    const hasNextPage = docs.length > safePageSize;
    return {
        orders,
        hasNextPage,
        page: safePage,
        pageSize: safePageSize,
        nextCursor: hasNextPage && orders.length > 0 ? encodeCursor(orders[orders.length - 1]) : undefined,
    };
}
/**
 * Look up orders by recipient phone across every stored phone representation.
 *
 * Orders are created with whatever phone format the customer submitted
 * (e.g. "024...", "+233...", "233..." or "9..."), and manual fulfillment
 * normalizes to the local format. The same logical number can therefore be
 * stored under several distinct string representations, so we generate the
 * unique variant set and query ONLY each distinct value, merging by document id.
 * This guarantees a single lookup never issues a duplicate Firestore query for
 * the same effective phone number, and avoids the over-broad whole-collection
 * scan approach.
 */
export async function findOrdersByRecipientPhone(rawPhone) {
    const variants = Array.from(new Set(generatePhoneVariants(rawPhone)));
    const seen = new Set();
    const allOrders = [];
    for (const variant of variants) {
        const docs = await fsQuery("orders", [{ field: "recipientPhone", op: "EQUAL", value: variant }]);
        for (const doc of docs) {
            if (!seen.has(doc.id)) {
                seen.add(doc.id);
                allOrders.push(doc);
            }
        }
    }
    return allOrders;
}
export async function createOrder(data) {
    const publicReference = generateReference();
    const doc = await fsAdd("orders", Object.assign(Object.assign({}, data), { publicReference }));
    return doc;
}
export async function updateOrderStatus(orderId, paymentStatus, fulfillmentStatus) {
    await fsUpdate("orders", orderId, { paymentStatus, fulfillmentStatus });
}
export async function getPaymentByOrderId(orderId) {
    var _a;
    const docs = await fsQuery("payments", [{ field: "orderId", op: "EQUAL", value: orderId }]);
    return (_a = docs[0]) !== null && _a !== void 0 ? _a : null;
}
export async function getSuccessfulOrdersCount() {
    const { fsCount } = await import("./firestore-rest");
    return fsCount("orders", [
        { field: "fulfillmentStatus", op: "EQUAL", value: "SUCCESS" },
        { field: "fulfillmentStatus", op: "EQUAL", value: "DELIVERED" },
    ], "OR");
}
export async function createPayment(data) {
    const doc = await fsAdd("payments", data);
    return doc;
}
