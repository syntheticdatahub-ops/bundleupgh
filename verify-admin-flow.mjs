import fs from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) config({ path: envPath });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!projectId || !clientEmail || !privateKey || !apiKey) {
  console.log(JSON.stringify({ ok: false, reason: 'missing firebase env' }, null, 2));
  process.exit(1);
}

const { initializeApp, credential } = await import('firebase-admin');
initializeApp({ credential: credential.cert({ projectId, clientEmail, privateKey }) });
const { getAuth } = await import('firebase-admin/auth');

const email = 'phase45-admin@test.local';
const password = 'TestPass123!';

const user = await getAuth().getUserByEmail(email).catch(() => null);
if (!user) {
  await getAuth().createUser({ email, password, emailVerified: true });
}

const signIn = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, returnSecureToken: true }),
});
const signData = await signIn.json();
if (!signIn.ok || !signData.idToken) {
  console.log(JSON.stringify({ ok: false, reason: 'firebase sign-in failed', data: signData }, null, 2));
  process.exit(1);
}

const sessionRes = await fetch('http://localhost:3000/api/auth/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: signData.idToken }),
});
const sessionSet = sessionRes.headers.get('set-cookie');
if (!sessionRes.ok || !sessionSet) {
  console.log(JSON.stringify({ ok: false, reason: 'session cookie failed', status: sessionRes.status, body: await sessionRes.text() }, null, 2));
  process.exit(1);
}

const cookies = Array.from(sessionRes.headers.getSetCookie?.() ?? [sessionSet]);
const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');
const pages = ['/admin', '/admin/orders', '/admin/transactions', '/admin/customers'];
const results = [];

for (const pathName of pages) {
  const res = await fetch(`http://localhost:3000${pathName}`, {
    headers: { cookie: cookieHeader },
  });
  const html = await res.text();
  results.push({ path: pathName, status: res.status, hasHtml: html.length > 0, len: html.length });
}

const orderPayload = {
  recipientPhone: '+233200000099',
  networkId: 'mtn',
  bundleId: 'mtn-1gb',
};

const orderRes = await fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderPayload),
});
const orderData = await orderRes.json();
console.log(JSON.stringify({ orderInit: { status: orderRes.status, body: orderData } }, null, 2));

const ref = orderData.orderId;

for (let i = 0; i < 15; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  const adminPage = await fetch('http://localhost:3000/admin', { headers: { cookie: cookieHeader } });
  const html = await adminPage.text();
  const found = html.includes(ref) || html.includes('+233200000099'.slice(0, 5));
  console.log(JSON.stringify({ pollCheck: i + 1, status: adminPage.status, found, ref }, null, 2));
  if (found) break;
}

for (const pathName of pages) {
  const res = await fetch(`http://localhost:3000${pathName}`, { headers: { cookie: cookieHeader } });
  const html = await res.text();
  console.log(JSON.stringify({ finalPageCheck: pathName, status: res.status, containsRef: html.includes(ref), containsMaskedPhone: html.includes('+233200000099'.slice(0, 5)), containsPrice: html.includes('GHS') }, null, 2));
}

console.log(JSON.stringify({ results }, null, 2));
