# Temporal-Stitch Integration with AWS CDK

This repository contains an AWS CDK application that integrates Temporal workflows with Google Stitch for design generation.

## Project Structure

- `infra/`: CDK infrastructure stacks.
- `bin/`: App entry point.
- `services/`: Application logic.
  - `lambda/`: AWS Lambda handlers for API Gateway.
  - `temporal/`: Temporal workflows, activities, and worker entry point.
  - `stitch/`: Google Stitch SDK wrapper.
  - `lib/`: Shared utilities.
- `Dockerfile`: Container image for the Temporal Worker.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Build**:
    ```bash
    npm run build
    ```
3.  **Local Development**:
    Start a local Temporal cluster (see [Temporal CLI](https://docs.temporal.io/cli)).
    ```bash
    # Run the worker locally
    ts-node services/temporal/worker.ts
    ```
4.  **Deployment**:
    Configure your AWS credentials and run:
    ```bash
    cdk deploy
    ```

## Environment Variables

- `TEMPORAL_ADDRESS`: Address of the Temporal cluster (e.g., `localhost:7233` or Temporal Cloud endpoint).
- `TEMPORAL_NAMESPACE`: Temporal namespace (default: `default`).
- `STITCH_API_KEY`: Your Google Stitch API key.
