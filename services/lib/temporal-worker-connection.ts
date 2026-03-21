import { NativeConnection } from '@temporalio/worker';

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
const TEMPORAL_API_KEY = process.env.TEMPORAL_API_KEY;

export async function getNativeConnection() {
  const connectionOptions: any = {
    address: TEMPORAL_ADDRESS,
    tls: !!TEMPORAL_API_KEY,
  };

  if (TEMPORAL_API_KEY) {
    connectionOptions.apiKey = TEMPORAL_API_KEY;
    connectionOptions.metadata = {
      Authorization: `Bearer ${TEMPORAL_API_KEY}`,
      'temporal-namespace': process.env.TEMPORAL_NAMESPACE || 'default',
    };
    // Ensure TLS is configured for cloud
    connectionOptions.tls = {
      serverNameOverride: TEMPORAL_ADDRESS.split(':')[0],
    };
  }

  return await NativeConnection.connect(connectionOptions);
}
