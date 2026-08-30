const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i < 0) continue;
  const k = line.slice(0, i).trim();
  let v = line.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  process.env[k] = v;
}
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r/g, '\n');
function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}
(async () => {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(privateKey, 'base64url');
  const jwt = `${header}.${payload}.${signature}`;
  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const authResponse = JSON.parse(await request({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, body));
  const token = authResponse.access_token;
  const query = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: 'orders' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit: 20
    }
  });
  const response = JSON.parse(await request({
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(query)
    }
  }, query));
  for (const item of response) {
    const doc = item.document;
    if (!doc) continue;
    const fields = doc.fields || {};
    const out = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v.stringValue !== undefined) out[k] = v.stringValue;
      else if (v.doubleValue !== undefined) out[k] = Number(v.doubleValue);
      else if (v.integerValue !== undefined) out[k] = Number(v.integerValue);
      else if (v.booleanValue !== undefined) out[k] = v.booleanValue;
      else if (v.mapValue !== undefined) out[k] = v.mapValue;
      else if (v.arrayValue !== undefined) out[k] = v.arrayValue;
      else if (v.nullValue !== undefined) out[k] = null;
      else out[k] = v;
    }
    console.log(JSON.stringify({
      id: doc.name.split('/').pop(),
      publicReference: out.publicReference,
      providerReference: out.providerReference,
      sellingPriceSnapshot: out.sellingPriceSnapshot,
      paymentStatus: out.paymentStatus,
      fulfillmentStatus: out.fulfillmentStatus,
      createdAt: out.createdAt,
      bundleId: out.bundleId,
      networkId: out.networkId,
    }, null, 2));
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
