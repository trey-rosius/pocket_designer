import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface ApiStackProps {
  startDesignLambda: lambda.IFunction;
  signalDesignLambda: lambda.IFunction;
  getDesignResultLambda: lambda.IFunction;
  listProjectsLambda: lambda.IFunction;
  listScreensLambda: lambda.IFunction;
  downloadScreenLambda: lambda.IFunction;
}

export class ApiStack extends Construct {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'TemporalStitchApi', {
      restApiName: 'Temporal Stitch Service',
      description: 'API to trigger Temporal workflows for Google Stitch designs.',
    });

    const designs = api.root.addResource('designs');
    designs.addMethod('POST', new apigateway.LambdaIntegration(props.startDesignLambda));

    const singleDesign = designs.addResource('{workflowId}');
    singleDesign.addMethod('GET', new apigateway.LambdaIntegration(props.getDesignResultLambda));
    const confirm = singleDesign.addResource('confirm');
    confirm.addMethod('POST', new apigateway.LambdaIntegration(props.signalDesignLambda));

    const deny = singleDesign.addResource('deny');
    deny.addMethod('POST', new apigateway.LambdaIntegration(props.signalDesignLambda));

    const projects = api.root.addResource('projects');
    projects.addMethod('GET', new apigateway.LambdaIntegration(props.listProjectsLambda));

    const singleProject = projects.addResource('{projectId}');
    const screens = singleProject.addResource('screens');
    screens.addMethod('GET', new apigateway.LambdaIntegration(props.listScreensLambda));

    const singleScreen = screens.addResource('{screenId}');
    const download = singleScreen.addResource('download');
    download.addMethod('GET', new apigateway.LambdaIntegration(props.downloadScreenLambda));

    this.apiUrl = api.url;
  }
}
