import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import {SsmInstances} from './ssm-instances';
import {Ec2ConnectInstances} from './ec2-connect-instances';
import {SshInstances} from './ssh-instances';

class AwsPlaygroundEnvBaseStack extends cdk.Stack {
    createVpc(scope: cdk.Construct) {
        return new ec2.Vpc(scope, 'VPC', {
            cidr: '10.0.0.0/24',
            natGateways: 0,
            subnetConfiguration: [
                {
                    subnetType: ec2.SubnetType.PUBLIC,
                    name: 'Public',
                    cidrMask: 28
                },
                {
                    subnetType: ec2.SubnetType.ISOLATED,
                    name: 'Private',
                    cidrMask: 28
                }
            ]
        });
    }

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
    }
}

export class AwsPlaygroundEnvSsmStack extends AwsPlaygroundEnvBaseStack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        new SsmInstances(this, 'SsmAwsInstances', this.createVpc(this), this.availabilityZones[0]);
    }
}

export class AwsPlaygroundEnvConnectStack extends AwsPlaygroundEnvBaseStack {
    constructor(scope: cdk.Construct, id: string, peerCidrIp: string, props?: cdk.StackProps) {
        super(scope, id, props);
        new Ec2ConnectInstances(this, 'Ec2Instances', this.createVpc(this), peerCidrIp, this.availabilityZones[0]);
    }
}

export class AwsPlaygroundEnvSshStack extends AwsPlaygroundEnvBaseStack {
    constructor(scope: cdk.Construct, id: string, peerCidrIp: string, keyName: string, props?: cdk.StackProps) {
        super(scope, id, props);
        new SshInstances(this, 'SshInstances', this.createVpc(this), peerCidrIp, this.availabilityZones[0], keyName);
    }
}
