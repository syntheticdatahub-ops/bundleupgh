import { fsQuery, fsAdd, fsCount } from "./firestore-rest";
import { findOrdersByRecipientPhone } from "./orders";
import type { Customer } from "@/types/domain";

export const DEFAULT_CUSTOMER_PAGE_SIZE = 25;

export type CustomerPageRow = Customer & {
  totalOrders: number;
  totalSpent: number;
  lastNetworkId: string;
  lastOrderDate: string;
  lastOrderTimestamp: number;
  status: "active" | "inactive";
  displayPhone: string;
};

export function encodeCursor(doc: Pick<Customer, "id" | "createdAt">): string {
  return Buffer.from(JSON.stringify({ id: doc.id, createdAt: doc.createdAt })).toString("base64");
}

export function decodeCursor(token: string): { id: string; createdAt: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    if (!decoded || typeof decoded.id !== "string" || typeof decoded.createdAt !== "string") return null;
    return { id: decoded.id, createdAt: decoded.createdAt };
  } catch {
    return null;
  }
}

export async function getCustomers(): Promise<Customer[]> {
  const docs = await fsQuery("customers", [], { field: "createdAt", direction: "DESCENDING" });
  return docs as Customer[];
}

export async function getCustomerCount(): Promise<number> {
  return fsCount("customers");
}

export async function getCustomersPage({
  page = 1,
  pageSize = DEFAULT_CUSTOMER_PAGE_SIZE,
  cursor,
}: {
  page?: number;
  pageSize?: number;
  cursor?: string | null;
}): Promise<{
  customers: Customer[];
  hasNextPage: boolean;
  page: number;
  pageSize: number;
  nextCursor?: string;
}> {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || DEFAULT_CUSTOMER_PAGE_SIZE);

  const orderBy = [
    { field: "createdAt", direction: "DESCENDING" as const },
    { field: "__name__", direction: "DESCENDING" as const },
  ];

  const decodedCursor = cursor ? decodeCursor(cursor) : null;
  const docs = await fsQuery(
    "customers",
    [],
    orderBy,
    safePageSize + 1,
    decodedCursor
      ? {
          values: [decodedCursor.createdAt, decodedCursor.id],
          mode: "startAfter",
        }
      : undefined,
  );

  const customers = (docs.slice(0, safePageSize) as Customer[]) ?? [];
  const hasNextPage = docs.length > safePageSize;

  return {
    customers,
    hasNextPage,
    page: safePage,
    pageSize: safePageSize,
    nextCursor: hasNextPage && customers.length > 0 ? encodeCursor(customers[customers.length - 1]) : undefined,
  };
}

export async function getCustomerPageRows({
  page = 1,
  pageSize = DEFAULT_CUSTOMER_PAGE_SIZE,
  cursor,
}: {
  page?: number;
  pageSize?: number;
  cursor?: string | null;
}): Promise<{
  customers: CustomerPageRow[];
  hasNextPage: boolean;
  page: number;
  pageSize: number;
  nextCursor?: string;
}> {
  const { customers, hasNextPage, page: safePage, pageSize: safePageSize, nextCursor } = await getCustomersPage({
    page,
    pageSize,
    cursor,
  });

  const rows = await Promise.all(customers.map(async (customer) => {
    const customerOrders = await findOrdersByRecipientPhone(customer.phone);
    const ordered = [...customerOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const successfulOrders = ordered.filter((o) => {
      const fs = (o.fulfillmentStatus || "").toUpperCase();
      return fs === "SUCCESS" || fs === "DELIVERED";
    });

    const cPhoneLocal = customer.phone.replace(/\D/g, "");
    const displayPhone = cPhoneLocal.length === 10 ? `+233 ${cPhoneLocal.slice(1).replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}` : customer.phone;

    return {
      ...customer,
      totalOrders: successfulOrders.length,
      totalSpent: successfulOrders.reduce((sum, o) => sum + (o.sellingPriceSnapshot || 0), 0),
      lastNetworkId: ordered[0]?.networkId || "Unknown",
      lastOrderDate: ordered[0] ? new Date(ordered[0].createdAt).toLocaleDateString() : "Never",
      lastOrderTimestamp: ordered[0] ? new Date(ordered[0].createdAt).getTime() : 0,
      status: successfulOrders.length > 0 ? "active" : "inactive",
      displayPhone,
    } as CustomerPageRow;
  }));

  return {
    customers: rows.sort((a, b) => b.lastOrderTimestamp - a.lastOrderTimestamp),
    hasNextPage,
    page: safePage,
    pageSize: safePageSize,
    nextCursor,
  };
}

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const docs = await fsQuery("customers", [{ field: "phone", op: "EQUAL", value: phone }]);
  return (docs[0] as Customer) ?? null;
}

export async function createOrUpdateCustomer(phone: string): Promise<Customer> {
  const existing = await getCustomerByPhone(phone);
  if (existing) return existing;

  const doc = await fsAdd("customers", {
    phone,
  });
  return doc as Customer;
}
