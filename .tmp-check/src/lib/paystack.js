import crypto from "node:crypto";
import https from "node:https";
export const PAYSTACK_API_BASE = "https://api.paystack.co";
export function getPaystackSecretKey() {
    var _a;
    return (_a = process.env.PAYSTACK_SECRET_KEY) !== null && _a !== void 0 ? _a : "";
}
export function getPaystackCallbackUrl() {
    if (process.env.PAYSTACK_CALLBACK_URL) {
        return process.env.PAYSTACK_CALLBACK_URL;
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/buy/callback`;
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}/buy/callback`;
    }
    return "http://localhost:3000/buy/callback";
}
export function generatePaystackReference(orderReference) {
    const suffix = Math.random().toString(36).slice(2, 9).toUpperCase();
    return `PAY-${orderReference.replace(/[^A-Z0-9-]/gi, "").slice(0, 18)}-${suffix}`;
}
export function verifyPaystackSignature(rawBody, signature, secret) {
    if (!signature || !secret)
        return false;
    const expected = crypto.createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");
    if (expected.length !== signature.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
export function toPaystackAmount(amount) {
    return Math.round(Number(amount || 0) * 100);
}
export function normalizePaystackAmount(value) {
    const n = Number(value !== null && value !== void 0 ? value : 0);
    return Number.isFinite(n) ? Math.round(n) : 0;
}
export async function initializePaystackTransaction({ amountInPesewas, email, reference, callbackUrl, }) {
    const secret = getPaystackSecretKey();
    if (!secret) {
        throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }
    const normalizedEmail = (email !== null && email !== void 0 ? email : "customer@bundleup.com").trim();
    const body = JSON.stringify({
        amount: amountInPesewas,
        currency: "GHS",
        email: normalizedEmail,
        reference,
        callback_url: callbackUrl,
    });
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: "api.paystack.co",
            path: "/transaction/initialize",
            method: "POST",
            family: 4,
            rejectUnauthorized: false,
            headers: {
                Authorization: `Bearer ${secret}`,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
            },
        }, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                var _a;
                try {
                    const payload = JSON.parse(data);
                    if (res.statusCode !== 200 || !(payload === null || payload === void 0 ? void 0 : payload.data)) {
                        reject(new Error((_a = payload === null || payload === void 0 ? void 0 : payload.message) !== null && _a !== void 0 ? _a : "Paystack initialization failed"));
                    }
                    else {
                        resolve(payload.data);
                    }
                }
                catch (e) {
                    reject(new Error("Invalid Paystack response"));
                }
            });
        });
        req.on("error", reject);
        req.setTimeout(8000, () => req.destroy(new Error("Paystack request timed out")));
        req.write(body);
        req.end();
    });
}
export async function verifyPaystackTransaction(reference) {
    const secret = getPaystackSecretKey();
    if (!secret) {
        throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: "api.paystack.co",
            path: `/transaction/verify/${encodeURIComponent(reference)}`,
            method: "GET",
            family: 4,
            rejectUnauthorized: false,
            headers: {
                Authorization: `Bearer ${secret}`,
            },
        }, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                var _a;
                try {
                    const payload = JSON.parse(data);
                    if (res.statusCode !== 200 || !(payload === null || payload === void 0 ? void 0 : payload.data)) {
                        reject(new Error((_a = payload === null || payload === void 0 ? void 0 : payload.message) !== null && _a !== void 0 ? _a : "Paystack verification failed"));
                    }
                    else {
                        resolve(payload.data);
                    }
                }
                catch (e) {
                    reject(new Error("Invalid Paystack response"));
                }
            });
        });
        req.on("error", reject);
        req.setTimeout(8000, () => req.destroy(new Error("Paystack request timed out")));
        req.end();
    });
}
