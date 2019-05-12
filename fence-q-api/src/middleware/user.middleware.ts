import { NextFunction, Request, Response } from 'express';
import { ApiUser } from '../models/user.model';
import {getRepository, Repository} from 'typeorm';
import {errorHandler, handleRequest} from './middleware.common';
import { generateDbToken$, decodeClientToken$ } from '../authentication';
import { tap, mergeMap } from 'rxjs/operators';
import { from, Observable, throwError } from 'rxjs';

function userFilter$(req: Request, res: Response, next: NextFunction): Observable<ApiUser> {
    const token = req.query.token|| req.cookies.token;

    let { id } = req.params;
    let { body } = req;
    return decodeClientToken$(token).pipe(
        tap((user: ApiUser) => {
            if (!user) {
                res.status(401);
                res.send({ message: 'Could not decode client token' });
            } else if (user.id !== id) {
                res.status(401);
                res.send({ message: `user ${user.id} is not allowed to modify user ${id}`});
            } else if (body && body.id !== user.id) {
                res.status(401);
                res.send({ message: `user ${user.id} is not allowed to modify user ${body.id}`});
            }
            next();
        })
    )
}

export function userPostMiddleware<T extends ApiUser>(repo: () => Repository<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        from(getRepository(ApiUser)
            .createQueryBuilder('user')
            .where('user.username = :username', { username: req.body.username })
            .getOne())
            .pipe(
                mergeMap((existing: ApiUser) => {
                    console.log(existing);
                    if (!!existing) { return throwError('Username already exists'); }
                    const { password } = req.body;
                    delete req.body.password;
                    return generateDbToken$(password);
                }),
                mergeMap(dbToken => {
                    req.body.password = dbToken;
                    return handleRequest(repo().save(req.body).then(user => {
                        delete user.password;
                        return user;
                    }), req, res, next);
                }),
                errorHandler(req, res, next)
            ).subscribe();
    };
}

export function userPutMiddleware<T extends ApiUser>(repo: () => Repository<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        delete req.body.password;
        userFilter$(req, res, next).pipe(
            mergeMap(
                user => handleRequest(
                    repo().createQueryBuilder()
                        .update(this.model)
                        .set(req.body)
                        .where('id = :id', { id })
                        .execute(), 
                    req, res, next)
            )
        ).subscribe(); 
    };
}
