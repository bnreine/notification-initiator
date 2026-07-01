const { Stack, aws_s3_assets } = require('aws-cdk-lib');
const path = require('path');
const ec2 = require('aws-cdk-lib/aws-ec2');

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

      const ec2WorkerSecurityGroup = new ec2.SecurityGroup(
          this,
          'Ec2WorkerSecurityGroup',
          {
              vpc,
              description: 'Security group for ec2 worker',
              allowAllOutbound: false,
          }
      );

      const ec2WorkerInstance = new ec2.Instance(this, 'Ec2WorkerInstance', {
          vpc,
          vpcSubnets: {
              subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          },
          securityGroup: ec2WorkerSecurityGroup,
          machineImage: ec2.MachineImage.latestAmazonLinux2023(),
          instanceType: ec2.InstanceType.of(
              ec2.InstanceClass.T3,
              ec2.InstanceSize.NANO
          ),
      });

      const workerAsset = new aws_s3_assets.Asset(this, 'WorkerAsset', {
          path: path.join(__dirname, '..', 'worker'),
      });

      workerAsset.grantRead(ec2WorkerInstance.role);

      ec2WorkerInstance.addUserData(`
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
