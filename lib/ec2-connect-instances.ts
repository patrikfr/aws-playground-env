import * as core from "@aws-cdk/core";
import * as ec2 from '@aws-cdk/aws-ec2';

export class Ec2ConnectInstances extends core.Construct {
    constructor(scope: core.Construct, id: string, vpc: ec2.Vpc, peerCidrIp: string, az: string) {
        super(scope, id);

        const bastionHost = new ec2.BastionHostLinux(this, 'BastionHost', {
            vpc,
            availabilityZone: az,
            subnetSelection: {subnetType: ec2.SubnetType.PUBLIC},
        });
        if (peerCidrIp != null) {
            bastionHost.allowSshAccessFrom(ec2.Peer.ipv4(peerCidrIp));
        }
    }
}