import { fsQuery, fsAdd, fsSet } from "./firestore-rest";
import type { Customer } from "@/types/domain";

export async function getCustomers(): Promise<Customer[]> {
  const docs = await fsQuery("customers", [], { field: "createdAt", direction: "DESCENDING" });
  return docs as Customer[];
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
