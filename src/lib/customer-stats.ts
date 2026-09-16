import { fsGet, fsUpdate } from "./firestore-rest";
import type { Customer } from "@/types/domain";

export async function recordCustomerOrderSuccess(customerId: string, price: number) {
  if (!customerId) return;
  try {
    const customer = await fsGet("customers", customerId) as Customer | null;
    if (customer) {
      const currentOrders = customer.totalOrders || 0;
      const currentSpent = customer.totalSpent || 0;
      await fsUpdate("customers", customerId, {
        totalOrders: currentOrders + 1,
        totalSpent: currentSpent + price,
      });
    }
  } catch (err) {
    console.error(`Failed to update customer stats for ${customerId}:`, err);
  }
}
