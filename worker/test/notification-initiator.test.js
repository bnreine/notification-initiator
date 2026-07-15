import {retrieveConfigsAndSubmit} from "../cli/retrieve-configs-and-submit";


test('initiator test', async () => {
    await retrieveConfigsAndSubmit()
}, 30000);
