import { NextResponse } from "next/server";
import { fsUpdate } from "@/lib/firestore-rest";
import { createPayment, getOrderById, getOrderByPublicReference, getPaymentByOrderId } from "@/lib/orders";
import {
  generatePaystackReference,
  getPaystackCallbackUrl,
  initializePaystackTransaction,
  toPaystackAmount,
} from "@/lib/paystack";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";

    if (!orderId) {
      return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
    }

    const order = (await getOrderByPublicReference(orderId)) ?? (await getOrderById(orderId));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "SUCCESS") {
      return NextResponse.json({ error: "This order has already been paid" }, { status: 409 });
    }

    if (order.fulfillmentStatus === "SUCCESS" || order.fulfillmentStatus === "FAILED") {
      return NextResponse.json({ error: "This order cannot be paid again" }, { status: 409 });
    }

    const reference = order.providerReference ?? generatePaystackReference(order.publicReference);
    const amountInPesewas = toPaystackAmount(order.sellingPriceSnapshot);

    await fsUpdate("orders", order.id, {
      paymentReference: reference,
      providerReference: reference, // Legacy fallback
      paymentStatus: "PENDING",
      fulfillmentStatus: "PENDING",
      updatedAt: new Date().toISOString(),
    });

    const payment = await getPaymentByOrderId(order.id);
    if (payment) {
      await fsUpdate("payments", payment.id, {
        provider: "PAYSTACK",
        providerReference: reference,
        amount: order.sellingPriceSnapshot,
        currency: "GHS",
        status: "PENDING",
        updatedAt: new Date().toISOString(),
      });
    } else {
      await createPayment({
        orderId: order.id,
        provider: "PAYSTACK",
        providerReference: reference,
        amount: order.sellingPriceSnapshot,
        currency: "GHS",
        status: "PENDING",
      });
    }

    const result = await initializePaystackTransaction({
      amountInPesewas,
      reference,
      callbackUrl: getPaystackCallbackUrl(),
    });

    return NextResponse.json({
      success: true,
      orderId: order.publicReference,
      reference,
      authorization_url: result.authorization_url,
      access_code: result.access_code,
    });
  } catch (error: any) {
    console.error("Paystack initialize error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Unable to initialize Paystack payment" },
      { status: 500 }
    );
  }
}
