/**
 * Seed script using Firestore REST API with https module (bypasses fetch SSL issues)
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createSign } from "crypto";
import * as https from "https";

// --- Load .env.local manually ---
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^=]+)="?([^"]*)"?$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}
const projectId = envVars["NEXT_PUBLIC_FIREBASE_PROJECT_ID"];
const clientEmail = envVars["FIREBASE_CLIENT_EMAIL"];
const privateKey = envVars["FIREBASE_PRIVATE_KEY"]?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing credentials in .env.local");
  process.exit(1);
}

// HTTPS agent that ignores SSL verification (needed for Windows corporate cert issues)
const agent = new https.Agent({ rejectUnauthorized: false });

function httpsRequest(options: https.RequestOptions, body?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request({ ...options, agent }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// --- Get OAuth2 access token via JWT ---
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");

  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(privateKey!, "base64url");
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
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

// --- Write a Firestore document via REST ---
async function setDoc(token: string, collection: string, docId: string, fields: Record<string, any>) {
  const now = new Date().toISOString();
  const firestoreFields: Record<string, any> = {};
  for (const [k, v] of Object.entries({ ...fields, createdAt: now, updatedAt: now })) {
    if (typeof v === "string") firestoreFields[k] = { stringValue: v };
    else if (typeof v === "boolean") firestoreFields[k] = { booleanValue: v };
    else if (typeof v === "number") firestoreFields[k] = { doubleValue: v };
  }
  const bodyStr = JSON.stringify({ fields: firestoreFields });
  const path = `/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const response = await httpsRequest({
    hostname: "firestore.googleapis.com",
    path,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(bodyStr),
    },
  }, bodyStr);
  const result = JSON.parse(response);
  if (result.error) throw new Error(JSON.stringify(result.error));
}

async function addDoc(token: string, collection: string, fields: Record<string, any>) {
  const now = new Date().toISOString();
  const firestoreFields: Record<string, any> = {};
  for (const [k, v] of Object.entries({ ...fields, createdAt: now, updatedAt: now })) {
    if (typeof v === "string") firestoreFields[k] = { stringValue: v };
    else if (typeof v === "boolean") firestoreFields[k] = { booleanValue: v };
    else if (typeof v === "number") firestoreFields[k] = { doubleValue: v };
  }
  const bodyStr = JSON.stringify({ fields: firestoreFields });
  const path = `/v1/projects/${projectId}/databases/(default)/documents/${collection}`;
  const response = await httpsRequest({
    hostname: "firestore.googleapis.com",
    path,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(bodyStr),
    },
  }, bodyStr);
  const result = JSON.parse(response);
  if (result.error) throw new Error(JSON.stringify(result.error));
}

async function seed() {
  console.log("Getting access token...");
  const token = await getAccessToken();
  console.log("✓ Authenticated\n");

  const networks = [
    { code: "mtn",        name: "MTN",        color: "#FFCC00", active: true },
    { code: "telecel",    name: "Telecel",     color: "#E20010", active: true },
    { code: "airteltigo", name: "AirtelTigo",  color: "#0032A0", active: true },
  ];

  console.log("Seeding networks...");
  for (const net of networks) {
    await setDoc(token, "networks", net.code, net);
    console.log(`  ✓ ${net.name}`);
  }

  const bundles = [
    { id: "mtn-500mb", networkId: "mtn", name: "500MB", dataSize: "500MB", validity: "1 Day", providerCost: 2.0, sellingPrice: 3.0, active: true },
    { id: "mtn-1gb", networkId: "mtn", name: "1GB", dataSize: "1GB", validity: "7 Days", providerCost: 4.0, sellingPrice: 5.5, active: true, tag: "popular" },
    { id: "mtn-2gb", networkId: "mtn", name: "2GB", dataSize: "2GB", validity: "30 Days", providerCost: 7.5, sellingPrice: 10.0, active: true },
    { id: "mtn-5gb", networkId: "mtn", name: "5GB", dataSize: "5GB", validity: "30 Days", providerCost: 17.0, sellingPrice: 22.0, active: true, tag: "best-value" },
    { id: "mtn-10gb", networkId: "mtn", name: "10GB", dataSize: "10GB", validity: "30 Days", providerCost: 32.0, sellingPrice: 42.0, active: true },
    { id: "tel-500mb", networkId: "telecel", name: "500MB", dataSize: "500MB", validity: "1 Day", providerCost: 1.8, sellingPrice: 2.8, active: true },
    { id: "tel-1gb", networkId: "telecel", name: "1GB", dataSize: "1GB", validity: "7 Days", providerCost: 3.8, sellingPrice: 5.2, active: true, tag: "popular" },
    { id: "tel-2gb", networkId: "telecel", name: "2GB", dataSize: "2GB", validity: "30 Days", providerCost: 7.0, sellingPrice: 9.5, active: true },
    { id: "tel-5gb", networkId: "telecel", name: "5GB", dataSize: "5GB", validity: "30 Days", providerCost: 16.0, sellingPrice: 21.0, active: true, tag: "best-value" },
    { id: "tel-10gb", networkId: "telecel", name: "10GB", dataSize: "10GB", validity: "30 Days", providerCost: 30.0, sellingPrice: 40.0, active: true },
    { id: "at-500mb", networkId: "airteltigo", name: "500MB", dataSize: "500MB", validity: "1 Day", providerCost: 1.9, sellingPrice: 2.9, active: true },
    { id: "at-1gb", networkId: "airteltigo", name: "1GB", dataSize: "1GB", validity: "7 Days", providerCost: 3.9, sellingPrice: 5.3, active: true, tag: "popular" },
    { id: "at-2gb", networkId: "airteltigo", name: "2GB", dataSize: "2GB", validity: "30 Days", providerCost: 7.2, sellingPrice: 9.8, active: true },
    { id: "at-5gb", networkId: "airteltigo", name: "5GB", dataSize: "5GB", validity: "30 Days", providerCost: 16.5, sellingPrice: 21.5, active: true, tag: "best-value" },
    { id: "at-10gb", networkId: "airteltigo", name: "10GB", dataSize: "10GB", validity: "30 Days", providerCost: 31.0, sellingPrice: 41.0, active: false },
  ];

  console.log("\nSeeding bundles...");
  for (const bundle of bundles) {
    await setDoc(token, "bundles", bundle.id, { ...bundle, id: bundle.id });
    console.log(`  ✓ ${bundle.networkId} ${bundle.dataSize}`);
  }

  console.log("\n✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
