import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Customer } from "../models/customer.model";
import { decodeClientToken$, validateClientToken$ } from "../authentication";
import { catchError, filter, tap } from "rxjs/operators";
import { of } from "rxjs";

export function ensureAuthenticated(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.query.token|| req.cookies.token;

        if (!token) {
            res.status(401);
            res.send({ message: 'No user token provided.'});
            return next();
        }

        validateClientToken$(token).pipe(
            tap(auth => {
                if (!auth) {
                    res.status(401);
                    res.send({ message: 'Invalid user token.' });
                    next();
                }
            }),
            filter(auth => auth)
        ).subscribe(next);
    }
}
