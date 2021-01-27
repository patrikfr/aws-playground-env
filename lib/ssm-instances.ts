import * as core from "@aws-cdk/core";

import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';

export class SsmInstances extends core.Construct {
    constructor(scope: core.Construct, id: string, vpc: ec2.Vpc, az: string) {
        super(scope, id);
        //Add VPC endpoints for Systems Manager to work for instances without internet access
        const ssmVpcEndpoint = new ec2.InterfaceVpcEndpoint(this, 'VPC ssm', {
            vpc,
            service: new ec2.InterfaceVpcEndpointService('com.amazonaws.eu-north-1.ssm', 443),
            // Choose which availability zones to place the VPC endpoint in, based on
            // available AZs
            subnets: {
                availabilityZones: [az]
            },
            privateDnsEnabled: true
        });

        const ec2MessagesVpcEndpoint = new ec2.InterfaceVpcEndpoint(this, 'VPC ec2messages', {
            vpc,
            service: new ec2.InterfaceVpcEndpointService('com.amazonaws.eu-north-1.ec2messages', 443),
            // Choose which availability zones to place the VPC endpoint in, based on
            // available AZs
            subnets: {
                availabilityZones: [az]
            },
            privateDnsEnabled: true
        });

        const ssmMessagesVpcEndpoint = new ec2.InterfaceVpcEndpoint(this, 'VPC ssmmessages', {
            vpc,
            service: new ec2.InterfaceVpcEndpointService('com.amazonaws.eu-north-1.ssmmessages', 443),
            // Choose which availability zones to place the VPC endpoint in, based on
            // available AZs
            subnets: {
                availabilityZones: [az]
            },
            privateDnsEnabled: true
        });

        const amznLinuxAmi = ec2.MachineImage.latestAmazonLinux({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            edition: ec2.AmazonLinuxEdition.STANDARD,
            virtualization: ec2.AmazonLinuxVirt.HVM,
            storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
            cpuType: ec2.AmazonLinuxCpuType.X86_64,
        });

        const bastionHost = new ec2.BastionHostLinux(this, 'BastionHost', {
            vpc,
            availabilityZone: az,
            subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
        });

        const privateInstance = new ec2.Instance(this, 'PrivateInstance', {
            vpc: vpc,
            availabilityZone: az,
            vpcSubnets: {
                subnetType: ec2.SubnetType.ISOLATED
            },
            machineImage: amznLinuxAmi,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
            allowAllOutbound: false,
            blockDevices: [
                {
                    deviceName: '/dev/xvda',
                    volume: ec2.BlockDeviceVolume.ebs(8, {
                        deleteOnTermination: true,
                        encrypted: true,
                        volumeType: ec2.EbsDeviceVolumeType.GP2
                    }),
                }
            ],
        });
        privateInstance.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"));
        privateInstance.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"));
        privateInstance.connections.allowTo(ssmVpcEndpoint, ec2.Port.tcp(443));
        privateInstance.connections.allowTo(ec2MessagesVpcEndpoint, ec2.Port.tcp(443));
        privateInstance.connections.allowTo(ssmMessagesVpcEndpoint, ec2.Port.tcp(443));
    }
}