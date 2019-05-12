import {Column, PrimaryGeneratedColumn, Repository, Generated} from 'typeorm';
import { Response, Request } from 'express';
import { NextFunction } from 'express-serve-static-core';
import { 
    emptyMiddleware,
    defaultGetOneMiddleware,
    defaultGetMiddleware,
    defaultPostMiddleware,
    defaultPutMiddleware,
    defaultDeleteMiddleware
} from '../middleware/middleware.common';

export class Model {
    static ENABLE_GET = true;
    static ENABLE_PUT = false;
    static ENABLE_POST = false;
    static ENABLE_DELETE = false;

    static GET_MIDDLEWARE: (repo: () => Repository<Model>) => (req: Request, res: Response, next: NextFunction) => void = defaultGetMiddleware;
    static GET_AUTH_MIDDLEWARE: () => (req: Request, res: Response, next: NextFunction) => void = emptyMiddleware;
    static GET_ONE_MIDDLEWARE: (repo: () => Repository<Model>) => (req: Request, res: Response, next: NextFunction) => void = defaultGetOneMiddleware;
    static GET_ONE_AUTH_MIDDLEWARE: () => (req: Request, res: Response, next: NextFunction) => void = emptyMiddleware;

    static PUT_MIDDLEWARE: (repo: () => Repository<Model>) => (req: Request, res: Response, next: NextFunction) => void = defaultPutMiddleware;
    static PUT_AUTH_MIDDLEWARE: () => (req: Request, res: Response, next: NextFunction) => void = emptyMiddleware;

    static POST_MIDDLEWARE: (repo: () => Repository<Model>) => (req: Request, res: Response, next: NextFunction) => void = defaultPostMiddleware;
    static POST_AUTH_MIDDLEWARE: () => (req: Request, res: Response, next: NextFunction) => void = emptyMiddleware;

    static DELETE_MIDDLEWARE: (repo: () => Repository<Model>) => (req: Request, res: Response, next: NextFunction) => void = defaultDeleteMiddleware;
    static DELETE_AUTH_MIDDLEWARE: () => (req: Request, res: Response, next: NextFunction) => void = emptyMiddleware;

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ nullable: true, type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_on?: string;
}
