import { NextResponse } from "next/server";
import { fsUpdate } from "@/lib/firestore-rest";
import { extractPublicReferenceFromPaystackReference, getOrderByProviderReference, getOrderByPublicReference, getPaymentByOrderId } from "@/lib/orders";
import { processFulfillment } from "@/lib/fulfillment";
import { normalizePaystackAmount, verifyPaystackTransaction } from "@/lib/paystack";
export async function GET(req) {
    var _a, _b, _c, _d, _e, _f;
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
                    currency: (_a = verification.currency) !== null && _a !== void 0 ? _a : "GHS",
                    amount: normalizePaystackAmount(verification.amount) / 100,
                    updatedAt: new Date().toISOString(),
                });
            }
            return NextResponse.json({ success: false, status: "failed", reference, orderId: order.publicReference });
        }
        // Paystack async states — common with Telecel/AirtelTigo mobile money where
        // the USSD approval completes AFTER the customer is redirected back to us.
        // These are NOT failures. The webhook (charge.success) will confirm payment.
        // Return 202 so the callback UI can show a "processing" state rather than an error.
        const asyncStates = ["ongoing", "pay_offline", "processing", "pending"];
        if (asyncStates.includes(verification.status)) {
            return NextResponse.json({
                success: false,
                status: "processing",
                message: "Your payment is being confirmed by your network. This usually takes 1–3 minutes for mobile money. Please check your order status shortly.",
                reference,
                orderId: order.publicReference,
            }, { status: 202 });
        }
        const snapshotAmount = Number((_b = order.sellingPriceSnapshot) !== null && _b !== void 0 ? _b : 0);
        if (!Number.isFinite(snapshotAmount) || snapshotAmount <= 0) {
            return NextResponse.json({
                error: "Order snapshot is missing or invalid. Please recreate the order and retry.",
                orderId: (_c = order.publicReference) !== null && _c !== void 0 ? _c : order.id,
                reference,
            }, { status: 400 });
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
            return NextResponse.json({ error: "Payment amount mismatch", expected: expectedAmount, received: receivedAmount }, { status: 400 });
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
                paidAt: (_d = verification.paid_at) !== null && _d !== void 0 ? _d : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
        await processFulfillment(order.id);
        return NextResponse.json({
            success: true,
            status: "success",
            orderId: order.publicReference,
            reference,
            fulfillmentStatus: (_e = order.fulfillmentStatus) !== null && _e !== void 0 ? _e : "PROCESSING",
            orderDetails: {
                bundle: order.bundleNameSnapshot,
                price: order.sellingPriceSnapshot,
                phone: order.recipientPhone,
                network: order.networkId,
            }
        });
    }
    catch (error) {
        console.error("Paystack verify error:", error);
        return NextResponse.json({ error: (_f = error === null || error === void 0 ? void 0 : error.message) !== null && _f !== void 0 ? _f : "Unable to verify payment" }, { status: 500 });
    }
}
