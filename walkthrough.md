# Walkthrough - Project Listing and Screen Download

I have added endpoints to retrieve a list of Google Stitch projects and download project screens (HTML and Screenshots).

## Changes Made

### 1. Stitch Client Enhancements
Enhanced [stitch-client.ts](file:///Users/ro/Documents/playground/temporal-stitch/services/stitch/stitch-client.ts) with new methods:
- `listProjects()`: Lists all projects using the `list_projects` tool.
- `listScreens(projectId)`: Lists all screens for a project using the `list_screens` tool.

### 2. New Lambda Handlers
Created three new Lambda handlers in `services/lambda/`:
- [list-projects.ts](file:///Users/ro/Documents/playground/temporal-stitch/services/lambda/list-projects.ts): Handler for `GET /projects`.
- [list-screens.ts](file:///Users/ro/Documents/playground/temporal-stitch/services/lambda/list-screens.ts): Handler for `GET /projects/{projectId}/screens`.
- [download-screen.ts](file:///Users/ro/Documents/playground/temporal-stitch/services/lambda/download-screen.ts): Handler for `GET /projects/{projectId}/screens/{screenId}/download`.

### 3. API Infrastructure Updates
Updated the CDK stacks to expose the new functionality:
- [compute-stack.ts](file:///Users/ro/Documents/playground/temporal-stitch/lib/compute-stack.ts): Defined the new Lambda functions.
- [api-stack.ts](file:///Users/ro/Documents/playground/temporal-stitch/lib/api-stack.ts): Added the new API resources and methods.
- [temporal-stitch-stack.ts](file:///Users/ro/Documents/playground/temporal-stitch/lib/temporal-stitch-stack.ts): Wired the new handlers into the API.

## How to Verify

Since the local environment had some issues running `node` directly, please run the following steps to verify the deployment:

1.  **Deploy the changes**:
    ```bash
    cdk deploy
    ```

2.  **Test the new endpoints**:
    Replace `<API_URL>` with the `ApiUrl` output from the CDK deployment.

    - **List Projects**:
      ```bash
      curl <API_URL>/projects
      ```
    - **List Screens for a Project**:
      ```bash
      curl <API_URL>/projects/<projectId>/screens
      ```
    - **Download HTML for a Screen**:
      ```bash
      curl -L "<API_URL>/projects/<projectId>/screens/<screenId>/download?type=html" -o design.html
      ```
    - **Download Screenshot for a Screen**:
      ```bash
      curl -L "<API_URL>/projects/<projectId>/screens/<screenId>/download?type=screenshot" -o screenshot.png
      ```

> [!NOTE]
> The `download` endpoint supports a `type` query parameter: `html` (default) or `screenshot`.
