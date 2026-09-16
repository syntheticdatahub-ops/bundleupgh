import { fsQuery, fsAdd, fsCount } from "./firestore-rest";
import { decodeCursor as decodeCursorToken, decodeCursorState, encodeCursor as encodeCursorToken, encodeCursorState } from "./pagination";
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
  return encodeCursorToken(doc, "customers");
}

export function decodeCursor(token: string): { id: string; createdAt: string; docPath: string } | null {
  return decodeCursorToken(token, "customers");
}

export { encodeCursorState, decodeCursorState };

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
  const cursorChain = decodeCursorState(cursor);
  const activeCursorToken = safePage > 1 ? cursorChain[safePage - 2] ?? null : null;
  const decodedCursor = activeCursorToken ? decodeCursor(activeCursorToken) : null;

  const orderBy = [
    { field: "createdAt", direction: "DESCENDING" as const },
    { field: "__name__", direction: "DESCENDING" as const },
  ];

  const docs = await fsQuery(
    "customers",
    [],
    orderBy,
    safePageSize + 1,
    decodedCursor
      ? {
          values: [decodedCursor.createdAt, { referenceValue: decodedCursor.docPath }],
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

  const rows = customers.map((customer) => {
    const cPhoneLocal = customer.phone.replace(/\D/g, "");
    const displayPhone = cPhoneLocal.length === 10 ? `+233 ${cPhoneLocal.slice(1).replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}` : customer.phone;

    return {
      ...customer,
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      lastNetworkId: "-",
      lastOrderDate: "-",
      lastOrderTimestamp: customer.createdAt ? new Date(customer.createdAt).getTime() : 0,
      status: "active",
      displayPhone,
    } as CustomerPageRow;
  });

  return {
    customers: rows,
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

export async function findCustomersByPhone(partial: string): Promise<Customer[]> {
  // Search by exact phone variants
  const { generatePhoneVariants } = await import("./phone");
  const variants = generatePhoneVariants(partial);
  
  const allDocs: Customer[] = [];
  const seen = new Set<string>();
  
  for (const variant of variants) {
    const docs = await fsQuery("customers", [{ field: "phone", op: "EQUAL", value: variant }]);
    for (const d of docs as Customer[]) {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        allDocs.push(d);
      }
    }
  }
  
  // Also try prefix-style: if nothing found, fall back to fetching all and filtering
  if (allDocs.length === 0) {
    const all = await fsQuery("customers", [], undefined, 1000);
    const normalized = partial.replace(/\D/g, "").toLowerCase();
    for (const d of all as Customer[]) {
      const dNorm = (d.phone || "").replace(/\D/g, "");
      if (dNorm.includes(normalized) && !seen.has(d.id)) {
        seen.add(d.id);
        allDocs.push(d);
      }
    }
  }
  
  return allDocs;
}

export async function getFilteredCustomers(
  minOrders: number,
  maxOrders: number | null,
  sortBy: string
): Promise<CustomerPageRow[]> {
  // Cap at 1000 — enough for any realistic customer base without runaway reads
  const docs = await fsQuery("customers", [], undefined, 1000);
  let customers = docs as Customer[];
  
  // Apply filters
  if (minOrders > 0) {
    customers = customers.filter(c => (c.totalOrders || 0) >= minOrders);
  }
  if (maxOrders !== null) {
    customers = customers.filter(c => (c.totalOrders || 0) <= maxOrders);
  }

  // Sort
  if (sortBy === "MOST_ACTIVE") {
    customers.sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0) || (b.totalSpent || 0) - (a.totalSpent || 0));
  } else if (sortBy === "HIGHEST_SPEND") {
    customers.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
  } else if (sortBy === "NEWEST") {
    customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === "OLDEST") {
    customers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  return customers.map((customer) => {
    const cPhoneLocal = customer.phone.replace(/\D/g, "");
    const displayPhone = cPhoneLocal.length === 10
      ? `+233 ${cPhoneLocal.slice(1).replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`
      : customer.phone;
    return {
      ...customer,
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      lastNetworkId: "-",
      lastOrderDate: "-",
      lastOrderTimestamp: customer.createdAt ? new Date(customer.createdAt).getTime() : 0,
      status: "active" as const,
      displayPhone,
    };
  });
}
