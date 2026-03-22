import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StitchClient } from '../stitch/stitch-client';

const stitchClient = new StitchClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const projectId = event.pathParameters?.projectId;
  const screenId = event.pathParameters?.screenId;
  const body = JSON.parse(event.body || '{}');
  const prompt = body.prompt;

  if (!projectId || !screenId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ProjectId and ScreenId are required' }),
    };
  }

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Prompt is required' }),
    };
  }

  const screenName = `projects/${projectId}/screens/${screenId}`;
  console.log(`EditScreenHandler received event for screen: ${screenName}`);

  try {
    const result = await stitchClient.editScreen(screenName, prompt);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (error: any) {
    console.error(`Error editing screen ${screenName}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to edit screen', 
        error: error.message 
      }),
    };
  }
};
