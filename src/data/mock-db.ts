import { Network, Bundle, Order, Customer } from "@/types/domain";

export const networks: Network[] = [
  { id: "mtn", name: "MTN", code: "mtn", color: "var(--mtn-yellow)", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "telecel", name: "Telecel", code: "telecel", color: "var(--telecel-red)", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "airteltigo", name: "AirtelTigo", code: "airteltigo", color: "var(--airteltigo-blue)", active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const dataPlans: Bundle[] = [
  // MTN Plans
  { id: "mtn-1", networkId: "mtn", name: "MTN 500MB", dataSize: "500MB", validity: "Non-expiry", providerCost: 4.8, sellingPrice: 5.0, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "mtn-2", networkId: "mtn", name: "MTN 1GB", dataSize: "1GB", validity: "Non-expiry", providerCost: 9.5, sellingPrice: 10.0, active: true, tag: "popular", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "mtn-3", networkId: "mtn", name: "MTN 3GB", dataSize: "3GB", validity: "Non-expiry", providerCost: 28.5, sellingPrice: 30.0, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  // Telecel Plans
  { id: "tel-1", networkId: "telecel", name: "Telecel 1GB", dataSize: "1GB", validity: "Non-expiry", providerCost: 9.0, sellingPrice: 10.0, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "tel-2", networkId: "telecel", name: "Telecel 5GB", dataSize: "5GB", validity: "Non-expiry", providerCost: 45.0, sellingPrice: 50.0, active: true, tag: "best-value", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  // AirtelTigo Plans
  { id: "at-1", networkId: "airteltigo", name: "AT 1.5GB", dataSize: "1.5GB", validity: "Non-expiry", providerCost: 9.0, sellingPrice: 10.0, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "at-2", networkId: "airteltigo", name: "AT 4GB", dataSize: "4GB", validity: "Non-expiry", providerCost: 18.0, sellingPrice: 20.0, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-2026-001",
    publicReference: "BUP-9A8B7C",
    recipientPhone: "241234567",
    networkId: "mtn",
    bundleId: "mtn-2",
    bundleNameSnapshot: "MTN 1GB",
    dataSizeSnapshot: "1GB",
    providerCostSnapshot: 9.5,
    sellingPriceSnapshot: 10.0,
    profitSnapshot: 0.5,
    paymentStatus: "SUCCESS",
    fulfillmentStatus: "SUCCESS",
    providerReference: "DATAMART-001",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: "ORD-2026-002",
    publicReference: "BUP-4X5Y6Z",
    recipientPhone: "209876543",
    networkId: "telecel",
    bundleId: "tel-2",
    bundleNameSnapshot: "Telecel 5GB",
    dataSizeSnapshot: "5GB",
    providerCostSnapshot: 45.0,
    sellingPriceSnapshot: 50.0,
    profitSnapshot: 5.0,
    paymentStatus: "SUCCESS",
    fulfillmentStatus: "FAILED",
    providerReference: "DATAMART-002",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7100000).toISOString(),
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    phone: "241234567",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];
