require('dotenv').config({path:'.env.local'});
const https = require('node:https');
const crypto = require('node:crypto'); // needed? No.

const payload = JSON.stringify({
  structuredQuery: {
    from: [{ collectionId: 'orders' }],
    where: {
      compositeFilter: {
        op: 'OR',
        filters: [
          { fieldFilter: { field: { fieldPath: 'publicReference' }, op: 'EQUAL', value: { stringValue: 'BU-TRKBJN' } } },
          { fieldFilter: { field: { fieldPath: 'publicReference' }, op: 'EQUAL', value: { stringValue: 'BU-Z001XE' } } }
        ]
      }
    }
  }
});

const req = https.request({
  hostname: 'firestore.googleapis.com',
  path: '/v1/projects/' + process.env.FIREBASE_PROJECT_ID + '/databases/(default)/documents:runQuery',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  rejectUnauthorized: false
}, (res) => {
  let data = '';
  res.on('data', c => data+=c);
  res.on('end', () => {
    console.log(data);
  });
});
req.write(payload);
req.end();
