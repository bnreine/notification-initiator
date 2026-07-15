import { retrieveConfigsAndSubmit } from "./cli/retrieve-configs-and-submit.js";

retrieveConfigsAndSubmit()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });