import { CustomerInterface } from './../types/customer';
import { Repository } from 'typeorm';
import { Customer } from './../models/customer.model';
import { NextFunction, Response, Request } from 'express';
import { decodeClientToken$ } from '../authentication';
import { mergeMap } from 'rxjs/operators';
import { ApiUser } from '../models/user.model';
import { handleRequest, errorHandler } from './middleware.common';
import { getCustomersForUser, createNewCustomer } from '../queries/customer.queries';

export function customerGetMiddlewarePublic(repo: () => Repository<Customer>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.query.token|| req.cookies.token;

        decodeClientToken$(token)
            .pipe(
                mergeMap((user: ApiUser) => handleRequest(
                    getCustomersForUser(user), req, res, next)
                ),
                errorHandler(req, res, next, 401)
            ).subscribe();
    }
}

export function customerPostMiddlewarePublic(repo: () => Repository<Customer>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.query.token|| req.cookies.token;
        const customer: CustomerInterface = req.body;
        decodeClientToken$(token)
            .pipe(
                mergeMap((user: ApiUser) => handleRequest(
                    createNewCustomer(customer, user), req, res, next)
                ),
                errorHandler(req, res, next, 401)
            ).subscribe();        
    }
}