import { ConstantsApi, ConstantGroup } from './../http/constants-api';
import { LoginApi } from './../http/login-api';
import { Model } from './../models/model';
import { HttpRouter } from '../http';
import express from 'express';
import colors from 'colors';
import { Observable, BehaviorSubject, merge } from 'rxjs';
import { FenceQServerMiddleware } from './middleware';
import { filter } from 'rxjs/operators';

export class FenceQServer {

    private httpApi: HttpRouter;
    private authApi: LoginApi;
    private constantsApi: ConstantsApi;

    public message: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    message$: Observable<string>;

    get preprocessingMiddleware() {
        return (req, res, next) => {
            this.message.next(colors.cyan(`beginning <${req.method}> ${req.originalUrl}`));
            next();
        }
    }

    get postProcessingMiddleware() {
        return (req, res, next) => {
            let color = 'green';
            if (res.statusCode >= 300) { color = 'yellow'; }
            if (res.statusCode >= 400) { color = 'gray'; }
            if (res.statusCode >= 500) { color = 'red'; }
            this.message.next(colors[color](`${res.statusCode}<${req.method}> ${req.originalUrl}`));
            next();
        }
    }

    get handle404() {
        return (req, res, next) => {
            if (!res.headersSent) {
                res.status(404);
                res.send({ error: `404 resource ${req.originalUrl} not found` })
            }
            next();
        }
    }

    constructor(models: (typeof Model)[], options?: FenceQServerOptions) {
        this.httpApi = new HttpRouter(models, { deferInit: true });
        this.authApi = new LoginApi();
        this.constantsApi = new ConstantsApi(options.constants || []);

        this.message$ = merge(
            this.message.pipe(filter(message => !!message)),
            this.httpApi.message$,
            this.authApi.message$,
            this.constantsApi.message$
        )
        if (!options || !options.deferInit) {
            this.init();
        }
    }

    init() {
        this.message.next(`FenceQServer.init()`);
        this.httpApi.init();
        this.authApi.init();
        this.constantsApi.init();
    }

    instance$(options?: FenceQServerInstanceOptions): Observable<express.Application> {
        options = sanitizeOptions(options);
        return Observable.create($ => {
            
            const app = express();

            FenceQServerMiddleware(app);

            app.use(this.preprocessingMiddleware);
            app.use('/auth', this.authApi.router);
            app.use('/constants', this.constantsApi.router);
            app.use(this.httpApi.router);
            app.use('/*', this.handle404);
            app.use(this.postProcessingMiddleware);

            app.listen(options.port, () => {
                this.message.next(`App Started on port ${options.port}`);
                $.next(app);
                $.complete();
            });

        });
    }

}

export interface FenceQServerInstanceOptions {
    port?: number;
    deferInit?: boolean;
}

export interface FenceQServerOptions {
    deferInit?: boolean;
    constants?: ConstantGroup[];
}

function sanitizeOptions(options?: FenceQServerInstanceOptions) {
    if (!options) { options = {}; }
    
    options.port = options.port || 3000;

    return options;
}
