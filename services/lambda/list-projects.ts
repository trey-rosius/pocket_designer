import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StitchClient } from '../stitch/stitch-client';

const stitchClient = new StitchClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('ListProjectsHandler received event');
  try {
    const projects = await stitchClient.listProjects();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ projects }),
    };
  } catch (error: any) {
    console.error('Error listing projects:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to list projects', 
        error: error.message 
      }),
    };
  }
};
