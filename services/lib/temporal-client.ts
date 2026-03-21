import { Connection, Client } from '@temporalio/client';

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
const TEMPORAL_NAMESPACE = process.env.TEMPORAL_NAMESPACE || 'default';
const TEMPORAL_API_KEY = process.env.TEMPORAL_API_KEY;

export async function getTemporalClient() {
  console.log(`Connecting to Temporal at ${TEMPORAL_ADDRESS} in namespace ${TEMPORAL_NAMESPACE}`);

  const connection = await Connection.connect({
    address: TEMPORAL_ADDRESS,
    tls: TEMPORAL_API_KEY ? {} : false,
    metadata: TEMPORAL_API_KEY ? {
      'authorization': `Bearer ${TEMPORAL_API_KEY}`,
      'temporal-namespace': TEMPORAL_NAMESPACE
    } : undefined
  });

  if (TEMPORAL_API_KEY) {
    console.log(`Using Bearer Token auth for namespace ${TEMPORAL_NAMESPACE}`);
  }

  return new Client({
    connection,
    namespace: TEMPORAL_NAMESPACE,
  });
}
