import { NextResponse } from "next/server";
import { fsUpdate } from "@/lib/firestore-rest";
import { createPayment, getOrderById, getOrderByPublicReference, getPaymentByOrderId } from "@/lib/orders";
import { generatePaystackReference, getPaystackCallbackUrl, initializePaystackTransaction, toPaystackAmount, } from "@/lib/paystack";
export async function POST(req) {
    var _a, _b, _c;
    try {
        const body = await req.json();
        const orderId = typeof (body === null || body === void 0 ? void 0 : body.orderId) === "string" ? body.orderId : "";
        if (!orderId) {
            return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
        }
        const order = (_a = (await getOrderByPublicReference(orderId))) !== null && _a !== void 0 ? _a : (await getOrderById(orderId));
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (order.paymentStatus === "SUCCESS") {
            return NextResponse.json({ error: "This order has already been paid" }, { status: 409 });
        }
        if (order.fulfillmentStatus === "SUCCESS" || order.fulfillmentStatus === "FAILED") {
            return NextResponse.json({ error: "This order cannot be paid again" }, { status: 409 });
        }
        const reference = (_b = order.providerReference) !== null && _b !== void 0 ? _b : generatePaystackReference(order.publicReference);
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
        }
        else {
            await createPayment({
                orderId: order.id,
                provider: "PAYSTACK",
                providerReference: reference,
                amount: order.sellingPriceSnapshot,
                currency: "GHS",
                status: "PENDING",
            });
        }
        // Derive a unique per-customer email from their phone number.
        // Using the same email (customer@bundleup.com) for every order causes
        // Paystack's fraud system to flag transactions as suspicious because
        // many different devices/networks all share one identity.
        const cleanPhone = order.recipientPhone.replace(/\D/g, "");
        const customerEmail = `${cleanPhone}@bundleup.com`;
        const result = await initializePaystackTransaction({
            amountInPesewas,
            email: customerEmail,
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
    }
    catch (error) {
        console.error("Paystack initialize error:", error);
        return NextResponse.json({ error: (_c = error === null || error === void 0 ? void 0 : error.message) !== null && _c !== void 0 ? _c : "Unable to initialize Paystack payment" }, { status: 500 });
    }
}
