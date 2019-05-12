import { FenceQServer } from "./index";
import { createConnection, Connection } from 'typeorm';
import { mergeMap, delayWhen } from 'rxjs/operators';
import { from } from 'rxjs';
import { typeormConfig } from "../db.config";
import { Mailer } from "../mailer/mailer";

let { PORT } = process.env;
let port;
if (PORT) { port = Number(PORT); }

const connectionOptions = typeormConfig();

export function start(models, constants) {
    const app: FenceQServer = new FenceQServer(models, { deferInit: true, constants });

    console.log('Subscribing to app.message$');
    app.message$.subscribe(message => {
        console.log('app.message$ :', `${message}`.replace(/\n/g, '\n             :'));
    });

    console.log('Subscribing to Mailer.getInstance().message$');
    Mailer.getInstance().message$.subscribe(message => {
        console.log('Mailer.message$:', `${message}`.replace(/\n/g, '\n             :'));
    });

    app.init();
    from(createConnection(connectionOptions))
        .pipe(
            delayWhen((connection: Connection) => from(connection.synchronize())),
            mergeMap(() => app.instance$({
                port
            }))
        )
    .subscribe();
}
