"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsGet = fsGet;
exports.fsQuery = fsQuery;
exports.fsAggregateSum = fsAggregateSum;
exports.fsCount = fsCount;
exports.fsSet = fsSet;
exports.fsAdd = fsAdd;
exports.fsUpdate = fsUpdate;
exports.fsDelete = fsDelete;
/**
 * Firestore REST client — bypasses gRPC to work around SSL certificate
 * verification issues in environments where the system root CA is not
 * trusted by Node.js (common on corporate/Windows machines).
 *
 * Uses Node's native `https` module with rejectUnauthorized: false
 * so that it can connect to Google APIs regardless of the local cert chain.
 */
const https = __importStar(require("https"));
const crypto_1 = require("crypto");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = require("dotenv");
const envPath = node_path_1.default.resolve(process.cwd(), ".env.local");
if (node_fs_1.default.existsSync(envPath)) {
    (0, dotenv_1.config)({ path: envPath });
}
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "\n");
function ensureFirebaseConfig() {
    if (!projectId || !clientEmail || !privateKey || !privateKey.includes("BEGIN PRIVATE KEY")) {
        throw new Error("Firebase REST config is missing or malformed. Required env vars: NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.");
    }
}
// SSL bypass agent — required for Windows machines with broken CA chains
const agent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    maxSockets: 100,
});
function httpsRequest(options, body) {
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
        if (body)
            req.write(body);
        req.end();
    });
}
// Cache the token with expiry so we don't re-fetch on every request
let cachedToken = null;
async function getAccessToken() {
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
    const sign = (0, crypto_1.createSign)("RSA-SHA256");
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
    if (!data.access_token)
        throw new Error(`Auth failed: ${JSON.stringify(data)}`);
    cachedToken = { token: data.access_token, expiresAt: (now + 3500) * 1000 };
    return data.access_token;
}
function toFirestoreValue(v) {
    if (v === null || v === undefined)
        return { nullValue: null };
    if (typeof v === "string")
        return { stringValue: v };
    if (typeof v === "boolean")
        return { booleanValue: v };
    if (typeof v === "number")
        return { doubleValue: v };
    if (Array.isArray(v))
        return { arrayValue: { values: v.map(toFirestoreValue) } };
    if (typeof v === "object") {
        if (typeof v.referenceValue === "string")
            return { referenceValue: v.referenceValue };
        if (typeof v.__firestoreRefPath === "string")
            return { referenceValue: v.__firestoreRefPath };
        const fields = {};
        for (const [k, val] of Object.entries(v))
            fields[k] = toFirestoreValue(val);
        return { mapValue: { fields } };
    }
    return { stringValue: String(v) };
}
function fromFirestoreValue(v) {
    if (!v)
        return null;
    if ("stringValue" in v)
        return v.stringValue;
    if ("booleanValue" in v)
        return v.booleanValue;
    if ("integerValue" in v)
        return Number(v.integerValue);
    if ("doubleValue" in v)
        return v.doubleValue;
    if ("nullValue" in v)
        return null;
    if ("arrayValue" in v)
        return (v.arrayValue?.values ?? []).map(fromFirestoreValue);
    if ("mapValue" in v)
        return fromFields(v.mapValue?.fields ?? {});
    return null;
}
function fromFields(fields) {
    const result = {};
    for (const [k, v] of Object.entries(fields))
        result[k] = fromFirestoreValue(v);
    return result;
}
function docToObject(doc) {
    const id = doc.name?.split("/").pop() ?? "";
    return { id, ...fromFields(doc.fields ?? {}) };
}
// ── Public API ────────────────────────────────────────────────────────────────
const BASE = "firestore.googleapis.com";
const dbPath = (path) => `/v1/projects/${projectId}/databases/(default)/documents/${path}`;
async function fsGet(collection, docId) {
    const token = await getAccessToken();
    const response = await httpsRequest({
        hostname: BASE,
        path: dbPath(`${collection}/${docId}`),
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
    const doc = JSON.parse(response);
    if (doc.error)
        return null;
    return docToObject(doc);
}
function buildWhereClause(filters = [], groupOp = "AND") {
    if (filters.length === 0)
        return undefined;
    if (filters.length === 1) {
        return {
            fieldFilter: {
                field: { fieldPath: filters[0].field },
                op: filters[0].op,
                value: toFirestoreValue(filters[0].value),
            },
        };
    }
    return {
        compositeFilter: {
            op: groupOp,
            filters: filters.map((f) => ({
                fieldFilter: {
                    field: { fieldPath: f.field },
                    op: f.op,
                    value: toFirestoreValue(f.value),
                },
            })),
        },
    };
}
function buildOrderByClauses(orderBy) {
    const entries = Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : [];
    return entries.map((o) => ({
        field: { fieldPath: o.field },
        direction: o.direction ?? "ASCENDING",
    }));
}
async function fsQuery(collection, filters = [], orderBy, limit, cursor) {
    const token = await getAccessToken();
    const where = buildWhereClause(filters);
    const body = {
        structuredQuery: {
            from: [{ collectionId: collection }],
            ...(where ? { where } : {}),
            ...(orderBy ? { orderBy: buildOrderByClauses(orderBy) } : {}),
            ...(cursor?.values?.length ? { [cursor.mode ?? "startAfter"]: { values: cursor.values.map((v) => toFirestoreValue(v)) } } : {}),
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
    }
    catch (e) {
        throw new Error("Invalid JSON from Firestore runQuery: " + response);
    }
    if (results.error) {
        console.error("Firestore runQuery Error:", results.error);
        throw new Error(`Firestore query failed: ${results.error.message || JSON.stringify(results.error)}`);
    }
    if (!Array.isArray(results))
        return [];
    return results
        .filter((r) => r.document)
        .map((r) => docToObject(r.document));
}
async function fsAggregateSum(collection, fieldPath, filters = [], groupOp = "AND") {
    const token = await getAccessToken();
    const where = buildWhereClause(filters, groupOp);
    const body = {
        structuredQuery: {
            from: [{ collectionId: collection }],
            ...(where ? { where } : {}),
        },
        aggregations: [{ sum: { field: { fieldPath } } }],
    };
    const bodyStr = JSON.stringify(body);
    const response = await httpsRequest({
        hostname: BASE,
        path: `/v1/projects/${projectId}/databases/(default)/documents:runAggregationQuery`,
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyStr),
        },
    }, bodyStr);
    const data = JSON.parse(response);
    if (data.error) {
        throw new Error(`Firestore aggregation failed: ${data.error.message || JSON.stringify(data.error)}`);
    }
    const aggregateValue = Array.isArray(data) ? data[0]?.aggregateFields?.sum?.doubleValue ?? data[0]?.aggregateFields?.sum?.integerValue ?? 0 : 0;
    return Number(aggregateValue ?? 0);
}
async function fsCount(collection, filters = [], groupOp = "AND") {
    const token = await getAccessToken();
    const where = buildWhereClause(filters, groupOp);
    const body = {
        structuredQuery: {
            from: [{ collectionId: collection }],
            ...(where ? { where } : {}),
        },
        aggregations: [{ count: {} }],
    };
    const bodyStr = JSON.stringify(body);
    const response = await httpsRequest({
        hostname: BASE,
        path: `/v1/projects/${projectId}/databases/(default)/documents:runAggregationQuery`,
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyStr),
        },
    }, bodyStr);
    const data = JSON.parse(response);
    if (data.error) {
        throw new Error(`Firestore aggregation failed: ${data.error.message || JSON.stringify(data.error)}`);
    }
    const aggregateValue = Array.isArray(data) ? data[0]?.aggregateFields?.count?.integerValue : undefined;
    return Number(aggregateValue ?? 0);
}
async function fsSet(collection, docId, data, merge = false) {
    const token = await getAccessToken();
    const now = new Date().toISOString();
    const payloadData = { ...data, updatedAt: now };
    const fields = {};
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
    if (doc.error)
        throw new Error(JSON.stringify(doc.error));
    return docToObject(doc);
}
async function fsAdd(collection, data) {
    const token = await getAccessToken();
    const now = new Date().toISOString();
    const fields = {};
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
    if (doc.error)
        throw new Error(JSON.stringify(doc.error));
    return docToObject(doc);
}
async function fsUpdate(collection, docId, data) {
    await fsSet(collection, docId, data, true);
}
async function fsDelete(collection, docId) {
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
    }
    catch (error) {
        if (error.message?.includes("Unexpected token") || error.message?.includes("JSON")) {
            return;
        }
        throw error;
    }
}
