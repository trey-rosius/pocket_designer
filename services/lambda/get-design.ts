import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getTemporalClient } from '../lib/temporal-client';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const workflowId = event.pathParameters?.workflowId;

  if (!workflowId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'WorkflowId is required' }),
    };
  }

  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    
    // Check if the workflow is completed
    const desc = await handle.describe();
    
    if (desc.status.name === 'COMPLETED') {
      const result = await handle.result();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          result
        }),
      };
    } else if (desc.status.name === 'RUNNING') {
      return {
        statusCode: 202,
        body: JSON.stringify({ 
          status: 'RUNNING', 
          message: 'Design generation in progress. Please approve if requested.' 
        }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          status: desc.status.name, 
          message: `Workflow status: ${desc.status.name}` 
        }),
      };
    }
  } catch (error: any) {
    console.error('Error fetching workflow result:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to fetch design', 
        error: error.message,
        stack: error.stack
      }),
    };
  }
};
