# AWS VPC Playground Environments

This is a TypeScript [CDK](https://aws.amazon.com/cdk/) project that can be used to quickly provision an AWS Virtual Private Cloud (VPC) with EC2 instances. This can be used for exploring various aspects of AWS, or as a starting point for setting up a new environment. Deploying these stacks will create resources that incur AWS charges.

Three independent stacks are provided, showcasing three different ways to access instances in public or isolated subnets. All three stacks create the same basic VPC setup with one public and one isolated subnet in each availability zone in the region. No NAT gateways/instances are deployed.

### AwsVpcSshStack
Provisions one t3 nano Amazon Linux 2 instance to the first public subnet, and one to the first private subnet. If a `keyName` is supplied, corresponding key will be added to both instances. If a `peerIp` in CIDR notation is supplied, a security group will be set up to allow SSH access to the public instance from that source IP

```
cdk deploy --context peerIp=<source ip> --context keyName=<name for existing EC2 key pair> AwsVpcSshStack
```

### AwsVpcConnectStack
Provisions [Linux bastion host instance](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ec2.BastionHostLinux.html) to the first public subnet. If a `peerIp` in CIDR notation is supplied, a security group will be set up to allow SSH access to the public instance from that source IP. No keys are configured; to connect, push a public key using [EC2 Instance connect](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-connect-methods.html), then connect using ssh with corresponding private key. EC2 Instance Connect is preconfigured on the bastion host.

```
cdk deploy --context peerIp=<source ip> AwsVpcConnectStack
```

### AwsVpcSsmStack
Provisions [Linux bastion host instance](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ec2.BastionHostLinux.html) to the first public subnet, and one t3 nano Amazon Linux 2 instance to the first private subnet. No keys are configured. No access from public Internet is configured. The [necessary VPC Endpoints](https://aws.amazon.com/premiumsupport/knowledge-center/ec2-systems-manager-vpc-endpoints/) for ssm, ec2messages, and ssmmessages are deployed. [Policies](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started-instance-profile.html) and security groups necessary for Systems Manager Session Manager are configured on the private instance. SSM Agent is [installed by default on Amazon Linux 2](https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-manual-agent-install.html).

Use Session Manager from the AWS console or the AWS CLI (requires [Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html)) to [connect to the instances](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html). User access to instances is controlled using IAM, user permissions must be [correctly configured](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started-restrict-access.html) for Session Manager access to work.

```
cdk deploy AwsVpcSsmStack
```