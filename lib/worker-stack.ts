import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as path from 'path';
import { Construct } from 'constructs';

export class WorkerStack extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'TemporalWorkerVpc', {
      maxAzs: 3,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: 1,
      createInternetGateway: true,
      vpcName: 'temporal-stitch-vpc',
    });

    const cluster = new ecs.Cluster(this, 'StitchWorkerCluster', {
      clusterName: 'temporal-stitch-cluster-v3',
      vpc,
      enableFargateCapacityProviders: true,
    });

    // Infrastructure role for ECS Express Mode to provision resources
    const infrastructureRole = new iam.Role(this, 'WorkerInfrastructureRole', {
      assumedBy: new iam.ServicePrincipal('ecs.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSInfrastructureRoleforExpressGatewayServices'),
      ],
    });

    // Task execution role for the container tasks
    const executionRole = new iam.Role(this, 'WorkerExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Use a versioned tag to force ECS to pull the new image
    const imageUri = '132260253285.dkr.ecr.us-east-1.amazonaws.com/temporal/stitch:latest';

    // Use ECS Express Mode for simplified service management
    const expressService = new ecs.CfnExpressGatewayService(this, 'WorkerService', {
      cluster: cluster.clusterName,
      serviceName: 'temporal-stitch-worker-service-v7',
      networkConfiguration: {
        securityGroups: [
          new ec2.SecurityGroup(this, 'WorkerSG', {
            vpc,
            allowAllOutbound: true,
            description: 'Security group for ECS Express Gateway Service',
          }).securityGroupId,
        ],
        subnets: vpc.privateSubnets.map((s) => s.subnetId),
      },
      primaryContainer: {
        image: imageUri,
        containerPort: 8080,
        environment: [
          { name: 'TEMPORAL_ADDRESS', value: process.env.TEMPORAL_ADDRESS || '' },
          { name: 'TEMPORAL_NAMESPACE', value: process.env.TEMPORAL_NAMESPACE || '' },
          { name: 'TEMPORAL_API_KEY', value: process.env.TEMPORAL_API_KEY || '' },
          { name: 'STITCH_API_KEY', value: process.env.STITCH_API_KEY || '' },
          { name: 'STITCH_API_URL', value: process.env.STITCH_API_URL || '' },
        ],
      },
      cpu: '256',
      memory: '512',
      healthCheckPath: '/',
      scalingTarget: {
        minTaskCount: 1,
        maxTaskCount: 3,
        autoScalingMetric: 'AVERAGE_CPU',
        autoScalingTargetValue: 70,
      },

      infrastructureRoleArn: infrastructureRole.roleArn,
      executionRoleArn: executionRole.roleArn,
    });

    expressService.node.addDependency(cluster);
    new cdk.CfnOutput(this, 'WorkerServiceArn', {
      value: expressService.attrServiceArn,
    });

    new cdk.CfnOutput(this, "expressServiceUrl", {
      key: 'expressServiceUrl',
      value: 'https://' + expressService.getAtt("Endpoint").toString()
    })
  }
}
