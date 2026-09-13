import { findOrdersByRecipientPhone } from "@/lib/orders";
import { normalizePhone } from "@/lib/phone";

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
  return clean.slice(0, 3) + "Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢" + clean.slice(-2);
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

  const allOrders: any[] = await findOrdersByRecipientPhone(normalized);

  allOrders.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  // Only surface operational (paid) orders. Unpaid/abandoned checkout attempts
  // (paymentStatus = PENDING or FAILED) are not shown to customers or support agents.
  const operationalOrders = allOrders.filter((o) => {
    const status = o.paymentStatus?.toUpperCase() || "";
    return status === "SUCCESS" || status === "PAID" || status === "NOT_APPLICABLE";
  });

  return operationalOrders.slice(0, limit).map(toSupportOrder);
}
