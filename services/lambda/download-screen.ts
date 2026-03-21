import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StitchClient } from '../stitch/stitch-client';

const stitchClient = new StitchClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const projectId = event.pathParameters?.projectId;
  const screenId = event.pathParameters?.screenId;
  const type = event.queryStringParameters?.type || 'html'; // 'html' or 'screenshot'

  if (!projectId || !screenId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ProjectId and ScreenId are required' }),
    };
  }

  const screenName = `projects/${projectId}/screens/${screenId}`;
  console.log(`DownloadScreenHandler received event for screen: ${screenName}, type: ${type}`);

  try {
    if (type === 'screenshot') {
      const screenshot = await stitchClient.downloadScreenshot(screenName);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="screenshot-${screenId}.png"`
        },
        body: screenshot.toString('base64'),
        isBase64Encoded: true,
      };
    } else {
      const html = await stitchClient.downloadDesign(screenName);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="design-${screenId}.html"`
        },
        body: html,
      };
    }
  } catch (error: any) {
    console.error(`Error downloading ${type} for screen ${screenName}:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: `Failed to download ${type}`, 
        error: error.message 
      }),
    };
  }
};
