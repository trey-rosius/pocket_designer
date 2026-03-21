import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getTemporalClient } from '../lib/temporal-client';
import { designWorkflow } from '../temporal/workflow';
import { v4 as uuidv4 } from 'uuid';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('StartDesignHandler received event:', JSON.stringify(event));
  try {
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Prompt is required' }),
      };
    }

    console.log(`Starting workflow for prompt: ${prompt}`);
    const client = await getTemporalClient();
    const workflowId = `design-${uuidv4()}`;

    await client.workflow.start(designWorkflow, {
      taskQueue: 'design-queue',
      args: [prompt],
      workflowId,
    });

    console.log(`Successfully started workflow: ${workflowId}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ workflowId, message: 'Design workflow started.' }),
    };
  } catch (error: any) {
    console.error('Error starting design workflow:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error while starting workflow',
        error: error.message,
        stack: error.stack
      }),
    };
  }
};
