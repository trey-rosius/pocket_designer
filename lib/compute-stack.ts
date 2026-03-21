import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Construct } from 'constructs';

export class ComputeStack extends Construct {
  public readonly startDesignLambda: lambda.IFunction;
  public readonly signalDesignLambda: lambda.IFunction;
  public readonly getDesignResultLambda: lambda.IFunction;
  public readonly listProjectsLambda: lambda.IFunction;
  public readonly listScreensLambda: lambda.IFunction;
  public readonly downloadScreenLambda: lambda.IFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const temporalEnv = {
      TEMPORAL_ADDRESS: process.env.TEMPORAL_ADDRESS || '',
      TEMPORAL_NAMESPACE: process.env.TEMPORAL_NAMESPACE || '',
      TEMPORAL_API_KEY: process.env.TEMPORAL_API_KEY || '',
      STITCH_API_URL: process.env.STITCH_API_URL || '',
    };

    this.startDesignLambda = new nodejs.NodejsFunction(this, 'StartDesignHandler', {
      entry: path.join(__dirname, '../services/lambda/start-design.ts'),
      handler: 'handler',
      environment: temporalEnv,
      timeout: cdk.Duration.seconds(30),
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    this.signalDesignLambda = new nodejs.NodejsFunction(this, 'SignalDesignHandler', {
      entry: path.join(__dirname, '../services/lambda/signal-design.ts'),
      handler: 'handler',
      environment: temporalEnv,
      timeout: cdk.Duration.seconds(30),
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    this.getDesignResultLambda = new nodejs.NodejsFunction(this, 'GetDesignResultHandler', {
      entry: path.join(__dirname, '../services/lambda/get-design.ts'),
      handler: 'handler',
      environment: temporalEnv,
      timeout: cdk.Duration.seconds(30),
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    this.listProjectsLambda = new nodejs.NodejsFunction(this, 'ListProjectsHandler', {
      entry: path.join(__dirname, '../services/lambda/list-projects.ts'),
      handler: 'handler',
      environment: {
        STITCH_API_KEY: process.env.STITCH_API_KEY || '',
        STITCH_API_URL: process.env.STITCH_API_URL || '',
      },
      timeout: cdk.Duration.seconds(30),
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    this.listScreensLambda = new nodejs.NodejsFunction(this, 'ListScreensHandler', {
      entry: path.join(__dirname, '../services/lambda/list-screens.ts'),
      handler: 'handler',
      environment: {
        STITCH_API_KEY: process.env.STITCH_API_KEY || '',
        STITCH_API_URL: process.env.STITCH_API_URL || '',
      },
      timeout: cdk.Duration.seconds(30),
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    this.downloadScreenLambda = new nodejs.NodejsFunction(this, 'DownloadScreenHandler', {
      entry: path.join(__dirname, '../services/lambda/download-screen.ts'),
      handler: 'handler',
      environment: {
        STITCH_API_KEY: process.env.STITCH_API_KEY || '',
        STITCH_API_URL: process.env.STITCH_API_URL || '',
      },
      timeout: cdk.Duration.seconds(30),
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });
  }
}
