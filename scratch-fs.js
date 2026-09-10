require('dotenv').config({path:'.env.local'});
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = getFirestore();

(async () => {
  const trk = await db.collection('orders').where('publicReference', '==', 'BU-TRKBJN').get();
  console.log("BU-TRKBJN:", trk.docs[0]?.data());

  const z00 = await db.collection('orders').where('publicReference', '==', 'BU-Z001XE').get();
  console.log("BU-Z001XE:", z00.docs[0]?.data());
})();
