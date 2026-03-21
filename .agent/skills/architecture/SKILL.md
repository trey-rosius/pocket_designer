# Skill: AWS CDK + Temporal + Google Stitch Design Orchestrator

## Overview
This skill enables the agent to architect and deploy a TypeScript-based AWS CDK application that triggers a long-running design workflow. It leverages Temporal for durable execution and human-in-the-loop (HITL) checkpoints for Google Stitch design prototypes.

---

## Technical Architecture

### 1. Infrastructure (AWS CDK - TypeScript)
* **API Gateway**: Standard REST API.
    * `POST /design`: Validates body and starts a Temporal Workflow. Returns `workflowId`.
    * `POST /confirm`: Sends a Temporal Signal to the running workflow to 'Approve' or 'Deny'.
* **Compute**: Lambda functions acting as Temporal Clients to start/signal workflows.
* **Temporal Cloud/Self-Hosted**: Manages the state, timers, and signals.

### 2. Workflow Logic (Temporal)
* **Activity A**: Invokes `@google/stitch-sdk` to generate prototypes based on the prompt.
* **HITL Point**: Workflow enters `workflow.waitCondition` or a signal handler, pausing execution indefinitely (or with a timeout) until a human responds.
* **Activity B**: If confirmed, proceeds to fetch the design assets (HTML/Images) from Stitch and persists them to S3.

---

## Implementation Details

### API Gateway Integration
Since design generation and human review can take minutes or hours, **API Gateway Response Streaming** is generally not required for the initial trigger. Instead, use an async pattern:

1. **Client** calls `/design` -> **Lambda** starts Temporal Workflow -> **Returns** `202 Accepted` + `workflowId`.
2. **Workflow** hits a pause point.
3. **Client** calls `/confirm` -> **Lambda** sends Signal to `workflowId` -> **Workflow** resumes.



### Google Stitch SDK Snippet
```typescript
import { stitch } from "@google/stitch-sdk";

// Activity within Temporal
export async function generateStitchDesign(prompt: string) {
  const project = stitch.project("design-id");
  const screen = await project.generate(prompt);
  return {
    previewUrl: await screen.getImage(),
    htmlUrl: await screen.getHtml()
  };
}