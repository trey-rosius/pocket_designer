import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getTemporalClient } from '../lib/temporal-client';
import { humanConfirmationSignal } from '../temporal/workflow';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('SignalDesignHandler received event:', JSON.stringify(event));
  const workflowId = event.pathParameters?.workflowId;
  const body = JSON.parse(event.body || '{}');
  const approved = body.approved !== undefined ? body.approved : true; // Default to true if signaling via the old /confirm path

  if (!workflowId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'WorkflowId is required' }),
    };
  }

  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);

    console.log(`Sending signal 'humanConfirmation' with value ${approved} to workflow ${workflowId}`);
    await handle.signal(humanConfirmationSignal, approved);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Decision '${approved ? 'Approve' : 'Reject'}' sent to workflow.` }),
    };
  } catch (error: any) {
    console.error('Error signaling workflow:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error while signaling workflow',
        error: error.message,
        stack: error.stack
      }),
    };
  }
};
