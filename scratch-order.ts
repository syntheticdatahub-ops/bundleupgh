const { getOrderByPublicReference } = require('./src/lib/orders');

async function run() {
  const order = await getOrderByPublicReference("BU-57ZGQO");
  console.log(JSON.stringify(order, null, 2));
}

run();
