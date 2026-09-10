const https = require('node:https');

const DATAMART_API_KEY = "16801e75ae62a389141f75e0f5b58d32f3347a586d8f604d6f876385ca360b43";

function fetchDM(path) {
  return new Promise((resolve) => {
    https.request({
      hostname: 'api.datamartgh.shop',
      path,
      headers: { 'X-API-Key': DATAMART_API_KEY },
      family: 4,
      rejectUnauthorized: false
    }, (res) => {
      let data = '';
      res.on('data', d => data+=d);
      res.on('end', () => resolve(data));
    }).end();
  });
}

(async () => {
  console.log("order-status BU-TRKBJN:");
  console.log(await fetchDM('/api/developer/order-status/BU-TRKBJN'));

  console.log("order-status PAY-..."); // I don't know the Paystack reference for BU-TRKBJN
  
  console.log("delivery-tracker BU-TRKBJN:");
  console.log(await fetchDM('/api/developer/delivery-tracker?reference=BU-TRKBJN'));
})();
