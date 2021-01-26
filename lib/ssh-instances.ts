import * as core from "@aws-cdk/core";

import * as ec2 from '@aws-cdk/aws-ec2';

export class SshInstances extends core.Construct {
    constructor(scope: core.Construct, id: string, vpc: ec2.Vpc, peerCidrIp: string, az: string, keyName: string) {
        super(scope, id);
        const amznLinuxAmi = ec2.MachineImage.latestAmazonLinux({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            edition: ec2.AmazonLinuxEdition.STANDARD,
            virtualization: ec2.AmazonLinuxVirt.HVM,
            storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
            cpuType: ec2.AmazonLinuxCpuType.X86_64,
        });

        const publicAccessibleInstance = new ec2.Instance(this, 'PublicInstance', {
            vpc: vpc,
            availabilityZone: az,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC
            },
            machineImage: amznLinuxAmi,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
            keyName: keyName,
            blockDevices: [
                {
                    deviceName: '/dev/xvda',
                    volume: ec2.BlockDeviceVolume.ebs(8, {
                        deleteOnTermination: true,
                        encrypted: true,
                        volumeType: ec2.EbsDeviceVolumeType.GP2
                    }),
                }
            ]
        });

        // Elastic IP
        const eip = new ec2.CfnEIP(this, 'Public Elastic IP');
        const ec2Assoc = new ec2.CfnEIPAssociation(this, 'Ec2EipAssociation', {
            eip: eip.ref,
            instanceId: publicAccessibleInstance.instanceId
        });

        if (peerCidrIp != null) {
            publicAccessibleInstance.connections.allowFrom(ec2.Peer.ipv4(peerCidrIp), ec2.Port.tcp(22));
        }

        const privateInstance = new ec2.Instance(this, 'PrivateInstance', {
            vpc: vpc,
            availabilityZone: az,
            vpcSubnets: {
                subnetType: ec2.SubnetType.ISOLATED
            },
            machineImage: amznLinuxAmi,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
            keyName: keyName,
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
        privateInstance.connections.allowFrom(publicAccessibleInstance, ec2.Port.tcp(22));
    }
}