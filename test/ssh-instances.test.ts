import '@aws-cdk/assert/jest';
import {Stack} from '@aws-cdk/core';
import {SshInstances} from '../lib/ssh-instances';
import {Vpc, SubnetType} from "@aws-cdk/aws-ec2";
import {arrayWith, objectLike} from "@aws-cdk/assert";

function getVpc(stack: Stack) {
    return new Vpc(stack, 'VPC', {
        cidr: '10.0.0.0/24',
        natGateways: 0,
        subnetConfiguration: [
            {
                subnetType: SubnetType.PUBLIC,
                name: 'Public',
                cidrMask: 28
            },
            {
                subnetType: SubnetType.ISOLATED,
                name: 'Private',
                cidrMask: 28
            }
        ]
    });
}

test('Supplied peerCidrIp creates ingress sg', () => {
    const stack = new Stack();
    const vpc = getVpc(stack);
    new SshInstances(stack, 'SSH Instances', vpc, '127.0.0.1/32', 'dummy1a', 'key-name');

    expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
        'SecurityGroupIngress': arrayWith(objectLike({
            'CidrIp': '127.0.0.1/32',
            'FromPort': 22,
            'IpProtocol': 'tcp',
            'ToPort': 22
        }))
    })
});

test('No peerCidrIp creates no ingress sg', () => {
    const stack = new Stack();
    const vpc = getVpc(stack);

    // @ts-ignore
    new SshInstances(stack, 'SSH Instances', vpc, null, 'dummy1a', 'key-name');

    expect(stack).not.toHaveResource('AWS::EC2::SecurityGroup', {
        'SecurityGroupIngress': arrayWith(objectLike({
            'CidrIp': '127.0.0.1/32',
            'FromPort': 22,
            'IpProtocol': 'tcp',
            'ToPort': 22
        }))
    })
});

test('Supplied keyName sets key', () => {
    const stack = new Stack();
    const vpc = getVpc(stack);
    new SshInstances(stack, 'SSH Instances', vpc, '127.0.0.1/32', 'dummy1a', 'key-name');

    expect(stack).toHaveResource('AWS::EC2::Instance', {
        'KeyName': 'key-name'
    })
});

test('No keyName sets KeyName to null', () => {
    const stack = new Stack();
    const vpc = getVpc(stack);
    // @ts-ignore
    new SshInstances(stack, 'SSH Instances', vpc, '127.0.0.1/32', 'dummy1a', null);

    expect(stack).toHaveResource('AWS::EC2::Instance', {
        'KeyName': null
    })
});

