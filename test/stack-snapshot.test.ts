import {SynthUtils} from '@aws-cdk/assert';
import * as stacks from '../lib/aws-playground-env-stack'
import {App} from "@aws-cdk/core";

test('ssh instances', () => {
    const stack = new stacks.AwsVpcSshStack(new App(), 'AwsVpcSsmStack', '127.0.0.1/32', 'key-name');
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('connect instances', () => {
    const stack = new stacks.AwsVpcConnectStack(new App(), 'AwsVpcConnectStack', '127.0.0.1/32');
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('ssm instances', () => {
    const stackProps = {
        env: {
            account: "0000000000",
            region: "us-west-1"
        }
    }

    const stack = new stacks.AwsVpcSsmStack(new App(), "AwsVpcSsmStack", stackProps);
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});