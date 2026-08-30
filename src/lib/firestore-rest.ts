/**
 * Firestore REST client — bypasses gRPC to work around SSL certificate
 * verification issues in environments where the system root CA is not
 * trusted by Node.js (common on corporate/Windows machines).
 *
 * Uses Node's native `https` module with rejectUnauthorized: false
 * so that it can connect to Google APIs regardless of the local cert chain.
 */
import * as https from "https";
import { createSign } from "crypto";
import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath });
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "")
  .replace(/\\r\\n/g, "\n")
  .replace(/\\n/g, "\n")
  .replace(/\r/g, "\n");

function ensureFirebaseConfig() {
  if (!projectId || !clientEmail || !privateKey || !privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "Firebase REST config is missing or malformed. Required env vars: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
    );
  }
}

// SSL bypass agent — required for Windows machines with broken CA chains
const agent = new https.Agent({ 
  rejectUnauthorized: false,
  keepAlive: true,
  maxSockets: 100,
});

function httpsRequest(options: https.RequestOptions, body?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request({ ...options, agent, family: 4 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(8000, () => {
      req.destroy(new Error("Request timed out"));
    });
    if (body) req.write(body);
    req.end();
  });
}

// Cache the token with expiry so we don't re-fetch on every request
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  ensureFirebaseConfig();

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");

  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(privateKey, "base64url");
  const jwt = `${header}.${payload}.${signature}`;

  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const response = await httpsRequest({
    hostname: "oauth2.googleapis.com",
    path: "/token",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body),
    },
  }, body);

  const data = JSON.parse(response);
  if (!data.access_token) throw new Error(`Auth failed: ${JSON.stringify(data)}`);

  cachedToken = { token: data.access_token, expiresAt: (now + 3500) * 1000 };
  return data.access_token;
}

function toFirestoreValue(v: any): any {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === "object") {
    const fields: Record<string, any> = {};
    for (const [k, val] of Object.entries(v)) fields[k] = toFirestoreValue(val);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function fromFirestoreValue(v: any): any {
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue?.values ?? []).map(fromFirestoreValue);
  if ("mapValue" in v) return fromFields(v.mapValue?.fields ?? {});
  return null;
}

function fromFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) result[k] = fromFirestoreValue(v);
  return result;
}

function docToObject(doc: any): any {
  const id = doc.name?.split("/").pop() ?? "";
  return { id, ...fromFields(doc.fields ?? {}) };
}

// ── Public API ────────────────────────────────────────────────────────────────

const BASE = "firestore.googleapis.com";
const dbPath = (path: string) =>
  `/v1/projects/${projectId}/databases/(default)/documents/${path}`;

export async function fsGet(collection: string, docId: string): Promise<any | null> {
  const token = await getAccessToken();
  const response = await httpsRequest({
    hostname: BASE,
    path: dbPath(`${collection}/${docId}`),
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const doc = JSON.parse(response);
  if (doc.error) return null;
  return docToObject(doc);
}

export async function fsQuery(
  collection: string,
  filters: Array<{ field: string; op: string; value: any }> = [],
  orderBy?: { field: string; direction?: "ASCENDING" | "DESCENDING" },
  limit?: number,
): Promise<any[]> {
  const token = await getAccessToken();

  const where = filters.length > 0
    ? filters.length === 1
      ? {
          fieldFilter: {
            field: { fieldPath: filters[0].field },
            op: filters[0].op,
            value: toFirestoreValue(filters[0].value),
          },
        }
      : {
          compositeFilter: {
            op: "AND",
            filters: filters.map((f) => ({
              fieldFilter: {
                field: { fieldPath: f.field },
                op: f.op,
                value: toFirestoreValue(f.value),
              },
            })),
          },
        }
    : undefined;

  const body: any = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      ...(where ? { where } : {}),
      ...(orderBy ? { orderBy: [{ field: { fieldPath: orderBy.field }, direction: orderBy.direction ?? "ASCENDING" }] } : {}),
      ...(limit ? { limit } : {}),
    },
  };

  const bodyStr = JSON.stringify(body);
  const response = await httpsRequest({
    hostname: BASE,
    path: `/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(bodyStr),
    },
  }, bodyStr);

  let results;
  try {
    results = JSON.parse(response);
  } catch (e) {
    throw new Error("Invalid JSON from Firestore runQuery: " + response);
  }

  if (results.error) {
    console.error("Firestore runQuery Error:", results.error);
    throw new Error(`Firestore query failed: ${results.error.message || JSON.stringify(results.error)}`);
  }
  if (!Array.isArray(results)) return [];
  return results
    .filter((r: any) => r.document)
    .map((r: any) => docToObject(r.document));
}

export async function fsSet(collection: string, docId: string, data: Record<string, any>, merge: boolean = false): Promise<any> {
  const token = await getAccessToken();
  const now = new Date().toISOString();
  
  const payloadData = { ...data, updatedAt: now };
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(payloadData)) {
    fields[k] = toFirestoreValue(v);
  }
  
  let path = dbPath(`${collection}/${docId}`);
  if (merge) {
    const maskParams = Object.keys(payloadData).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
    path += `?${maskParams}`;
  }

  const bodyStr = JSON.stringify({ fields });
  const response = await httpsRequest({
    hostname: BASE,
    path,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(bodyStr),
    },
  }, bodyStr);
  
  const doc = JSON.parse(response);
  if (doc.error) throw new Error(JSON.stringify(doc.error));
  return docToObject(doc);
}

export async function fsAdd(collection: string, data: Record<string, any>): Promise<any> {
  const token = await getAccessToken();
  const now = new Date().toISOString();
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries({ ...data, createdAt: now, updatedAt: now })) {
    fields[k] = toFirestoreValue(v);
  }
  const bodyStr = JSON.stringify({ fields });
  const response = await httpsRequest({
    hostname: BASE,
    path: dbPath(collection),
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(bodyStr),
    },
  }, bodyStr);
  const doc = JSON.parse(response);
  if (doc.error) throw new Error(JSON.stringify(doc.error));
  return docToObject(doc);
}

export async function fsUpdate(collection: string, docId: string, data: Record<string, any>): Promise<void> {
  await fsSet(collection, docId, data, true);
}

export async function fsDelete(collection: string, docId: string): Promise<void> {
  const token = await getAccessToken();
  const response = await httpsRequest({
    hostname: BASE,
    path: dbPath(`${collection}/${docId}`),
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response || response.trim() === "") {
    return;
  }

  try {
    const parsed = JSON.parse(response);
    if (parsed.error) {
      throw new Error(parsed.error.message || JSON.stringify(parsed.error));
    }
  } catch (error: any) {
    if (error.message?.includes("Unexpected token") || error.message?.includes("JSON")) {
      return;
    }
    throw error;
  }
}
