import { NextResponse } from "next/server";
import { findOrdersByRecipientPhone } from "@/lib/orders";
import { normalizePhone } from "@/lib/phone";
export const runtime = "nodejs";
function maskPhone(phone) {
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 6)
        return "****";
    return clean.slice(0, 3) + "****" + clean.slice(-2);
}
function toPublicOrder(doc) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return {
        id: (_a = doc.id) !== null && _a !== void 0 ? _a : "",
        orderReference: (_c = (_b = doc.publicReference) !== null && _b !== void 0 ? _b : doc.id) !== null && _c !== void 0 ? _c : "",
        network: (_d = doc.networkId) !== null && _d !== void 0 ? _d : "",
        bundleName: (_e = doc.bundleNameSnapshot) !== null && _e !== void 0 ? _e : "",
        bundleSize: (_f = doc.dataSizeSnapshot) !== null && _f !== void 0 ? _f : "",
        recipientPhoneMasked: maskPhone((_g = doc.recipientPhone) !== null && _g !== void 0 ? _g : ""),
        amount: Number((_h = doc.sellingPriceSnapshot) !== null && _h !== void 0 ? _h : 0),
        paymentStatus: ((_j = doc.paymentStatus) !== null && _j !== void 0 ? _j : "PENDING").toUpperCase(),
        fulfillmentStatus: ((_k = doc.fulfillmentStatus) !== null && _k !== void 0 ? _k : "PENDING").toUpperCase(),
        createdAt: (_l = doc.createdAt) !== null && _l !== void 0 ? _l : "",
    };
}
export async function GET(req) {
    var _a, _b;
    try {
        const url = new URL(req.url);
        const rawPhone = ((_a = url.searchParams.get("phone")) !== null && _a !== void 0 ? _a : "").trim();
        if (!rawPhone || rawPhone.length > 20) {
            return NextResponse.json({ error: "A valid phone number is required." }, { status: 400 });
        }
        const normalized = normalizePhone(rawPhone);
        if (!normalized) {
            return NextResponse.json({ error: "Please enter a valid Ghanaian phone number." }, { status: 400 });
        }
        const allOrders = await findOrdersByRecipientPhone(normalized);
        // Only surface operational (paid) orders to customers.
        // Unpaid/abandoned checkout attempts (paymentStatus = PENDING or FAILED)
        // must never appear in the customer-facing tracking view.
        const operationalOrders = allOrders.filter((o) => {
            var _a;
            const status = ((_a = o.paymentStatus) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
            return status === "SUCCESS" || status === "PAID" || status === "NOT_APPLICABLE";
        });
        // Sort newest first
        operationalOrders.sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
        });
        const publicOrders = operationalOrders.map(toPublicOrder);
        return NextResponse.json({ orders: publicOrders, count: publicOrders.length });
    }
    catch (err) {
        console.error("Track API error:", (_b = err === null || err === void 0 ? void 0 : err.message) !== null && _b !== void 0 ? _b : err);
        return NextResponse.json({ error: "Unable to retrieve orders right now. Please try again." }, { status: 500 });
    }
}
