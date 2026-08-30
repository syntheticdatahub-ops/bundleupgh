import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { fsAdd, fsQuery } from './src/lib/firestore-rest';

const env = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
for (const line of env.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
}

const payload = {
  customerId: 'probe',
  recipientPhone: '+233200000000',
  networkId: 'mtn',
  detectedNetworkId: 'mtn',
  bundleId: 'mtn-1gb',
  bundleNameSnapshot: 'MTN 1GB',
  dataSizeSnapshot: '1GB',
  providerCostSnapshot: 4.5,
  sellingPriceSnapshot: 5.5,
  profitSnapshot: 1.0,
  paymentStatus: 'PENDING' as const,
  fulfillmentStatus: 'PENDING' as const,
};

(async () => {
  try {
    const doc = await fsAdd('orders', payload);
    console.log('ADD_OK', JSON.stringify(doc, null, 2));
  } catch (e) {
    console.log('ADD_ERR', e instanceof Error ? e.message : String(e));
  }

  try {
    const docs = await fsQuery('orders', [], { field: 'createdAt', direction: 'DESCENDING' }, 5);
    console.log('QUERY_COUNT', docs.length);
    console.log('QUERY_SAMPLE', JSON.stringify(docs.slice(0, 2), null, 2));
  } catch (e) {
    console.log('QUERY_ERR', e instanceof Error ? e.message : String(e));
  }
})();
