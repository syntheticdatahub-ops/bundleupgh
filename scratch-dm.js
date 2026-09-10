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
  // Let's try some known reference from the prompt MN-AI5103ZE
  console.log("order-status MN-AI5103ZE:");
  console.log(await fetchDM('/api/developer/order-status/MN-AI5103ZE'));
  
  console.log("\ndelivery-tracker MN-AI5103ZE:");
  console.log(await fetchDM('/api/developer/delivery-tracker?reference=MN-AI5103ZE'));
  
  // What if we try without reference?
  console.log("\ndelivery-tracker no ref:");
  console.log(await fetchDM('/api/developer/delivery-tracker'));
})();
