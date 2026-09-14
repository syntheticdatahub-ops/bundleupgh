import { fsQuery } from "./src/lib/firestore-rest";
async function run() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
        const orders = await fsQuery("orders", [], { field: "createdAt", direction: "DESCENDING" }, 5);
        console.log(JSON.stringify(orders, null, 2));
    }
    catch (err) {
        console.error(err);
    }
}
run();
