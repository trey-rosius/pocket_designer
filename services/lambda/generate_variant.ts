import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StitchClient } from '../stitch/stitch-client';

const stitchClient = new StitchClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const projectId = event.pathParameters?.projectId;
  const screenId = event.pathParameters?.screenId;
  const body = JSON.parse(event.body || '{}');
  const prompt = body.prompt;
  const options = body.options;

  if (!projectId || !screenId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ProjectId and ScreenId are required' }),
    };
  }

  const screenName = `projects/${projectId}/screens/${screenId}`;
  console.log(`GenerateVariantHandler received event for screen: ${screenName}`);

  try {
    const result = await stitchClient.generateVariant(screenName, prompt, options);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (error: any) {
    console.error(`Error generating variant for screen ${screenName}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to generate variant', 
        error: error.message 
      }),
    };
  }
};
