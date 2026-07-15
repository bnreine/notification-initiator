import {connectDB, getDbPool} from './connect-db.js'
import lodash from 'lodash'

import {
    SQSClient,
    SendMessageBatchCommand,
} from "@aws-sdk/client-sqs";
const {last, size} = lodash

const sqs = new SQSClient({ region: "us-east-1" });

const getConfigs = async ({lastId }) => {
    const dbPool = getDbPool();
    const limit = 1000

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


const sendMessages = async (messages)=>{
    const chunkSize = 10
    for (let i=0; i < messages.length; i+=chunkSize){
        const chunk = messages.slice(i, i + chunkSize);
        await sqs.send(
            new SendMessageBatchCommand({
                QueueUrl: process.env.GENERATOR_QUEUE_URL,
                Entries: chunk.map((msg, idx) => ({
                    Id: `${i + idx}`,
                    MessageBody: JSON.stringify(msg),
                })),
            })
        )


    }

}

export async function retrieveConfigsAndSubmit() {
    try {
        console.log("starting");
        await connectDB()

        const {lastId, continuePaginating, rows} = await getConfigs({})
        let newLastId = lastId
        let newContinuePaginating = continuePaginating

        console.log('rows: ', size(rows))

        await sendMessages(rows)
        console.log('send success')



        while(newContinuePaginating) {
            const {lastId, continuePaginating, rows} = await getConfigs({lastId: newLastId, continuePaginating: newContinuePaginating});
            newLastId = lastId
            newContinuePaginating = continuePaginating

            console.log('rows: ', size(rows))

            await sendMessages(rows)
            console.log('send success')

        }

    } catch (err) {
        console.error(err);
    }

}