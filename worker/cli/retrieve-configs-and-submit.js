import {connectDB} from './connect-db.js'
import {getDbPool} from './connect-db'
import {last, size} from 'lodash'

const getConfigs = async ({lastId }) => {
    const dbPool = getDbPool();
    const limit = 1

    let queryString = `select * from  "NotificationConfig" order by "Id" limit $1`
    let bindings = [limit]
    if(lastId) {
        queryString = `select * from  "NotificationConfig" where "Id" > $1 order by "Id" limit $2`
        bindings = [lastId, limit]
    }
    const response = await dbPool.query(queryString, bindings);
    const rows = response?.rows || [];

    const lastRow = last(rows)
    const newLastId = lastRow?.Id
    const newContinuePaginating = size(rows) === limit


    return {lastId: newLastId, continuePaginating: newContinuePaginating, rows};
}

export async function retrieveConfigsAndSubmit() {
    try {
        console.log("starting");
        await connectDB()

        const {lastId, continuePaginating, rows} = await getConfigs({})
        let newLastId = lastId
        let newContinuePaginating = continuePaginating

        console.log('rows: ', size(rows))
        // submit the batch messages to sqs

        while(newContinuePaginating) {
            const {lastId, continuePaginating, rows} = await getConfigs({lastId: newLastId, continuePaginating: newContinuePaginating});
            newLastId = lastId
            newContinuePaginating = continuePaginating

            console.log('rows: ', size(rows))
            // submit the batch messages to sqs
        }

    } catch (err) {
        console.error(err);
    }

}