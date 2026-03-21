import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import { getNativeConnection } from '../lib/temporal-worker-connection';
import * as http from 'http';

async function run() {
  // Start a simple health check server
  const healthServer = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end('OK');
  });
  
  const port = process.env.PORT || 8080;
  healthServer.listen(port, () => {
    console.log(`Health check server listening on port ${port}`);
  });

  console.log(`Connecting to Temporal at ${process.env.TEMPORAL_ADDRESS} in namespace ${process.env.TEMPORAL_NAMESPACE}`);
  try {
    const connection = await getNativeConnection();

    const worker = await Worker.create({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
      taskQueue: 'design-queue',
      workflowsPath: require.resolve('./workflow'),
      activities,
    });

    console.log('Worker connecting to Temporal and starting...');
    await worker.run();
  } catch (err) {
    console.error('Fatal worker error (check Temporal connection):', err);
    // In a real environment, we might want to exit, but let's keep the process alive
    // so the health check can at least report "OK" if the container is just starting.
    // However, usually we WANT it to crash if it can't connect so ECS restarts it.
    // For now, let's just re-throw to keep standard behavior but ensure healthServer started.
    throw err;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
