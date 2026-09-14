import { NextResponse } from "next/server";
import https from "node:https";
import { getOrderByPublicReference } from "@/lib/orders";
import { syncDataMartOrderStatus } from "@/lib/datamart";
const DATAMART_API_KEY = process.env.DATAMART_API_KEY;
const DATAMART_BASE_URL = "api.datamartgh.shop";
/**
 * Maps a raw DataMart order/track status string to a clean label for the UI.
 * DataMart's envelope always has status:"success" for a valid HTTP response â€”
 * the actual delivery state lives inside response.data.
 */
function mapDataMartStatus(rawStatus) {
    if (!rawStatus)
        return "checking";
    const s = rawStatus.toLowerCase().replace(/[_\s-]/g, "_");
    if (s === "completed" || s === "complete")
        return "delivered";
    if (s === "failed" || s === "rejected")
        return "failed";
    if (s === "waiting" ||
        s === "on_hold" ||
        s === "beneficiary_not_allowed" ||
        s === "not_allowed" ||
        s === "pending_verification")
        return "on_hold";
    if (s === "processing" || s === "created" || s === "pending")
        return "processing";
    if (s === "refunded")
        return "refunded";
    return rawStatus.toLowerCase();
}
export async function GET(req) {
    try {
        const url = new URL(req.url);
        const publicRef = url.searchParams.get("reference");
        if (!publicRef) {
            return NextResponse.json({ error: "Missing reference" }, { status: 400 });
        }
        const order = await getOrderByPublicReference(publicRef);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        const providerRef = order.fulfillmentProviderReference || order.providerReference;
        if (!providerRef) {
            return NextResponse.json({ error: "No delivery tracking available yet" }, { status: 404 });
        }
        // If the order is non-terminal, AWAIT reconciliation so Firestore is updated
        // before we respond. syncDataMartOrderStatus now returns the freshly-written
        // fulfillment status so we can use it directly instead of re-reading the same
        // order from Firestore (removes a redundant lookup per poll).
        if (order.fulfillmentStatus === "PROCESSING" || order.fulfillmentStatus === "ON_HOLD") {
            const syncedStatus = await syncDataMartOrderStatus(order).catch(() => null);
            if (syncedStatus) {
                order.fulfillmentStatus = syncedStatus;
            }
        }
        const bundleupStatus = order.fulfillmentStatus;
        // Proxy to DataMart delivery tracker
        return new Promise((resolve) => {
            const options = {
                hostname: DATAMART_BASE_URL,
                path: `/api/developer/delivery-tracker?reference=${encodeURIComponent(providerRef)}`,
                method: "GET",
                headers: {
                    "X-API-Key": DATAMART_API_KEY || "",
                    "Content-Type": "application/json",
                },
                family: 4,
                rejectUnauthorized: false,
            };
            const request = https.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    var _a, _b, _c, _d, _e, _f;
                    try {
                        const json = JSON.parse(data);
                        // DataMart envelope: { status: "success", data: { status/orderStatus/trackStatus, message, ... } }
                        // Never expose the envelope "status" (it just means the HTTP call worked).
                        // Extract the actual delivery state from json.data instead.
                        const inner = (_a = json === null || json === void 0 ? void 0 : json.data) !== null && _a !== void 0 ? _a : {};
                        const rawDeliveryStatus = (_d = (_c = (_b = inner.orderStatus) !== null && _b !== void 0 ? _b : inner.trackStatus) !== null && _c !== void 0 ? _c : inner.status) !== null && _d !== void 0 ? _d : inner.deliveryStatus;
                        const trackerStatus = mapDataMartStatus(rawDeliveryStatus);
                        const trackerMessage = (_f = (_e = inner.message) !== null && _e !== void 0 ? _e : json === null || json === void 0 ? void 0 : json.message) !== null && _f !== void 0 ? _f : undefined;
                        resolve(NextResponse.json({
                            trackerStatus, // mapped human-friendly status from json.data
                            trackerMessage, // optional message from DataMart
                            bundleupStatus, // authoritative BundleUp Firestore status
                        }));
                    }
                    catch (_g) {
                        resolve(NextResponse.json({
                            trackerStatus: "unavailable",
                            trackerMessage: "Live tracking currently unavailable",
                            bundleupStatus,
                        }));
                    }
                });
            });
            request.on("error", () => {
                resolve(NextResponse.json({
                    trackerStatus: "error",
                    trackerMessage: "Could not connect to delivery network",
                    bundleupStatus,
                }));
            });
            request.end();
        });
    }
    catch (err) {
        console.error("Delivery tracker proxy error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
