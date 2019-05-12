import { Model } from '../models/model';
import { NextFunction, Response, Request } from "express";
import { from, of, MonoTypeOperatorFunction, Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Repository } from "typeorm";

export function defaultGetOneMiddleware<T extends Model>(repo: () => Repository<T>) { 
    return (req, res, next) => {
        const { id } = req.params;
        handleRequest(repo().findOne(id), req, res, next).subscribe();
    }
}

export function defaultGetMiddleware<T extends Model>(repo: () => Repository<T>) {
    return (req, res, next) => {
        handleRequest(repo().find(), req, res, next).subscribe();
    }
}

export function defaultPostMiddleware<T extends Model>(repo: () => Repository<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        handleRequest(repo().save(req.body), req, res, next).subscribe(); 
    };
}

export function defaultPutMiddleware<T extends Model>(repo: () => Repository<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        handleRequest(
            repo().createQueryBuilder()
                .update()
                .set(req.body)
                .where('id = :id', { id })
                .execute(), 
            req, res, next).subscribe(); 
    };
}

export function defaultDeleteMiddleware<T extends Model>(repo: () => Repository<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        handleRequest(repo().delete(id), req, res, next).subscribe();
    };
}

export function emptyMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => next();
}

export function operationNotAllowedMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!res.headersSent) {
            res.status(403);
            res.send({ message: 'Sorry, that operation is not allowed.' });
        }
        next();
    };
}

export function handleRequest(promise: Promise<any>, req: Request, res: Response, next: NextFunction): Observable<any> {
    if (res.headersSent) { return of(() => next()); }

    const $ = from(promise);

    return $.pipe(
        sendResonse(req, res, next),
        errorHandler(req, res, next)
    );
}

export function errorHandler(req: Request, res: Response, next: NextFunction, status?: number): MonoTypeOperatorFunction<any> {
    return catchError(e => {
        if (!res.headersSent) {
            res.status(status || 500);
            res.send({ error: e.message || e });
        }
        next();
        return of(e);
    })
}

export function sendResonse(req: Request, res: Response, next: NextFunction): MonoTypeOperatorFunction<any> {
    return tap(data => {
        res.send({ data });
        next();
    })
}
