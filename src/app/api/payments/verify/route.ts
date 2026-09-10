import { NextResponse } from "next/server";
import { fsUpdate } from "@/lib/firestore-rest";
import { extractPublicReferenceFromPaystackReference, getOrderByProviderReference, getOrderByPublicReference, getPaymentByOrderId } from "@/lib/orders";
import { processFulfillment } from "@/lib/fulfillment";
import { normalizePaystackAmount, verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get("reference") || url.searchParams.get("trxref") || "";

    if (!reference) {
      return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });
    }

    let order = await getOrderByProviderReference(reference);
    if (!order) {
      const derivedPublicReference = extractPublicReferenceFromPaystackReference(reference);
      if (derivedPublicReference) {
        order = await getOrderByPublicReference(derivedPublicReference);
      }
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found for this payment reference" }, { status: 404 });
    }

    if (order.paymentStatus === "SUCCESS") {
      return NextResponse.json({
        success: true,
        status: "already_paid",
        orderId: order.publicReference,
        reference,
        orderDetails: {
          bundle: order.bundleNameSnapshot,
          price: order.sellingPriceSnapshot,
          phone: order.recipientPhone,
          network: order.networkId,
        }
      });
    }

    const verification = await verifyPaystackTransaction(reference);
    if (verification.status === "failed" || verification.status === "cancelled") {
      await fsUpdate("orders", order.id, {
        paymentStatus: "FAILED",
        updatedAt: new Date().toISOString(),
      });

      const payment = await getPaymentByOrderId(order.id);
      if (payment) {
        await fsUpdate("payments", payment.id, {
          status: "FAILED",
          providerReference: reference,
          currency: verification.currency ?? "GHS",
          amount: normalizePaystackAmount(verification.amount) / 100,
          updatedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: false, status: "failed", reference, orderId: order.publicReference });
    }

    if (verification.status !== "success") {
      return NextResponse.json({ success: false, status: verification.status, reference }, { status: 400 });
    }

    const snapshotAmount = Number(order.sellingPriceSnapshot ?? 0);
    if (!Number.isFinite(snapshotAmount) || snapshotAmount <= 0) {
      return NextResponse.json(
        {
          error: "Order snapshot is missing or invalid. Please recreate the order and retry.",
          orderId: order.publicReference ?? order.id,
          reference,
        },
        { status: 400 }
      );
    }

    const expectedAmount = Math.round(snapshotAmount * 100);
    const receivedAmount = normalizePaystackAmount(verification.amount);

    console.log("Paystack verification debug:", {
      reference,
      orderId: order.id,
      expectedAmount,
      receivedAmount,
      sellingPriceSnapshot: snapshotAmount,
      currency: verification.currency,
    });

    if (Math.abs(receivedAmount - expectedAmount) > 0) {
      return NextResponse.json(
        { error: "Payment amount mismatch", expected: expectedAmount, received: receivedAmount },
        { status: 400 }
      );
    }

    if ((verification.currency || "GHS").toUpperCase() !== "GHS") {
      return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
    }

    await fsUpdate("orders", order.id, {
      paymentStatus: "SUCCESS",
      fulfillmentStatus: "PROCESSING",
      providerReference: reference,
      updatedAt: new Date().toISOString(),
    });

    const payment = await getPaymentByOrderId(order.id);
    if (payment) {
      await fsUpdate("payments", payment.id, {
        status: "SUCCESS",
        providerReference: reference,
        amount: order.sellingPriceSnapshot,
        currency: "GHS",
        paidAt: verification.paid_at ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await processFulfillment(order.id);

    return NextResponse.json({
      success: true,
      status: "success",
      orderId: order.publicReference,
      reference,
      fulfillmentStatus: order.fulfillmentStatus ?? "PROCESSING",
      orderDetails: {
        bundle: order.bundleNameSnapshot,
        price: order.sellingPriceSnapshot,
        phone: order.recipientPhone,
        network: order.networkId,
      }
    });
  } catch (error: any) {
    console.error("Paystack verify error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Unable to verify payment" },
      { status: 500 }
    );
  }
}
