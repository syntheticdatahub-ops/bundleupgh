import { fsQuery, fsGet, fsAdd, fsUpdate } from "./firestore-rest";
import { generatePhoneVariants } from "./phone";
import type { Order, Payment } from "@/types/domain";

function generateReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "BU-";
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const doc = await fsGet("orders", id);
  return (doc as Order) ?? null;
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  // Indexed path only. We intentionally do NOT fall back to a full getOrders()
  // scan on a miss: a single-document lookup must never escalate into reading
  // the entire /orders collection (Phase 1 audit fix).
  const docs = await fsQuery(
    "orders",
    [{ field: "publicReference", op: "EQUAL", value: reference }]
  );

  return (docs[0] as Order) ?? null;
}

export async function getOrderByPublicReference(reference: string): Promise<Order | null> {
  return getOrderByReference(reference);
}

export function extractPublicReferenceFromPaystackReference(reference: string): string | null {
  if (!reference) return null;

  const trimmed = reference.trim();
  const suffixIndex = trimmed.lastIndexOf("-");
  if (suffixIndex <= 4) return null;

  const candidate = trimmed.slice(4, suffixIndex);
  return candidate.startsWith("BU-") || candidate.startsWith("PAY-") ? candidate.replace(/^PAY-/, "") : candidate;
}

export async function getOrderByProviderReference(providerReference: string): Promise<Order | null> {
  const docs = await fsQuery(
    "orders",
    [{ field: "paymentReference", op: "EQUAL", value: providerReference }]
  );

  const match = (docs[0] as Order) ?? null;
  if (match) return match;

  // Fallback to legacy field
  const fallbackDocs = await fsQuery(
    "orders",
    [{ field: "providerReference", op: "EQUAL", value: providerReference }]
  );
  
  const fallbackMatchDoc = (fallbackDocs[0] as Order) ?? null;
  if (fallbackMatchDoc) return fallbackMatchDoc;

  const derivedPublicReference = extractPublicReferenceFromPaystackReference(providerReference);
  if (derivedPublicReference) {
    const orderByPublicReference = await getOrderByPublicReference(derivedPublicReference);
    if (orderByPublicReference) return orderByPublicReference;
  }

  // Removed full getOrders() fallback (Phase 1 audit fix): a payment/webhook
  // lookup that misses must return null rather than scan the entire collection.
  return null;
}

export async function getOrderByFulfillmentProviderReference(reference: string): Promise<Order | null> {
  const docs = await fsQuery(
    "orders",
    [{ field: "fulfillmentProviderReference", op: "EQUAL", value: reference }]
  );

  // Removed full getOrders() fallback (Phase 1 audit fix): a DataMart webhook
  // lookup that misses returns null (the caller stores the event and moves on)
  // instead of scanning the entire /orders collection.
  return (docs[0] as Order) ?? null;
}

export const DEFAULT_ADMIN_PAGE_SIZE = 25;

export function encodeCursor(doc: Pick<Order, "id" | "createdAt">): string {
  return Buffer.from(JSON.stringify({ id: doc.id, createdAt: doc.createdAt })).toString("base64");
}

export function decodeCursor(token: string): { id: string; createdAt: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    if (!decoded || typeof decoded.id !== "string" || typeof decoded.createdAt !== "string") return null;
    return { id: decoded.id, createdAt: decoded.createdAt };
  } catch {
    return null;
  }
}

export async function getOrders(): Promise<Order[]> {
  const docs = await fsQuery("orders", [], { field: "createdAt", direction: "DESCENDING" });
  return docs as Order[];
}

export async function getOrdersPage({
  page = 1,
  pageSize = DEFAULT_ADMIN_PAGE_SIZE,
  cursor,
}: {
  page?: number;
  pageSize?: number;
  cursor?: string | null;
}): Promise<{
  orders: Order[];
  hasNextPage: boolean;
  page: number;
  pageSize: number;
  nextCursor?: string;
}> {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_ADMIN_PAGE_SIZE);

  const orderBy = [
    { field: "createdAt", direction: "DESCENDING" as const },
    { field: "__name__", direction: "DESCENDING" as const },
  ];

  const decodedCursor = cursor ? decodeCursor(cursor) : null;
  const docs = await fsQuery(
    "orders",
    [],
    orderBy,
    safePageSize + 1,
    decodedCursor
      ? {
          values: [decodedCursor.createdAt, decodedCursor.id],
          mode: "startAfter",
        }
      : undefined,
  );

  const orders = (docs.slice(0, safePageSize) as Order[]) ?? [];
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
export async function findOrdersByRecipientPhone(rawPhone: string): Promise<any[]> {
  const variants = Array.from(new Set(generatePhoneVariants(rawPhone)));
  const seen = new Set<string>();
  const allOrders: any[] = [];

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

export async function createOrder(
  data: Omit<Order, "id" | "publicReference" | "createdAt" | "updatedAt">
): Promise<Order> {
  const publicReference = generateReference();
  const doc = await fsAdd("orders", {
    ...data,
    publicReference,
  });
  return doc as Order;
}

export async function updateOrderStatus(
  orderId: string,
  paymentStatus: Order["paymentStatus"],
  fulfillmentStatus: Order["fulfillmentStatus"]
): Promise<void> {
  await fsUpdate("orders", orderId, { paymentStatus, fulfillmentStatus });
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  const docs = await fsQuery("payments", [{ field: "orderId", op: "EQUAL", value: orderId }]);
  return (docs[0] as Payment) ?? null;
}

export async function getSuccessfulOrdersCount(): Promise<number> {
  const { fsCount } = await import("./firestore-rest");
  return fsCount("orders", [
    { field: "fulfillmentStatus", op: "EQUAL", value: "SUCCESS" },
    { field: "fulfillmentStatus", op: "EQUAL", value: "DELIVERED" },
  ], "OR");
}

export async function createPayment(
  data: Omit<Payment, "id" | "createdAt" | "updatedAt">
): Promise<Payment> {
  const doc = await fsAdd("payments", data);
  return doc as Payment;
}
