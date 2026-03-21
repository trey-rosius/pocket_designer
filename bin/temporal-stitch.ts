#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TemporalStitchStack } from '../lib/temporal-stitch-stack';

const app = new cdk.App();
new TemporalStitchStack(app, 'TemporalStitchStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
});
