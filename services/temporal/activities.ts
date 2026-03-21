import { StitchClient } from '../stitch/stitch-client';

const stitchClient = new StitchClient();

export interface PrototypeResult {
  screenName: string;
  projectId: string;
}

export async function generatePrototypes(prompt: string): Promise<PrototypeResult> {
  console.log(`Activity: generatePrototypes started with prompt: ${prompt}`);
  const screenName = await stitchClient.generatePrototype(prompt);
  
  // Extract projectId from screenName (projects/{projectId}/screens/{screenId})
  const parts = screenName.split('/');
  const projectId = parts[1];

  console.log(`Activity: generatePrototypes finished. Screen: ${screenName}, Project: ${projectId}`);
  return { screenName, projectId };
}

export async function downloadDesigns(prototypeUrl: string): Promise<string> {
  console.log(`Activity: downloadDesigns started with URL: ${prototypeUrl}`);
  
  // Download HTML
  const designData = await stitchClient.downloadDesign(prototypeUrl);
  console.log(`Successfully downloaded design HTML: ${designData.length} bytes`);
  
  // Download Screenshot (as a Buffer, but we'll just log successful retrieval for now)
  try {
    const screenshot = await stitchClient.downloadScreenshot(prototypeUrl);
    console.log(`Successfully downloaded design screenshot: ${screenshot.length} bytes`);
  } catch (error: any) {
    console.warn(`Failed to download screenshot (non-critical): ${error.message}`);
  }
  
  return designData;
}
