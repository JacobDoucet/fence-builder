import { FenceOrder } from './../models/fence-order.model';
import { Model } from './../models/model';
// import { AuthApi } from './custom/auth.http-api';
import * as express from 'express';
import { HttpApi, HttpPlug } from "./http-api";
import { Fence } from "../models/fence.model";
import { Customer } from "../models/customer.model";
import { BehaviorSubject, Observable, merge, of } from "rxjs";
import { filter, mergeMap } from "rxjs/operators";
import { FenceOrderInterface } from '../types/fence-order';
import { FenceInterface } from '../types/fence';
import { CustomerInterface } from '../types/customer';
import { ModelInterface } from '../types/model';

export class HttpRouter {

    private message: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    message$: Observable<string> = this.message.pipe(filter(message => !!message));

    httpApis: HttpApi<Model>[];

    get routes(): HttpRoute<Model>[] {
        return this.httpApis.map(httpApiToRoute);
    }

    get router(): express.Router {
        const router = express.Router();

        this.routes.forEach(route => {
            if (route.path && route.router) {
                this.message.next(`router.use ${route.path}`);
                return router.use(route.path, route.router);
            }
            if (route.middleware) {
                this.message.next('router.use new middleware');
                router.use(route.middleware);
            }
        });

        router.get('/healthcheck', (req, res, next) => res.send({ healthy: true }));

        return router;
    }

    constructor(models: (typeof Model)[], options?: HttpRouterOptions) {
        this.message.next(`Constructing HttpRouter with ${models.length} models`);
        this.httpApis = models.map(model => new HttpApi(model, { deferInit: true }));
        this.httpApis.forEach(httpApi => {
            this.message$ = merge(
                this.message$,
                httpApi.message$
            );
        });
        this.message.next(`Completed constructing HttpRouter`);
        if (!options || options.deferInit) {
            this.init();
        }
    }

    init() {
        this.message.next(`HttpRouter.init()`);
        this.httpApis.forEach(httpApi => httpApi.init());
    }
}

export interface HttpRoute<T extends ModelInterface> {
    path?: string;
    router?: express.Router;
    middleware?: (req: express.Request, res: express.Response, next: express.NextFunction) => void;
}

export function httpApiToRoute (api: HttpApi<Model>): HttpRoute<Model> {
    return {
        path: api.path,
        router: api.router
    }
}

export interface HttpRouterOptions {
    deferInit?: boolean;
}