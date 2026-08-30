import crypto from "node:crypto";
import https from "node:https";

export const PAYSTACK_API_BASE = "https://api.paystack.co";

export function getPaystackSecretKey(): string {
  return process.env.PAYSTACK_SECRET_KEY ?? "";
}

export function getPaystackCallbackUrl(): string {
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

export function generatePaystackReference(orderReference: string): string {
  const suffix = Math.random().toString(36).slice(2, 9).toUpperCase();
  return `PAY-${orderReference.replace(/[^A-Z0-9-]/gi, "").slice(0, 18)}-${suffix}`;
}

export function verifyPaystackSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;

  const expected = crypto.createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");

  if (expected.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function toPaystackAmount(amount: number): number {
  return Math.round(Number(amount || 0) * 100);
}

export function normalizePaystackAmount(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export async function initializePaystackTransaction({
  amountInPesewas,
  email,
  reference,
  callbackUrl,
}: {
  amountInPesewas: number;
  email?: string;
  reference: string;
  callbackUrl: string;
}) {
  const secret = getPaystackSecretKey();
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const normalizedEmail = (email ?? "customer@bundleup.com").trim();
  const body = JSON.stringify({
    amount: amountInPesewas,
    currency: "GHS",
    email: normalizedEmail,
    reference,
    callback_url: callbackUrl,
  });

  return new Promise<any>((resolve, reject) => {
    const req = https.request(
      {
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
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const payload = JSON.parse(data);
            if (res.statusCode !== 200 || !payload?.data) {
              reject(new Error(payload?.message ?? "Paystack initialization failed"));
            } else {
              resolve(payload.data);
            }
          } catch (e) {
            reject(new Error("Invalid Paystack response"));
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(8000, () => req.destroy(new Error("Paystack request timed out")));
    req.write(body);
    req.end();
  });
}

export async function verifyPaystackTransaction(reference: string) {
  const secret = getPaystackSecretKey();
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  return new Promise<any>((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.paystack.co",
        path: `/transaction/verify/${encodeURIComponent(reference)}`,
        method: "GET",
        family: 4,
        rejectUnauthorized: false,
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const payload = JSON.parse(data);
            if (res.statusCode !== 200 || !payload?.data) {
              reject(new Error(payload?.message ?? "Paystack verification failed"));
            } else {
              resolve(payload.data);
            }
          } catch (e) {
            reject(new Error("Invalid Paystack response"));
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(8000, () => req.destroy(new Error("Paystack request timed out")));
    req.end();
  });
}
