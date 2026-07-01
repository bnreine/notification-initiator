const { Stage } = require('aws-cdk-lib');
const { NotificationInitiatorStack } = require('./notification-initiator-stack');

class ProductionStage extends Stage {
    constructor(scope, id, props) {
        super(scope, id, props);
        new NotificationInitiatorStack(this, 'NotificationInitiatorStack', props);
    }
}

module.exports = { ProductionStage };