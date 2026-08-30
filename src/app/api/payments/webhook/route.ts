/**
 * POST /api/payments/webhook
 *
 * Paystack webhook endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { fsUpdate } from "@/lib/firestore-rest";
import { getOrderByProviderReference, getPaymentByOrderId } from "@/lib/orders";
import { processFulfillment } from "@/lib/fulfillment";
import { getPaystackSecretKey, verifyPaystackSignature } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const secret = getPaystackSecretKey();
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const isValid = verifyPaystackSignature(rawBody, signature, secret);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { event, data } = payload;
  const reference = typeof data?.reference === "string" ? data.reference : "";

  if (!reference) {
    return NextResponse.json({ error: "Missing Paystack reference" }, { status: 400 });
  }

  const order = await getOrderByProviderReference(reference);
  if (!order) {
    return NextResponse.json({ received: true, ignored: true });
  }

  if (order.paymentStatus === "SUCCESS") {
    return NextResponse.json({ received: true, idempotent: true });
  }

  switch (event) {
    case "charge.success": {
      const payment = await getPaymentByOrderId(order.id);
      const snapshotAmount = Number(order.sellingPriceSnapshot ?? 0);
      if (!Number.isFinite(snapshotAmount) || snapshotAmount <= 0) {
        return NextResponse.json({ error: "Order snapshot is missing or invalid" }, { status: 400 });
      }

      const expectedAmount = Math.round(snapshotAmount * 100);
      const receivedAmount = Number(data?.amount ?? 0);

      if (String(data?.currency || "GHS").toUpperCase() !== "GHS") {
        return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
      }

      if (receivedAmount !== expectedAmount) {
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      await fsUpdate("orders", order.id, {
        paymentStatus: "SUCCESS",
        fulfillmentStatus: "PROCESSING",
        updatedAt: new Date().toISOString(),
      });

      if (payment) {
        await fsUpdate("payments", payment.id, {
          status: "SUCCESS",
          providerReference: reference,
          amount: order.sellingPriceSnapshot,
          currency: "GHS",
          paidAt: data?.paid_at ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      await processFulfillment(order.id);
      return NextResponse.json({ received: true, processed: true });
    }

    case "charge.failed": {
      await fsUpdate("orders", order.id, {
        paymentStatus: "FAILED",
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ received: true, processed: true });
    }

    default:
      return NextResponse.json({ received: true, ignored: true });
  }
}
