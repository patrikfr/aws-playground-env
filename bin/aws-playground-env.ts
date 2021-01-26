#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as stacks from '../lib/aws-playground-env-stack';

const app = new cdk.App();

const peerCidrIp: string = app.node.tryGetContext('peerIp');
const keyName: string = app.node.tryGetContext('keyName');

if (peerCidrIp == null) {
    console.log('"peerIp" context key missing, instances in public subnets will not allow connections.')
} else {
    console.log('"peerIp" set to: ' + peerCidrIp);
}

if (keyName == null) {
    console.log('"keyName" context key missing, no ssh key will be supplied to instances.');
} else {
    console.log('"keyName" set to: ' + keyName);
}

const stackProps = {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
}

new stacks.AwsPlaygroundEnvSsmStack(app, 'AwsPlaygroundEnvSsmStack', stackProps);
new stacks.AwsPlaygroundEnvConnectStack(app, 'AwsPlaygroundEnvConnectStack', peerCidrIp, stackProps);
new stacks.AwsPlaygroundEnvSshStack(app, 'AwsPlaygroundEnvSshStack', peerCidrIp, keyName, stackProps);
