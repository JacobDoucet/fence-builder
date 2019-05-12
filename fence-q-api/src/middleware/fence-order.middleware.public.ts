import { Mailer } from './../mailer/mailer';
import { Fence } from '../models/fence.model';
import { getRepository } from 'typeorm';
import { ApiUserInterface } from './../types/api-user';
import { Request, Response, NextFunction } from 'express';
import { FenceOrder } from '../models/fence-order.model';
import { Repository } from 'typeorm';
import { handleRequest, errorHandler } from './middleware.common';
import { decodeClientToken$ } from '../authentication';
import { mergeMap, tap, delayWhen, take } from 'rxjs/operators';
import { from, forkJoin, Observable, of } from 'rxjs';
import { ApiUser } from '../models/user.model';
import { getFenceOrdersForUser } from '../queries/fence-order.queries';
import { fenceOrderTemplate } from '../templates/order.html';

const mailer = Mailer.getInstance();

export function fenceOrderGetMiddlewarePublic(repo: () => Repository<FenceOrder>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.query.token|| req.cookies.token;

        decodeClientToken$(token)
            .pipe(
                mergeMap((user: ApiUser) => handleRequest(
                    getFenceOrdersForUser(user), req, res, next)
                ),
                errorHandler(req, res, next, 401)
            ).subscribe();
    }
}

export function fenceOrderPostMiddlewarePublic(repo: () => Repository<FenceOrder>) {

    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.query.token || req.cookies.token;
        decodeClientToken$(token)
            .pipe(
                mergeMap((user: ApiUserInterface) => forkJoin(
                    from(getRepository(ApiUser).findOne(user.id)),
                    from(getRepository(Fence).findOne(req.body.fenceId))
                )),
                take(1),
                mergeMap(([user, fence]) => {
                    req.body.user = user;
                    req.body.fence = fence;
                    delete req.body.fenceId;
                    if (req.body.fenceBlueprints) {
                        req.body.fenceBlueprints.forEach((blueprint) => {
                            delete blueprint.id;
                            if (blueprint.fenceMeasurements) {
                                blueprint.fenceMeasurements.forEach((measurement) => delete measurement.id);
                            }
                        });
                    }
                    sendOrderEmail(user, req.body);
                    return handleRequest(repo().save(req.body), req, res, next);
                }),
                errorHandler(req, res, next, 401)
            )
        .subscribe(); 
    };
}

export function sendOrderEmail(user: ApiUser, order: FenceOrder): void {
    const to = 'lawson.doucet@gmail.com';
    try {
    const orderHtml = fenceOrderTemplate(order);
    console.log(orderHtml);
    mailer.sendMail([to], 'Your FenceQ Inquiry', orderHtml, 'text/html');
    } catch (e) {
        console.log(`Error sending order email`);
        console.log(order);
    }
}
