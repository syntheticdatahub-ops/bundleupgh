/**
 * src/types/domain.ts
 *
 * Core domain types mirroring the Firestore schema.
 */

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "NOT_APPLICABLE";

export type FulfillmentStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "REFUND_PENDING" | "REFUNDED";

export interface Network {
  id: string; // Document ID
  name: string;
  code: string;
  color?: string; // Kept for UI styling
  active: boolean;
  createdAt: string; // ISO String or Timestamp representation
  updatedAt: string;
}

export interface Bundle {
  id: string; // Document ID — deterministic: "<networkId>-<dataSize>" e.g. "mtn-5gb"
  networkId: string;
  name: string;
  dataSize: string; // e.g. "5GB", "500MB"
  validity?: string; // e.g. "30 Days"
  providerCost: number; // DataMart wholesale cost (GHS)
  sellingPrice: number; // BundleUp retail price set by admin (GHS)
  active: boolean; // Retail activation state (controlled by admin)
  providerAvailable?: boolean; // True if currently offered by DataMart, false if retired
  tag?: string; // Optional UI tag e.g. "Best Value"
  // DataMart sync metadata
  dataMartNetwork?: string; // e.g. "YELLO", "TELECEL", "AT_PREMIUM"
  dataMartCapacity?: number; // Raw capacity value DataMart expects (GB as float)
  lastSyncedAt?: string; // ISO timestamp of last DataMart sync
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string; // Document ID
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string; // Document ID
  publicReference: string; // e.g. BU-8F42K
  customerId?: string; // Nullable if guest, but Phase 4 says create/reuse customer
  recipientPhone: string;
  
  detectedNetworkId?: string; // From Phase 2B
  networkId: string; // The network used
  bundleId: string; // The bundle used
  
  // Snapshots at time of purchase
  bundleNameSnapshot: string;
  dataSizeSnapshot: string;
  providerCostSnapshot: number;
  sellingPriceSnapshot: number;
  profitSnapshot: number;
  
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  providerReference?: string; // e.g. DataMart ref
  providerError?: string; // Specific error message returned by provider
  
  source?: "WEB" | "MANUAL"; // WEB is default normal flow, MANUAL is for admin dashboard
  adminUid?: string; // If manual
  adminEmail?: string; // If manual
  adminNote?: string; // Reason for manual fulfillment
  manualFulfillment?: boolean; // Flag to easily distinguish
  
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string; // Document ID
  orderId: string;
  provider: "PAYSTACK" | "MOCK";
  providerReference?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  eventType: string;
  providerReference: string;
  payload: any;
  processed: boolean;
  createdAt: string;
}
