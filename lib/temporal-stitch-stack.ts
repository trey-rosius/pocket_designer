import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiStack } from './api-stack';
import { WorkerStack } from './worker-stack';
import { ComputeStack } from './compute-stack';

export class TemporalStitchStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const compute = new ComputeStack(this, 'Compute');
    const api = new ApiStack(this, 'Api', {
      startDesignLambda: compute.startDesignLambda,
      signalDesignLambda: compute.signalDesignLambda,
      getDesignResultLambda: compute.getDesignResultLambda,
      listProjectsLambda: compute.listProjectsLambda,
      listScreensLambda: compute.listScreensLambda,
      downloadScreenLambda: compute.downloadScreenLambda,
    });

    const worker = new WorkerStack(this, 'Worker');

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.apiUrl,
    });

  }
}
