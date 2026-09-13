import { NextResponse } from "next/server";
import { findOrdersByRecipientPhone } from "@/lib/orders";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";

// Safe customer-facing order shape
export type PublicOrder = {
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

function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 6) return "****";
  return clean.slice(0, 3) + "****" + clean.slice(-2);
}

function toPublicOrder(doc: any): PublicOrder {
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const rawPhone = (url.searchParams.get("phone") ?? "").trim();

    if (!rawPhone || rawPhone.length > 20) {
      return NextResponse.json(
        { error: "A valid phone number is required." },
        { status: 400 }
      );
    }

    const normalized = normalizePhone(rawPhone);
    if (!normalized) {
      return NextResponse.json(
        { error: "Please enter a valid Ghanaian phone number." },
        { status: 400 }
      );
    }

    const allOrders: any[] = await findOrdersByRecipientPhone(normalized);

    // Only surface operational (paid) orders to customers.
    // Unpaid/abandoned checkout attempts (paymentStatus = PENDING or FAILED)
    // must never appear in the customer-facing tracking view.
    const operationalOrders = allOrders.filter((o) => {
      const status = o.paymentStatus?.toUpperCase() || "";
      return status === "SUCCESS" || status === "PAID" || status === "NOT_APPLICABLE";
    });

    // Sort newest first
    operationalOrders.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    const publicOrders: PublicOrder[] = operationalOrders.map(toPublicOrder);

    return NextResponse.json({ orders: publicOrders, count: publicOrders.length });
  } catch (err: any) {
    console.error("Track API error:", err?.message ?? err);
    return NextResponse.json(
      { error: "Unable to retrieve orders right now. Please try again." },
      { status: 500 }
    );
  }
}
