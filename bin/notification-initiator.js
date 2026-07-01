#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { CodepipelineStack } = require('../lib/codepipeline-stack');

const app = new cdk.App();
new CodepipelineStack(app, 'NotificationInitiatorPipeline', {
    env: {
        account: '010273536955',
        region: 'us-east-1',
    },
});