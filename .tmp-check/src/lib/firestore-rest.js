var _a, _b, _c;
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
const projectId = (_a = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) !== null && _a !== void 0 ? _a : "";
const clientEmail = (_b = process.env.FIREBASE_CLIENT_EMAIL) !== null && _b !== void 0 ? _b : "";
const privateKey = ((_c = process.env.FIREBASE_PRIVATE_KEY) !== null && _c !== void 0 ? _c : "")
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
        const req = https.request(Object.assign(Object.assign({}, options), { agent, family: 4 }), (res) => {
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
    var _a, _b, _c, _d;
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
        return ((_b = (_a = v.arrayValue) === null || _a === void 0 ? void 0 : _a.values) !== null && _b !== void 0 ? _b : []).map(fromFirestoreValue);
    if ("mapValue" in v)
        return fromFields((_d = (_c = v.mapValue) === null || _c === void 0 ? void 0 : _c.fields) !== null && _d !== void 0 ? _d : {});
    return null;
}
function fromFields(fields) {
    const result = {};
    for (const [k, v] of Object.entries(fields))
        result[k] = fromFirestoreValue(v);
    return result;
}
function docToObject(doc) {
    var _a, _b, _c;
    const id = (_b = (_a = doc.name) === null || _a === void 0 ? void 0 : _a.split("/").pop()) !== null && _b !== void 0 ? _b : "";
    return Object.assign({ id }, fromFields((_c = doc.fields) !== null && _c !== void 0 ? _c : {}));
}
// ── Public API ────────────────────────────────────────────────────────────────
const BASE = "firestore.googleapis.com";
const dbPath = (path) => `/v1/projects/${projectId}/databases/(default)/documents/${path}`;
export async function fsGet(collection, docId) {
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
    return entries.map((o) => {
        var _a;
        return ({
            field: { fieldPath: o.field },
            direction: (_a = o.direction) !== null && _a !== void 0 ? _a : "ASCENDING",
        });
    });
}
export async function fsQuery(collection, filters = [], orderBy, limit, cursor) {
    var _a, _b;
    const token = await getAccessToken();
    const where = buildWhereClause(filters);
    const body = {
        structuredQuery: Object.assign(Object.assign(Object.assign(Object.assign({ from: [{ collectionId: collection }] }, (where ? { where } : {})), (orderBy ? { orderBy: buildOrderByClauses(orderBy) } : {})), (((_a = cursor === null || cursor === void 0 ? void 0 : cursor.values) === null || _a === void 0 ? void 0 : _a.length) ? { [(_b = cursor.mode) !== null && _b !== void 0 ? _b : "startAfter"]: { values: cursor.values.map((v) => toFirestoreValue(v)) } } : {})), (limit ? { limit } : {})),
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
export async function fsAggregateSum(collection, fieldPath, filters = [], groupOp = "AND") {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const token = await getAccessToken();
    const where = buildWhereClause(filters, groupOp);
    const body = {
        structuredQuery: Object.assign({ from: [{ collectionId: collection }] }, (where ? { where } : {})),
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
    const aggregateValue = Array.isArray(data) ? (_h = (_d = (_c = (_b = (_a = data[0]) === null || _a === void 0 ? void 0 : _a.aggregateFields) === null || _b === void 0 ? void 0 : _b.sum) === null || _c === void 0 ? void 0 : _c.doubleValue) !== null && _d !== void 0 ? _d : (_g = (_f = (_e = data[0]) === null || _e === void 0 ? void 0 : _e.aggregateFields) === null || _f === void 0 ? void 0 : _f.sum) === null || _g === void 0 ? void 0 : _g.integerValue) !== null && _h !== void 0 ? _h : 0 : 0;
    return Number(aggregateValue !== null && aggregateValue !== void 0 ? aggregateValue : 0);
}
export async function fsCount(collection, filters = [], groupOp = "AND") {
    var _a, _b, _c;
    const token = await getAccessToken();
    const where = buildWhereClause(filters, groupOp);
    const body = {
        structuredQuery: Object.assign({ from: [{ collectionId: collection }] }, (where ? { where } : {})),
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
    const aggregateValue = Array.isArray(data) ? (_c = (_b = (_a = data[0]) === null || _a === void 0 ? void 0 : _a.aggregateFields) === null || _b === void 0 ? void 0 : _b.count) === null || _c === void 0 ? void 0 : _c.integerValue : undefined;
    return Number(aggregateValue !== null && aggregateValue !== void 0 ? aggregateValue : 0);
}
export async function fsSet(collection, docId, data, merge = false) {
    const token = await getAccessToken();
    const now = new Date().toISOString();
    const payloadData = Object.assign(Object.assign({}, data), { updatedAt: now });
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
export async function fsAdd(collection, data) {
    const token = await getAccessToken();
    const now = new Date().toISOString();
    const fields = {};
    for (const [k, v] of Object.entries(Object.assign(Object.assign({}, data), { createdAt: now, updatedAt: now }))) {
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
export async function fsUpdate(collection, docId, data) {
    await fsSet(collection, docId, data, true);
}
export async function fsDelete(collection, docId) {
    var _a, _b;
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
        if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes("Unexpected token")) || ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes("JSON"))) {
            return;
        }
        throw error;
    }
}
