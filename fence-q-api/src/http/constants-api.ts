import { HttpPlug } from './http-api';
import { Subject, Observable } from 'rxjs';
import { Router } from 'express';
import colors from 'colors';

export class ConstantsApi implements HttpPlug {

    _message = new Subject<string>();
    get message$(): Observable<string> { return this._message.asObservable(); }

    readonly router: Router = Router();

    constructor(private enums: ConstantGroup[]) {
    }

    init() {
        this._message.next(`ConstantsApi initializing routing for ${this.enums.length} constants groups`);
        this.enums.forEach(type => {
            const endpoint = `/${type.name}`;
            const data = Object.keys(type.enum).map(key => type.enum[key]);
            this._message.next(` ConstantsApi.init GET ${colors.cyan(endpoint)} returns \n   ${colors.cyan(data.join(colors.white('\n   ')))}`)
            this.router.use(endpoint, (req, res, next) => {
                res.send({ data });
                next();
            });
        });
    }

}

export interface ConstantGroup {
    enum: ConstantGroupEnum;
    name: string;
}

export interface ConstantGroupEnum {
    [key: string]: string;
}