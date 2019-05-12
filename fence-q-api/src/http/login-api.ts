import { HttpPlug } from './http-api';
import { Router, Request, Response, NextFunction } from 'express';
import { ApiUser } from '../models/user.model';
import { login$, generateClientToken$, decodeClientToken$ } from '../authentication';
import { tap, mergeMap, catchError } from 'rxjs/operators';
import { Subject, Observable, of } from 'rxjs';

export class LoginApi implements HttpPlug {
    
    _message = new Subject<string>();
    get message$(): Observable<string> { return this._message.asObservable(); }

    readonly router: Router = Router();

    constructor() {}

    init() {
        this._message.next(`Initializing LoginApi using user model: User`);

        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            const token = req.query.token || req.cookies.token;
            decodeClientToken$(token).pipe(
                tap(() => res.send(true)),
                catchError((e) => {
                    res.status(401);
                    res.send(false);

                    return of(e)
                }),
                tap(() => next())
            ).subscribe();
        });

        this.router.post('/login', (req: Request, res: Response, next: NextFunction) => {
            const { username, password } = req.body;
            login$(username, password)
                .pipe(
                    mergeMap(user => {
                        if (!res.headersSent) {
                            if (!user) {
                                res.status(401);
                                return of(res.send({ message: 'Incorrect username/password' }));
                            }
                            return generateClientToken$(JSON.stringify(user))
                                .pipe(tap(token => {
                                    res.cookie('token', token);
                                    res.send({ token });
                                }));
                        }
                        return of(null);
                    }),
                    tap(() => next())
                ).subscribe();
        });

        this.router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
            res.clearCookie('token');
            res.end();
        });
    }

}