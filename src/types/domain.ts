/**
 * src/types/domain.ts
 *
 * Core domain types mirroring the Firestore schema.
 */

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "NOT_APPLICABLE";

export type FulfillmentStatus = "PENDING" | "PROCESSING" | "ON_HOLD" | "SUCCESS" | "FAILED" | "REFUND_PENDING" | "REFUNDED";

export interface Network {
  id: string;
  name: string;
  code: string;
  color?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bundle {
  id: string;
  networkId: string;
  name: string;
  dataSize: string;
  validity?: string;
  providerCost: number;
  sellingPrice: number;
  active: boolean;
  providerAvailable?: boolean;
  tag?: string;
  dataMartNetwork?: string;
  dataMartCapacity?: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  phone: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  publicReference: string;
  customerId?: string;
  recipientPhone: string;
  
  detectedNetworkId?: string;
  networkId: string;
  bundleId: string;
  
  bundleNameSnapshot: string;
  dataSizeSnapshot: string;
  providerCostSnapshot: number;
  sellingPriceSnapshot: number;
  profitSnapshot: number;
  
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Legacy field (deprecated but kept for backward compatibility)
  providerReference?: string;
  providerError?: string;

  // New separated tracking fields
  paymentReference?: string;
  fulfillmentProviderReference?: string;
  fulfillmentProviderTransactionId?: string;
  providerStatus?: string;
  providerEvent?: string;
  providerMessage?: string;
  providerUpdatedAt?: string;
  lastProviderEventAt?: string;
  
  source?: "WEB" | "MANUAL";
  adminUid?: string;
  adminEmail?: string;
  adminNote?: string;
  manualFulfillment?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
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
