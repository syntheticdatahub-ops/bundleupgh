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

    const order = await getOrderByPublicReference(publicRef);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const providerRef = order.fulfillmentProviderReference || order.providerReference;
    if (!providerRef) {
      return NextResponse.json({ error: "No delivery tracking available yet" }, { status: 404 });
    }

    // Trigger fallback reconciliation asynchronously if the order is still non-terminal
    // This ensures that even if webhooks fail, actively tracked orders will eventually reconcile.
    if (order.fulfillmentStatus === "PROCESSING" || order.fulfillmentStatus === "ON_HOLD") {
      syncDataMartOrderStatus(order).catch(console.error);
    }

    // Proxy to DataMart
    return new Promise<NextResponse>((resolve) => {
      const options = {
        hostname: DATAMART_BASE_URL,
        // Assuming DataMart uses query params or path for reference in delivery-tracker
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
            resolve(NextResponse.json(json));
          } catch (e) {
            // Fallback if the endpoint doesn't exist or returns non-JSON
            resolve(NextResponse.json({ status: "unavailable", message: "Live tracking currently unavailable" }));
          }
        });
      });

      request.on("error", () => {
        resolve(NextResponse.json({ status: "error", message: "Could not connect to delivery network" }));
      });
      request.end();
    });
  } catch (err) {
    console.error("Delivery tracker proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
