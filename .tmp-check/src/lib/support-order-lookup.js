import { findOrdersByRecipientPhone } from "@/lib/orders";
import { normalizePhone } from "@/lib/phone";
export function maskPhone(phone) {
    const clean = phone.replace(/\D/g, "");
    if (clean.length <= 6)
        return "****";
    return clean.slice(0, 3) + "Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢" + clean.slice(-2);
}
export function toSupportOrder(doc) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return {
        id: (_a = doc.id) !== null && _a !== void 0 ? _a : "",
        orderReference: (_c = (_b = doc.publicReference) !== null && _b !== void 0 ? _b : doc.id) !== null && _c !== void 0 ? _c : "",
        network: (_d = doc.networkId) !== null && _d !== void 0 ? _d : "",
        bundleName: (_e = doc.bundleNameSnapshot) !== null && _e !== void 0 ? _e : "",
        bundleSize: (_f = doc.dataSizeSnapshot) !== null && _f !== void 0 ? _f : "",
        recipientPhoneMasked: maskPhone((_g = doc.recipientPhone) !== null && _g !== void 0 ? _g : ""),
        amount: Number((_h = doc.sellingPriceSnapshot) !== null && _h !== void 0 ? _h : 0),
        paymentStatus: ((_j = doc.paymentStatus) !== null && _j !== void 0 ? _j : "PENDING").toUpperCase(),
        fulfillmentStatus: ((_k = doc.fulfillmentStatus) !== null && _k !== void 0 ? _k : "PENDING").toUpperCase(),
        createdAt: (_l = doc.createdAt) !== null && _l !== void 0 ? _l : "",
    };
}
export async function lookupOrdersByPhoneNumber(rawPhone, limit = 5) {
    const normalized = normalizePhone(rawPhone);
    if (!normalized) {
        return [];
    }
    const allOrders = await findOrdersByRecipientPhone(normalized);
    allOrders.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
    });
    // Only surface operational (paid) orders. Unpaid/abandoned checkout attempts
    // (paymentStatus = PENDING or FAILED) are not shown to customers or support agents.
    const operationalOrders = allOrders.filter((o) => {
        var _a;
        const status = ((_a = o.paymentStatus) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
        return status === "SUCCESS" || status === "PAID" || status === "NOT_APPLICABLE";
    });
    return operationalOrders.slice(0, limit).map(toSupportOrder);
}
