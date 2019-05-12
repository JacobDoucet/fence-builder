import { join } from "path";

const env = process.env.NODE_ENV || 'develop';
const configDir = join(process.cwd(),  process.env.CONFIG_DIR || './config');
const _filename = (type: string) => join(configDir, `/${type}/${env}.json`);

export const typeormConfig = (filename?: string) => {
    const file = require(filename || _filename('ormconfig'));

    file.username   = file.username || process.env.SQL_USERNAME;
    file.password   = file.password || process.env.SQL_PASSWORD;
    file.database   = file.database || process.env.SQL_DATABASE;
    file.host = file.host || `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;

    return file;
};
