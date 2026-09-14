import { fsCount, fsAggregateSum, fsQuery } from './src/lib/firestore-rest.ts';

const paymentStatuses = ['SUCCESS', 'PAID', 'NOT_APPLICABLE'];
const fulfillmentSuccessStatuses = ['SUCCESS', 'DELIVERED'];
const fulfillmentPendingStatuses = ['PROCESSING', 'ON_HOLD', 'PENDING'];
const fulfillmentFailureStatuses = ['FAILED', 'REFUND_PENDING', 'REFUNDED'];

async function run() {
  try {
    const totalOrders = await Promise.all(paymentStatuses.map((status) => fsCount('orders', [{ field: 'paymentStatus', op: 'EQUAL', value: status }]))).then((values) => values.reduce((sum, value) => sum + value, 0));
    const deliveredOrders = await Promise.all(fulfillmentSuccessStatuses.map((status) => fsCount('orders', [{ field: 'fulfillmentStatus', op: 'EQUAL', value: status }]))).then((values) => values.reduce((sum, value) => sum + value, 0));
    const pendingOrders = await Promise.all(fulfillmentPendingStatuses.map((status) => fsCount('orders', [{ field: 'fulfillmentStatus', op: 'EQUAL', value: status }]))).then((values) => values.reduce((sum, value) => sum + value, 0));
    const failedOrders = await Promise.all(fulfillmentFailureStatuses.map((status) => fsCount('orders', [{ field: 'fulfillmentStatus', op: 'EQUAL', value: status }]))).then((values) => values.reduce((sum, value) => sum + value, 0));
    const totalRevenue = await Promise.all(paymentStatuses.map((status) => fsAggregateSum('orders', 'sellingPriceSnapshot', [{ field: 'paymentStatus', op: 'EQUAL', value: status }]))).then((values) => values.reduce((sum, value) => sum + value, 0));
    const estimatedProfit = await Promise.all(paymentStatuses.map((status) => fsAggregateSum('orders', 'profitSnapshot', [{ field: 'paymentStatus', op: 'EQUAL', value: status }]))).then((values) => values.reduce((sum, value) => sum + value, 0));

    const recent = await fsQuery('orders', [], { field: 'createdAt', direction: 'DESCENDING' }, 5);
    console.log('TOTAL_ORDERS', totalOrders);
    console.log('DELIVERED', deliveredOrders);
    console.log('PENDING', pendingOrders);
    console.log('FAILED', failedOrders);
    console.log('TOTAL_REVENUE', totalRevenue);
    console.log('EST_PROFIT', estimatedProfit);
    console.log('RECENT_COUNT', recent.length);
    console.log('RECENT_SAMPLE', recent.slice(0, 2).map((o) => ({ id: o.id, paymentStatus: o.paymentStatus, fulfillmentStatus: o.fulfillmentStatus, networkId: o.networkId, sellingPriceSnapshot: o.sellingPriceSnapshot })));
  } catch (error) {
    console.error('CHECK_ERROR', error);
    process.exitCode = 1;
  }
}

run();
