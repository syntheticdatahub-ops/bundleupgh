"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCursorState = exports.encodeCursorState = exports.DEFAULT_ADMIN_PAGE_SIZE = void 0;
exports.getOrderById = getOrderById;
exports.getOrderByReference = getOrderByReference;
exports.getOrderByPublicReference = getOrderByPublicReference;
exports.extractPublicReferenceFromPaystackReference = extractPublicReferenceFromPaystackReference;
exports.getOrderByProviderReference = getOrderByProviderReference;
exports.getOrderByFulfillmentProviderReference = getOrderByFulfillmentProviderReference;
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
exports.getOrders = getOrders;
exports.getRecentOrders = getRecentOrders;
exports.getOperationalOrders = getOperationalOrders;
exports.getOperationalOrderMetrics = getOperationalOrderMetrics;
exports.getNetworkBreakdownStats = getNetworkBreakdownStats;
exports.getOrdersPage = getOrdersPage;
exports.findOrdersByRecipientPhone = findOrdersByRecipientPhone;
exports.createOrder = createOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.getPaymentByOrderId = getPaymentByOrderId;
exports.getSuccessfulOrdersCount = getSuccessfulOrdersCount;
exports.createPayment = createPayment;
const firestore_rest_1 = require("./firestore-rest");
const phone_1 = require("./phone");
const pagination_1 = require("./pagination");
Object.defineProperty(exports, "decodeCursorState", { enumerable: true, get: function () { return pagination_1.decodeCursorState; } });
Object.defineProperty(exports, "encodeCursorState", { enumerable: true, get: function () { return pagination_1.encodeCursorState; } });
function generateReference() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "BU-";
    for (let i = 0; i < 6; i++)
        ref += chars[Math.floor(Math.random() * chars.length)];
    return ref;
}
async function getOrderById(id) {
    const doc = await (0, firestore_rest_1.fsGet)("orders", id);
    return doc ?? null;
}
async function getOrderByReference(reference) {
    // Indexed path only. We intentionally do NOT fall back to a full getOrders()
    // scan on a miss: a single-document lookup must never escalate into reading
    // the entire /orders collection (Phase 1 audit fix).
    const docs = await (0, firestore_rest_1.fsQuery)("orders", [{ field: "publicReference", op: "EQUAL", value: reference }]);
    return docs[0] ?? null;
}
async function getOrderByPublicReference(reference) {
    return getOrderByReference(reference);
}
function extractPublicReferenceFromPaystackReference(reference) {
    if (!reference)
        return null;
    const trimmed = reference.trim();
    const suffixIndex = trimmed.lastIndexOf("-");
    if (suffixIndex <= 4)
        return null;
    const candidate = trimmed.slice(4, suffixIndex);
    return candidate.startsWith("BU-") || candidate.startsWith("PAY-") ? candidate.replace(/^PAY-/, "") : candidate;
}
async function getOrderByProviderReference(providerReference) {
    const docs = await (0, firestore_rest_1.fsQuery)("orders", [{ field: "paymentReference", op: "EQUAL", value: providerReference }]);
    const match = docs[0] ?? null;
    if (match)
        return match;
    // Fallback to legacy field
    const fallbackDocs = await (0, firestore_rest_1.fsQuery)("orders", [{ field: "providerReference", op: "EQUAL", value: providerReference }]);
    const fallbackMatchDoc = fallbackDocs[0] ?? null;
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
async function getOrderByFulfillmentProviderReference(reference) {
    const docs = await (0, firestore_rest_1.fsQuery)("orders", [{ field: "fulfillmentProviderReference", op: "EQUAL", value: reference }]);
    // Removed full getOrders() fallback (Phase 1 audit fix): a DataMart webhook
    // lookup that misses returns null (the caller stores the event and moves on)
    // instead of scanning the entire /orders collection.
    return docs[0] ?? null;
}
exports.DEFAULT_ADMIN_PAGE_SIZE = 25;
function encodeCursor(doc) {
    return (0, pagination_1.encodeCursor)(doc, "orders");
}
function decodeCursor(token) {
    return (0, pagination_1.decodeCursor)(token, "orders");
}
async function getOrders() {
    const docs = await (0, firestore_rest_1.fsQuery)("orders", [], { field: "createdAt", direction: "DESCENDING" });
    return docs;
}
async function getRecentOrders(limit = 10) {
    const docs = await (0, firestore_rest_1.fsQuery)("orders", [], { field: "createdAt", direction: "DESCENDING" }, limit);
    return docs;
}
async function getOperationalOrders(limit = 200) {
    const docs = await (0, firestore_rest_1.fsQuery)("orders", [{ field: "paymentStatus", op: "IN", value: ["SUCCESS", "PAID", "NOT_APPLICABLE"] }], { field: "createdAt", direction: "DESCENDING" }, limit);
    return docs;
}
async function getOperationalOrderMetrics() {
    const { fsCount, fsAggregateSum } = await Promise.resolve().then(() => __importStar(require("./firestore-rest")));
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
async function getNetworkBreakdownStats(networks) {
    const { fsCount, fsAggregateSum } = await Promise.resolve().then(() => __importStar(require("./firestore-rest")));
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
async function getOrdersPage({ page = 1, pageSize = exports.DEFAULT_ADMIN_PAGE_SIZE, cursor, }) {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.max(1, Number(pageSize) || exports.DEFAULT_ADMIN_PAGE_SIZE);
    const cursorChain = (0, pagination_1.decodeCursorState)(cursor);
    const activeCursorToken = safePage > 1 ? cursorChain[safePage - 2] ?? null : null;
    const decodedCursor = activeCursorToken ? decodeCursor(activeCursorToken) : null;
    const orderBy = [
        { field: "createdAt", direction: "DESCENDING" },
        { field: "__name__", direction: "DESCENDING" },
    ];
    const docs = await (0, firestore_rest_1.fsQuery)("orders", [], orderBy, safePageSize + 1, decodedCursor
        ? {
            values: [decodedCursor.createdAt, { referenceValue: decodedCursor.docPath }],
            mode: "startAfter",
        }
        : undefined);
    const orders = docs.slice(0, safePageSize) ?? [];
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
async function findOrdersByRecipientPhone(rawPhone) {
    const variants = Array.from(new Set((0, phone_1.generatePhoneVariants)(rawPhone)));
    const seen = new Set();
    const allOrders = [];
    for (const variant of variants) {
        const docs = await (0, firestore_rest_1.fsQuery)("orders", [{ field: "recipientPhone", op: "EQUAL", value: variant }]);
        for (const doc of docs) {
            if (!seen.has(doc.id)) {
                seen.add(doc.id);
                allOrders.push(doc);
            }
        }
    }
    return allOrders;
}
async function createOrder(data) {
    const publicReference = generateReference();
    const doc = await (0, firestore_rest_1.fsAdd)("orders", {
        ...data,
        publicReference,
    });
    return doc;
}
async function updateOrderStatus(orderId, paymentStatus, fulfillmentStatus) {
    await (0, firestore_rest_1.fsUpdate)("orders", orderId, { paymentStatus, fulfillmentStatus });
}
async function getPaymentByOrderId(orderId) {
    const docs = await (0, firestore_rest_1.fsQuery)("payments", [{ field: "orderId", op: "EQUAL", value: orderId }]);
    return docs[0] ?? null;
}
async function getSuccessfulOrdersCount() {
    const { fsCount } = await Promise.resolve().then(() => __importStar(require("./firestore-rest")));
    return fsCount("orders", [
        { field: "fulfillmentStatus", op: "EQUAL", value: "SUCCESS" },
        { field: "fulfillmentStatus", op: "EQUAL", value: "DELIVERED" },
    ], "OR");
}
async function createPayment(data) {
    const doc = await (0, firestore_rest_1.fsAdd)("payments", data);
    return doc;
}
