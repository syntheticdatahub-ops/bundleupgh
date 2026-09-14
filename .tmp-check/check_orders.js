import { getOrders } from "./src/lib/orders";
async function check() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Bypass SSL issue
    try {
        const orders = await getOrders();
        const counts = {};
        for (const order of orders) {
            const p = order.paymentStatus || "UNDEFINED";
            const f = order.fulfillmentStatus || "UNDEFINED";
            const key = `${p} + ${f}`;
            counts[key] = (counts[key] || 0) + 1;
        }
        console.log("ORDER STATUS COMBINATIONS:");
        console.log(JSON.stringify(counts, null, 2));
    }
    catch (error) {
        console.error("Error fetching orders:", error);
    }
}
check().then(() => process.exit(0));
