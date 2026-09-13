const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

const privateKey = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  })
});

const db = getFirestore(app);

async function check() {
  const snapshot = await db.collection('orders').get();
  const counts = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    const p = data.paymentStatus || "UNDEFINED";
    const f = data.fulfillmentStatus || "UNDEFINED";
    const key = `${p} + ${f}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  console.log("ORDER STATUS COMBINATIONS:");
  console.log(JSON.stringify(counts, null, 2));
}

check().catch(console.error).finally(() => process.exit(0));
