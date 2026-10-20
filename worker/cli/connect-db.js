import * as pg from 'pg';
import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const Pool = pg.Pool

let dbPool

export const connectDB = async () => {
    const secretClient = new SecretsManagerClient({});

    const response = await secretClient.send(
        new GetSecretValueCommand({
            SecretId: process.env.DB_SECRET_ARN
        })
    );

    const secret = JSON.parse(response.SecretString);

    dbPool = new Pool({
        host: process.env.NODE_ENV === 'dev' ? 'localhost' : secret.host,
        port: secret.port,
        database: secret.dbname,
        user: secret.username,
        password: secret.password,
        max: 5,
        idleTimeoutMillis: 30000,
        ssl: {
            ca: fs.readFileSync(`${__dirname}/../certs/global-bundle.pem`, 'utf-8'),
            rejectUnauthorized: true
        }
    });


    try {
        await dbPool.query('SELECT 1');
        console.log('Database connected');
    } catch (err){
        throw new Error('Database connection failed');
    }
}


process.on('SIGTERM', async () => {
    console.log('Closing database pool...');

    dbPool && await dbPool.end();

    process.exit(0);
});

export const getDbPool = () => dbPool;



