import { FenceBlueprint } from '../models/fence-blueprint.model';
import { FenceMeasurement } from '../models/fence-measurement.model';
import { Fence } from '../models/fence.model';
import { getRepository } from 'typeorm';
import { ApiUserInterface } from './../types/api-user';
import { Request, Response, NextFunction } from 'express';
import { FenceOrder } from '../models/fence-order.model';
import { Repository } from 'typeorm';
import { handleRequest, errorHandler } from './middleware.common';
import { decodeClientToken$ } from '../authentication';
import { catchError, mergeMap, tap, map } from 'rxjs/operators';
import { of, from, forkJoin, throwError } from 'rxjs';
import { ApiUser } from '../models/user.model';
import { getForUser } from '../queries/user.queries';
import { getFenceOrdersForUser } from '../queries/fence-order.queries';

export function fenceMeasurementPostMiddlewarePublic(repo: () => Repository<FenceMeasurement>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.query.token|| req.cookies.token;

        decodeClientToken$(token)
            .pipe(
                tap((user) => {
                    console.log(user);
                    console.log(req.body.fenceId);
                }),
                mergeMap((user: ApiUserInterface) => from(getFenceOrdersForUser(user))),
                map((fenceOrders: FenceOrder[]) => fenceOrders
                    .map(fenceOrder => fenceOrder.fenceBlueprints)
                    .reduce((blueprints, _blueprints) => blueprints.concat(_blueprints), [])),
                mergeMap((fenceBlueprints: FenceBlueprint[]) => {
                    console.log(fenceBlueprints);
                    console.log(req.body);
                    const fenceBlueprint = fenceBlueprints.find(blueprint => blueprint.id === req.body.fenceBlueprintId);
                    if (!fenceBlueprint) { return throwError('Invalid fenceBlueprintId'); }
                    req.body.fenceBlueprint = fenceBlueprint;
                    return handleRequest(repo().save(req.body), req, res, next);
                }),
                errorHandler(req, res, next, 401)
            )
        .subscribe(); 
    };
}