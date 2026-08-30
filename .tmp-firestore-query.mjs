import fs from 'node:fs';
import https from 'node:https';
import crypto from 'node:crypto';
import path from 'node:path';

const env = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
for (const line of env.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ ...options, rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const now = Math.floor(Date.now() / 1000);
const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({
  iss: clientEmail,
  scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase',
  aud: 'https://oauth2.googleapis.com/token',
  exp: now + 3600,
  iat: now,
})).toString('base64url');
const signer = crypto.createSign('RSA-SHA256');
signer.update(`${header}.${payload}`);
const signature = signer.sign(privateKey, 'base64url');
const jwt = `${header}.${payload}.${signature}`;
const tokenBody = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;

const authRes = await request({
  hostname: 'oauth2.googleapis.com',
  path: '/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(tokenBody),
  },
}, tokenBody);

if (authRes.status !== 200) {
  console.error('Auth failed', authRes.data);
  process.exit(1);
}

const accessToken = JSON.parse(authRes.data).access_token;
const runCollectionQuery = async (collectionId, limit = 10) => {
  const queryBody = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit,
    },
  });

  const queryRes = await request({
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(queryBody),
    },
  }, queryBody);

  const rows = JSON.parse(queryRes.data);
  console.log(`COLLECTION ${collectionId} STATUS ${queryRes.status} ROWS ${rows.length}`);

  for (const row of rows) {
    const doc = row.document;
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
      ...out,
    }, null, 2));
  }
};

await runCollectionQuery('orders', 10);
await runCollectionQuery('bundles', 10);
await runCollectionQuery('networks', 10);
