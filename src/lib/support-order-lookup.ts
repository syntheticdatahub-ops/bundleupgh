import { fsQuery } from "@/lib/firestore-rest";
import { generatePhoneVariants, normalizePhone } from "@/lib/phone";

export type SupportOrder = {
  id: string;
  orderReference: string;
  network: string;
  bundleName: string;
  bundleSize: string;
  recipientPhoneMasked: string;
  amount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
};

export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length <= 6) return "****";
  return clean.slice(0, 3) + "••••" + clean.slice(-2);
}

export function toSupportOrder(doc: any): SupportOrder {
  return {
    id: doc.id ?? "",
    orderReference: doc.publicReference ?? doc.id ?? "",
    network: doc.networkId ?? "",
    bundleName: doc.bundleNameSnapshot ?? "",
    bundleSize: doc.dataSizeSnapshot ?? "",
    recipientPhoneMasked: maskPhone(doc.recipientPhone ?? ""),
    amount: Number(doc.sellingPriceSnapshot ?? 0),
    paymentStatus: (doc.paymentStatus ?? "PENDING").toUpperCase(),
    fulfillmentStatus: (doc.fulfillmentStatus ?? "PENDING").toUpperCase(),
    createdAt: doc.createdAt ?? "",
  };
}

export async function lookupOrdersByPhoneNumber(rawPhone: string, limit = 5): Promise<SupportOrder[]> {
  const normalized = normalizePhone(rawPhone);
  if (!normalized) {
    return [];
  }

  const variants = Array.from(new Set(generatePhoneVariants(normalized)));
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

  allOrders.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return allOrders.slice(0, limit).map(toSupportOrder);
}
