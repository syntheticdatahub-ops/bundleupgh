require('dotenv').config({ path: '.env.local' });
const https = require('https');
const crypto = require('crypto');
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r/g, '\n');

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ ...options, agent: new https.Agent({ rejectUnauthorized: false }), family: 4 }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => req.destroy(new Error('Request timed out')));
    if (body) req.write(body);
    req.end();
  });
}

let cache = null;
async function getAccessToken() {
  if (cache && Date.now() < cache.expiresAt) return cache.token;
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iss: clientEmail, scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now })).toString('base64url');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(privateKey, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;
  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const res = await httpsRequest({ hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, body);
  const data = JSON.parse(res);
  if (!data.access_token) throw new Error('auth failed: ' + JSON.stringify(data));
  cache = { token: data.access_token, expiresAt: (now + 3500) * 1000 };
  return data.access_token;
}

function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'object') {
    const fields = {};
    for (const [k, val] of Object.entries(v)) fields[k] = toValue(val);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function fromValue(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue?.values ?? []).map(fromValue);
  if ('mapValue' in v) {
    const out = {};
    for (const [k, val] of Object.entries(v.mapValue.fields || {})) out[k] = fromValue(val);
    return out;
  }
  return null;
}

function docToObject(doc) {
  const id = doc.name?.split('/').pop() || '';
  const out = { id };
  for (const [k, v] of Object.entries(doc.fields || {})) out[k] = fromValue(v);
  return out;
}

async function runQuery(filters = [], orderBy = null, limit = 10) {
  const token = await getAccessToken();
  const payload = { structuredQuery: { from: [{ collectionId: 'orders' }], ...(filters.length ? { where: { compositeFilter: { op: 'AND', filters: filters.map(f => ({ fieldFilter: { field: { fieldPath: f.field }, op: f.op, value: toValue(f.value) } })) } } } : {}), ...(orderBy ? { orderBy: [{ field: { fieldPath: orderBy.field }, direction: orderBy.direction }] } : {}), ...(limit ? { limit } : {}) } };
  const body = JSON.stringify(payload);
  const response = await httpsRequest({ hostname: 'firestore.googleapis.com', path: `/v1/projects/${projectId}/databases/(default)/documents:runQuery`, method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, body);
  const parsed = JSON.parse(response);
  if (parsed.error) throw new Error(JSON.stringify(parsed.error));
  return Array.isArray(parsed) ? parsed.filter(r => r.document).map(r => docToObject(r.document)) : [];
}

(async () => {
  try {
    const statuses = ['SUCCESS', 'PAID', 'NOT_APPLICABLE', 'PENDING', 'PROCESSING', 'FAILED', 'DELIVERED', 'REFUND_PENDING', 'REFUNDED', 'ON_HOLD'];
    for (const s of statuses) {
      const rows = await runQuery([{ field: 'paymentStatus', op: 'EQUAL', value: s }], { field: 'createdAt', direction: 'DESCENDING' }, 3);
      console.log('PAYMENT', s, rows.length, rows.slice(0, 2).map(r => ({ id: r.id, paymentStatus: r.paymentStatus, fulfillmentStatus: r.fulfillmentStatus, networkId: r.networkId, amount: r.sellingPriceSnapshot })));
    }
    const rows = await runQuery([], { field: 'createdAt', direction: 'DESCENDING' }, 5);
    console.log('LATEST', rows.map(r => ({ id: r.id, paymentStatus: r.paymentStatus, fulfillmentStatus: r.fulfillmentStatus, networkId: r.networkId, amount: r.sellingPriceSnapshot, createdAt: r.createdAt })));
  } catch (e) {
    console.error('ERR', e.stack || e);
    process.exit(1);
  }
})();
