import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StitchClient } from '../stitch/stitch-client';

const stitchClient = new StitchClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const projectId = event.pathParameters?.projectId;

  if (!projectId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ProjectId is required' }),
    };
  }

  console.log(`ListScreensHandler received event for project: ${projectId}`);
  try {
    const screens = await stitchClient.listScreens(projectId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ screens }),
    };
  } catch (error: any) {
    console.error(`Error listing screens for project ${projectId}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to list screens', 
        error: error.message 
      }),
    };
  }
};
