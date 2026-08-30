import { getOrders } from './src/lib/orders.ts';

const log = (label, value) => console.log(label, JSON.stringify(value, null, 2));

const res = await fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ recipientPhone: '+233200000800', networkId: 'mtn', bundleId: 'mtn-1gb' }),
});
const data = await res.json();
log('order', data);
if (!res.ok) process.exit(0);

const mockRes = await fetch('http://localhost:3000/api/payments/mock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: data.orderId, paymentId: data.paymentId, status: 'SUCCESS' }),
});
const mockData = await mockRes.json();
log('mock', mockData);

const orders = await getOrders();
const match = orders.filter((o) => o.publicReference === data.orderId);
log('match', match);

let successful = 0; let revenue = 0; let profit = 0;
for (const o of orders) {
  if (o.fulfillmentStatus === 'SUCCESS') {
    successful += 1;
    revenue += Number(o.sellingPriceSnapshot ?? 0);
    profit += Number(o.profitSnapshot ?? 0);
  }
}
log('totals', { successful, revenue, profit });
