import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import type * as activities from './activities';

const { generatePrototypes } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
});

export const humanConfirmationSignal = defineSignal<[boolean]>('humanConfirmation');

export async function designWorkflow(prompt: string): Promise<{ projectId: string; screenName: string }> {
  let isApproved: boolean | undefined = undefined;

  setHandler(humanConfirmationSignal, (approved: boolean) => {
    isApproved = approved;
  });

  // Step 1: Generate Prototypes via Google Stitch
  const { screenName, projectId } = await generatePrototypes(prompt);

  // Step 2: Wait for Human Confirmation
  await condition(() => isApproved !== undefined);

  if (isApproved === true) {
    // Return the project back as requested
    return { projectId, screenName };
  } else {
    throw new Error('Design workflow rejected by user.');
  }
}
