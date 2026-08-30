import { Order } from "@/types/domain";
import https from "node:https";
import { normalizePhone } from "./phone";
import { fsUpdate } from "./firestore-rest";

const DATAMART_API_KEY = process.env.DATAMART_API_KEY;
const DATAMART_BASE_URL = "api.datamartgh.shop";

if (!DATAMART_API_KEY) {
  console.warn("DATAMART_API_KEY is not set. DataMart API calls will fail.");
}

function mapNetwork(networkId: string): string {
  const normalized = networkId.toLowerCase();
  if (normalized === "mtn") return "YELLO";
  if (normalized === "telecel" || normalized === "vodafone") return "TELECEL";
  if (normalized === "airteltigo" || normalized === "at") return "AT_PREMIUM";
  throw new Error(`Unknown network ID for DataMart mapping: ${networkId}`);
}

function mapCapacity(dataSizeSnapshot: string): string {
  const upper = dataSizeSnapshot.toUpperCase();
  let capacity = parseFloat(dataSizeSnapshot);
  
  if (isNaN(capacity)) {
    throw new Error(`Unable to determine capacity from data size: ${dataSizeSnapshot}`);
  }

  // Convert MB to GB if needed
  if (upper.includes("MB")) {
    capacity = capacity / 1000;
  }
  
  return capacity.toString();
}

/**
 * Generic request helper for DataMart
 */
async function dataMartRequest<T>(endpoint: string, method: "GET" | "POST", body?: any, additionalHeaders: Record<string, string> = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DATAMART_BASE_URL,
      path: endpoint,
      method,
      headers: {
        "X-API-Key": DATAMART_API_KEY || "",
        "Content-Type": "application/json",
        ...additionalHeaders,
      },
      family: 4, // Force IPv4 for Windows SSL issue
      rejectUnauthorized: false, // Bypass SSL cert issue locally
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Invalid JSON response from DataMart: ${data}`));
        }
      });
    });

    req.on("error", (e) => reject(e));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

export async function fulfillDataMartOrder(order: Order): Promise<void> {
  if (order.paymentStatus !== "SUCCESS" && order.paymentStatus !== "NOT_APPLICABLE") {
    throw new Error(`Cannot fulfill order ${order.id}: Payment status is ${order.paymentStatus}`);
  }
  if (order.fulfillmentStatus === "SUCCESS") {
    console.log(`Order ${order.id} is already fulfilled.`);
    return;
  }

  // Map fields
  const dataMartNetwork = mapNetwork(order.networkId);
  const dataMartCapacity = mapCapacity(order.dataSizeSnapshot);
  const dataMartPhone = normalizePhone(order.recipientPhone) || order.recipientPhone;

  console.log(`Fulfilling via DataMart: ${order.id} - ${dataMartNetwork} ${dataMartCapacity}GB to ${dataMartPhone}`);

  try {
    const payload = {
      phoneNumber: dataMartPhone,
      network: dataMartNetwork,
      capacity: dataMartCapacity,
      gateway: "wallet",
    };

    const response = await dataMartRequest<any>("/api/developer/purchase", "POST", payload, {
      "X-Idempotency-Key": order.id,
    });

    if (response.status === "success" && response.data) {
      const transactionReference = response.data.transactionReference || response.data.purchaseId || response.data.orderReference;
      const orderStatus = response.data.orderStatus; // "completed", "pending", etc.

      let newFulfillmentStatus: Order["fulfillmentStatus"] = "PROCESSING";
      if (orderStatus === "completed") {
        newFulfillmentStatus = "SUCCESS";
      } else if (orderStatus === "failed") {
        newFulfillmentStatus = "FAILED";
      }

      await fsUpdate("orders", order.id, {
        fulfillmentStatus: newFulfillmentStatus,
        providerReference: transactionReference || undefined,
        updatedAt: new Date().toISOString(),
      });
      console.log(`DataMart fulfillment success for ${order.id}. Status: ${newFulfillmentStatus}`);
    } else {
      console.error(`DataMart fulfillment error for ${order.id}:`, response);
      await fsUpdate("orders", order.id, {
        fulfillmentStatus: "FAILED",
        providerError: response.message || "Provider rejected the request.",
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error(`DataMart request failed for ${order.id}:`, error);
    await fsUpdate("orders", order.id, {
      fulfillmentStatus: "FAILED",
      providerError: error.message || "Network or timeout error.",
      updatedAt: new Date().toISOString(),
    });
  }
}
