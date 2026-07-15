const { Stack, aws_s3_assets, Fn, aws_iam, aws_ssm: ssm, aws_sqs: sqs,} = require('aws-cdk-lib');
const path = require('path');
const ec2 = require('aws-cdk-lib/aws-ec2');
const autoscaling = require('aws-cdk-lib/aws-autoscaling')
const secretsmanager = require('aws-cdk-lib/aws-secretsmanager')

// const scheduler = require('aws-cdk-lib/aws-scheduler');
// const iam = require('aws-cdk-lib/aws-iam');

const GENERATOR_QUEUE_SSM_PARAMETER = '/notifications/NotificationGeneratorQueue/arn';

class NotificationInitiatorStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

      const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
          vpcId: 'vpc-084bacc70db0dcefd',
      });

      const generatorQueueArn = ssm.StringParameter.valueForStringParameter(this, GENERATOR_QUEUE_SSM_PARAMETER);
      const notificationGeneratorQueue = sqs.Queue.fromQueueArn(this, 'NotificationsGeneratorQueue', generatorQueueArn);


      const RDSReadOnlyCredentialsSecret = secretsmanager.Secret.fromSecretCompleteArn(
          this,
          'RDSReadOnlyCredentialsSecret',
          'arn:aws:secretsmanager:us-east-1:010273536955:secret:readonly_rds_db-nUv5YB'
      );


      const ec2WorkerSecurityGroup = new ec2.SecurityGroup(
          this,
          'Ec2WorkerSecurityGroup',
          {
              vpc,
              description: 'Security group for ec2 worker',
              allowAllOutbound: true,
          }
      );

      const bastionSg = ec2.SecurityGroup.fromSecurityGroupId(
          this,
          'ImportedBastionSg',
          Fn.importValue('BastionSecurityGroupId')
      );

      ec2WorkerSecurityGroup.addIngressRule(
          bastionSg,
          ec2.Port.tcp(22),
          'SSH from bastion'
      );

      const rdsSgId = ssm.StringParameter.valueForStringParameter(
          this,
          '/notifications/rds-sg-id'
      );

      const rdsSg = ec2.SecurityGroup.fromSecurityGroupId(
          this,
          'RdsSg',
          rdsSgId,
          { mutable: true }
      );

      rdsSg.addIngressRule(ec2WorkerSecurityGroup, ec2.Port.tcp(5432));


      const ec2InstanceRole = new aws_iam.Role(this, 'WorkerRole', {
          assumedBy: new aws_iam.ServicePrincipal('ec2.amazonaws.com'),
      });


      notificationGeneratorQueue.grantSendMessages(ec2InstanceRole);


      RDSReadOnlyCredentialsSecret.grantRead(ec2InstanceRole);

      const workerAsset = new aws_s3_assets.Asset(this, 'WorkerAsset', {
          path: path.join(__dirname, '..', 'worker'),
      });

      const asg = new autoscaling.AutoScalingGroup(this, `WorkerAsg-${workerAsset.s3ObjectUrl}`, {
          vpc,

          instanceType: new ec2.InstanceType('t3.nano'),

          machineImage: ec2.MachineImage.latestAmazonLinux2023(),

          role: ec2InstanceRole,

          securityGroup: ec2WorkerSecurityGroup,

          vpcSubnets: {
              subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          },

          minCapacity: 1,
          maxCapacity: 1,
          desiredCapacity: 1,
          keyName: 'bastion host ssh key pair',
      });





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
      //                     "node dist/cli/retrieveConfigsAndSubmit.js"
      //                 ]
      //             }
      //         })
      //     }
      // });








      workerAsset.grantRead(asg.role);

      asg.addUserData(`
set -e

curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

node --version

echo "DB_SECRET_ARN=${RDSReadOnlyCredentialsSecret.secretArn}" >> /etc/environment
echo "GENERATOR_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/010273536955/notification-generator-queue" >> /etc/environment

mkdir -p /opt/worker

aws s3 cp ${workerAsset.s3ObjectUrl} /tmp/worker.zip

cd /opt
unzip /tmp/worker.zip -d worker

cd worker

npm ci
`);


  }
}

module.exports = { NotificationInitiatorStack }
