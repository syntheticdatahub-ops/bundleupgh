import { NextResponse } from "next/server";
import https from "node:https";
import { getOrderByPublicReference } from "@/lib/orders";
import { syncDataMartOrderStatus } from "@/lib/datamart";

const DATAMART_API_KEY = process.env.DATAMART_API_KEY;
const DATAMART_BASE_URL = "api.datamartgh.shop";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const publicRef = url.searchParams.get("reference");

    if (!publicRef) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    let order = await getOrderByPublicReference(publicRef);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const providerRef = order.fulfillmentProviderReference || order.providerReference;
    if (!providerRef) {
      return NextResponse.json({ error: "No delivery tracking available yet" }, { status: 404 });
    }

    // If the order is non-terminal, AWAIT reconciliation so Firestore is updated
    // before we respond, then re-fetch to get the latest authoritative status.
    if (order.fulfillmentStatus === "PROCESSING" || order.fulfillmentStatus === "ON_HOLD") {
      await syncDataMartOrderStatus(order).catch(console.error);
      const refreshed = await getOrderByPublicReference(publicRef);
      if (refreshed) order = refreshed;
    }

    // Capture the authoritative BundleUp status after reconciliation.
    // This is included in the response so the client can detect a change and refresh.
    const bundleupStatus = order.fulfillmentStatus;

    // Proxy to DataMart delivery tracker
    return new Promise<NextResponse>((resolve) => {
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
          try {
            const json = JSON.parse(data);
            // Attach the BundleUp fulfillment status so the UI can react to changes
            resolve(NextResponse.json({ ...json, bundleupStatus }));
          } catch {
            resolve(NextResponse.json({
              status: "unavailable",
              message: "Live tracking currently unavailable",
              bundleupStatus,
            }));
          }
        });
      });

      request.on("error", () => {
        resolve(NextResponse.json({
          status: "error",
          message: "Could not connect to delivery network",
          bundleupStatus,
        }));
      });
      request.end();
    });
  } catch (err) {
    console.error("Delivery tracker proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
