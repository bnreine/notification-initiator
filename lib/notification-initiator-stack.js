const { Stack, aws_s3_assets, Fn, aws_codebuild} = require('aws-cdk-lib');
const path = require('path');
const ec2 = require('aws-cdk-lib/aws-ec2');
// const scheduler = require('aws-cdk-lib/aws-scheduler');
// const iam = require('aws-cdk-lib/aws-iam');

class NotificationInitiatorStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

      // const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      //     vpcId: 'vpc-084bacc70db0dcefd',
      // });
      //
      //
      //
      //
      //
      // const ec2WorkerSecurityGroup = new ec2.SecurityGroup(
      //     this,
      //     'Ec2WorkerSecurityGroup',
      //     {
      //         vpc,
      //         description: 'Security group for ec2 worker',
      //         allowAllOutbound: true,
      //     }
      // );
      //
      // const bastionSg = ec2.SecurityGroup.fromSecurityGroupId(
      //     this,
      //     'ImportedBastionSg',
      //     Fn.importValue('BastionSecurityGroupId')
      // );
      //
      // ec2WorkerSecurityGroup.addIngressRule(
      //     bastionSg,
      //     ec2.Port.tcp(22),
      //     'SSH from bastion'
      // );
      //
      // const ec2WorkerInstance = new ec2.Instance(this, 'Ec2WorkerInstance', {
      //     vpc,
      //     vpcSubnets: {
      //         subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      //     },
      //     securityGroup: ec2WorkerSecurityGroup,
      //     machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      //
      //     instanceType: ec2.InstanceType.of(
      //         ec2.InstanceClass.T3,
      //         ec2.InstanceSize.NANO
      //     ),
      //     keyName: 'bastion host ssh key pair',
      // });





      // const schedulerRole = new iam.Role(this, 'SchedulerRole', {
      //     assumedBy: new iam.ServicePrincipal('scheduler.amazonaws.com'),
      // });
      //
      // schedulerRole.addToPolicy(
      //     new iam.PolicyStatement({
      //         actions: ['ssm:SendCommand'],
      //         resources: ['*'],
      //     }),
      // );
      //
      //
      // new scheduler.CfnSchedule(this, "DailyJob", {
      //     scheduleExpression: "cron(0 8 * * ? *)",
      //     scheduleExpressionTimezone: "America/New_York",
      //     target: {
      //         arn: "arn:aws:scheduler:::aws-sdk:ssm:sendCommand",
      //         roleArn: schedulerRole.roleArn,
      //         input: JSON.stringify({
      //             InstanceIds: [ec2WorkerInstance.instanceId],
      //             DocumentName: "AWS-RunShellScript",
      //             Parameters: {
      //                 commands: [
      //                     "cd /opt/worker",
      //                     "node dist/cli/runDailyNotifications.js"
      //                 ]
      //             }
      //         })
      //     }
      // });




//
//
//       const workerAsset = new aws_s3_assets.Asset(this, 'WorkerAsset', {
//           path: path.join(__dirname, '..', 'worker'),
//       });
//
//       workerAsset.grantRead(ec2WorkerInstance.role);
//
//       ec2WorkerInstance.addUserData(`
//       set -e
//       curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
//     dnf install -y nodejs
//     node --version
// npm --version
//
//
// mkdir -p /opt/worker
//
// aws s3 cp ${workerAsset.s3ObjectUrl} /tmp/worker.zip
//
// cd /opt
// unzip /tmp/worker.zip -d worker
//
// cd worker
//
// npm ci
// `);






  }
}

module.exports = { NotificationInitiatorStack }
