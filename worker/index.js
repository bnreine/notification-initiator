// cli/runDailyNotifications.ts

import { runDailyNotifications } from "./cli/run-daily-notifications.js";

runDailyNotifications()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });