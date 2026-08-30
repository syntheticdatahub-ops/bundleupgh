import { fsQuery, fsGet, fsAdd, fsUpdate } from "./firestore-rest";
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
  const docs = await fsQuery(
    "orders",
    [{ field: "publicReference", op: "EQUAL", value: reference }]
  );

  const match = (docs[0] as Order) ?? null;
  if (match) return match;

  const allOrders = await getOrders();
  return allOrders.find((order) => order.publicReference === reference) ?? null;
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
    [{ field: "providerReference", op: "EQUAL", value: providerReference }]
  );

  const match = (docs[0] as Order) ?? null;
  if (match) return match;

  const derivedPublicReference = extractPublicReferenceFromPaystackReference(providerReference);
  if (derivedPublicReference) {
    const orderByPublicReference = await getOrderByPublicReference(derivedPublicReference);
    if (orderByPublicReference) return orderByPublicReference;
  }

  const allOrders = await getOrders();
  const fallbackMatch = allOrders.find((order) => order.providerReference === providerReference);
  if (fallbackMatch) return fallbackMatch;

  if (derivedPublicReference) {
    return allOrders.find((order) => order.publicReference === derivedPublicReference) ?? null;
  }

  return null;
}

export async function getOrders(): Promise<Order[]> {
  const docs = await fsQuery("orders", [], { field: "createdAt", direction: "DESCENDING" });
  return docs as Order[];
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

export async function createPayment(
  data: Omit<Payment, "id" | "createdAt" | "updatedAt">
): Promise<Payment> {
  const doc = await fsAdd("payments", data);
  return doc as Payment;
}
