const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const path = require('path');

const env = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
for (const line of env.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

function httpsRequest(options, body) {
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
  const tokenBody = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const tokenRes = await httpsRequest({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(tokenBody),
    },
  }, tokenBody);
  console.log('TOKEN_STATUS', tokenRes.status);
  const token = JSON.parse(tokenRes.data).access_token;

  const payloadDoc = {
    fields: {
      customerId: { stringValue: 'probe' },
      recipientPhone: { stringValue: '+233200000000' },
      networkId: { stringValue: 'mtn' },
      detectedNetworkId: { stringValue: 'mtn' },
      bundleId: { stringValue: 'mtn-1gb' },
      bundleNameSnapshot: { stringValue: 'MTN 1GB' },
      dataSizeSnapshot: { stringValue: '1GB' },
      providerCostSnapshot: { doubleValue: 4.5 },
      sellingPriceSnapshot: { doubleValue: 5.5 },
      profitSnapshot: { doubleValue: 1.0 },
      paymentStatus: { stringValue: 'PENDING' },
      fulfillmentStatus: { stringValue: 'PENDING' },
      createdAt: { stringValue: new Date().toISOString() },
      updatedAt: { stringValue: new Date().toISOString() },
    }
  };

  const createRes = await httpsRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${projectId}/databases/(default)/documents/orders`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(payloadDoc)),
    },
  }, JSON.stringify(payloadDoc));
  console.log('CREATE_STATUS', createRes.status);
  console.log('CREATE_BODY', createRes.data.slice(0, 400));

  const queryBody = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: 'orders' }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit: 5,
    }
  });

  const queryRes = await httpsRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(queryBody),
    },
  }, queryBody);
  console.log('QUERY_STATUS', queryRes.status);
  console.log('QUERY_BODY', queryRes.data.slice(0, 800));
})();
