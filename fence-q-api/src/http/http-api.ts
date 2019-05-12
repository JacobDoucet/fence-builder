import express, { Response, Request, NextFunction } from 'express';
import colors from 'colors';
import { tap, catchError } from 'rxjs/operators';
import { of, Observable, Subject, from } from 'rxjs';
import { Model } from '../models/model';
import { getRepository, Repository } from 'typeorm';
import { ModelInterface } from '../types/model';

const defaultGet = true;
const defaultPut = true;
const defaultPost = true;
const defaultDelete = true;

export interface HttpPlug {
    readonly router: express.Router;
}

export class HttpApi<T extends ModelInterface> implements HttpPlug {

    _message = new Subject<string>();
    get message$(): Observable<string> { return this._message.asObservable(); }

    readonly router: express.Router = express.Router();
    get DEBUG() { return !!eval(process.env.DEBUG)}

    get repo(): Repository<Model> { 
        return getRepository(this.model);}

    get path() {
        return `/${this.model.name}`;
    }

    get coloredName() {
        return colors.cyan(this.model.name);
    }

    constructor(private model: typeof Model, options?: HttpApiOptions) {
        if (options) {
            if (!options.deferInit) { this.init(); }
        } else {
            this.init();
        }
    }

    init() {
        this._message.next(` HttpApi.init<${this.coloredName}>()`);
        if (this.model.ENABLE_GET) { this.initGet(); }
        if (this.model.ENABLE_PUT) { this.initPut(); }
        if (this.model.ENABLE_POST) { this.initPost(); }
        if (this.model.ENABLE_DELETE) { this.initDelete(); }
    }

    private initGet() {
        this._message.next(`    .initGet()`);

        this.router.get('/new', (req, res, next) => {
            const newEntity = new this.model();
            Object.keys(newEntity)
                .filter(key => Object.keys(req.query).indexOf(key) > -1)
                .forEach(key => {
                    newEntity[key] = req.query[key];
                });
            res.send({ data: [ newEntity ] });
        });
        
        const getOneAuthMiddleware = this.model.GET_ONE_AUTH_MIDDLEWARE;
        const getOneMiddleware = this.model.GET_ONE_MIDDLEWARE;

        this._message.next(colors.yellow(`           getOne => ${getOneMiddleware.name}`));
        this._message.next(colors.yellow(`             auth => ${getOneAuthMiddleware.name}`));

        this.router.get('/:id', getOneAuthMiddleware(), getOneMiddleware(() => this.repo));
        
        const getAuthMiddleware = this.model.GET_AUTH_MIDDLEWARE;
        const getMiddleware = this.model.GET_MIDDLEWARE;

        this._message.next(colors.yellow(`              get => ${getMiddleware.name}`));
        this._message.next(colors.yellow(`             auth => ${getAuthMiddleware.name}`));

        this.router.get('/', getAuthMiddleware(), getMiddleware(() => this.repo));

    }

    private initPost() {
        this._message.next(`    .initPost()`);

        const authMiddleware = this.model.POST_AUTH_MIDDLEWARE;
        const middleware = this.model.POST_MIDDLEWARE;

        this._message.next(colors.yellow(`             post => ${middleware.name}`));
        this._message.next(colors.yellow(`             auth => ${authMiddleware.name}`));

        this.router.post('', authMiddleware(), middleware(() => this.repo));

    }

    private initPut() {
        this._message.next(`    .initPut()`);

        const authMiddleware = this.model.PUT_AUTH_MIDDLEWARE;
        const middleware = this.model.PUT_MIDDLEWARE;

        this._message.next(colors.yellow(`              put => ${middleware.name}`));
        this._message.next(colors.yellow(`             auth => ${authMiddleware.name}`));
        
        this.router.put('/:id', authMiddleware(), middleware(() => this.repo));

    }

    private initDelete() {
        this._message.next(`    .initDelete()`);

        const authMiddleware = this.model.PUT_AUTH_MIDDLEWARE;
        const middleware = this.model.DELETE_MIDDLEWARE;

        this._message.next(colors.yellow(`           delete => ${middleware.name}`));
        this._message.next(colors.yellow(`             auth => ${authMiddleware.name}`));

        this.router.delete('/:id', authMiddleware(), middleware(() => this.repo));

    }

}

export interface HttpApiOptions {
    deferInit?: boolean;
}
