import { join } from "path";

const env = process.env.NODE_ENV || 'develop';
const configDir = join(process.cwd(),  process.env.CONFIG_DIR || './config');
const _filename = (type: string) => join(configDir, `/${type}/${env}.json`);

export const emailerConfig = (filename?: string) => {
    const file = require(filename || _filename('emailer'));

    file.orderEmail     = file.orderEmail || process.env.ORDER_EMAIL;
    file.sendgridSender = file.sendgridSender || process.env.SENDGRID_SENDER;
    file.sendgridApiKey = file.sendgridApiKey || process.env.SENDGRID_API_KEY;

    return file;
};
