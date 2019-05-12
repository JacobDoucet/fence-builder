import { Fence } from '../models/fence.model';
import { getRepository } from 'typeorm';
import { ApiUserInterface } from './../types/api-user';
import { Request, Response, NextFunction } from 'express';
import { FenceOrder } from '../models/fence-order.model';
import { Repository } from 'typeorm';
import { handleRequest, errorHandler } from './middleware.common';
import { decodeClientToken$ } from '../authentication';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { of, from, forkJoin } from 'rxjs';
import { ApiUser } from '../models/user.model';
import { getForUser } from '../queries/user.queries';
import { getAllFenceOrders } from '../queries/fence-order.queries';

export function fenceOrderGetMiddlewareAdmin(repo: () => Repository<FenceOrder>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.query.token|| req.cookies.token;

        of(null)
            .pipe(
                mergeMap(() => handleRequest(
                    getAllFenceOrders(), req, res, next)
                ),
                errorHandler(req, res, next, 401)
            ).subscribe();
    }
}

export function fenceOrderPostMiddlewareAdmin(repo: () => Repository<FenceOrder>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.query.token|| req.cookies.token;

        of(null)
            .pipe(
                mergeMap(() => forkJoin(
                    from(getRepository(ApiUser).findOne(req.body.userId)),
                    from(getRepository(Fence).findOne(req.body.fenceId))
                )),
                mergeMap(([user, fence]) => {
                    req.body.user = user;
                    req.body.fence = fence;
                    delete req.body.fenceId;
                    console.log(req.body);
                    return handleRequest(repo().save(req.body), req, res, next);
                }),
                errorHandler(req, res, next, 401)
            )
        .subscribe(); 
    };
}