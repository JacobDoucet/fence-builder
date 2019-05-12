import { ApiUser } from './../models/user.model';
import { getRepository } from 'typeorm';
import { Observable, Observer, throwError, of, generate, from } from 'rxjs';
import { tap, mergeMap, map, catchError, filter, take } from 'rxjs/operators';
import * as jwt from 'jsonwebtoken';

const DB_SECRET = process.env.DB_SECRET;
const CLIENT_SECRET = process.env.CLIENT_SECRET;;

export function generateDbToken$(token: string): Observable<string> {
    return generateToken$(token, DB_SECRET);
}

export function generateClientToken$(token: string): Observable<string> {
    return generateToken$(token, CLIENT_SECRET);
}

export function decodeClientToken$(token: string): Observable<ApiUser> {
    return decodeToken$(token, CLIENT_SECRET).pipe(
        take(1),
        map((data) => data)
    );
}

export function validateClientToken$(token: string): Observable<boolean> {
    return decodeToken$(token, CLIENT_SECRET)
        .pipe(
            map(() => true ),
            catchError(() => of(false))
        )
}

function generateToken$(secret: string, salt: string): Observable<string> {
    return new Observable<string>(($: Observer<string>) => {
        jwt.sign(secret, salt, (err, token: string) => {
            $.next(token);
            $.complete();
        });
    });
}

function decodeToken$(token: string, salt: string): Observable<any> {
    return new Observable<string>(($: Observer<string>) => {
        jwt.verify(token, salt, (err, decoded) => {
            if (err) { $.error(err); } else { $.next(decoded); }
            return $.complete();
        })
    });
}

export function login$(username: string, password: string): Observable<ApiUser> {
    return generateDbToken$(password).pipe(
        mergeMap(hash => from(getRepository(ApiUser)
            .createQueryBuilder('user')
            .where('user.username = :username AND user.password = :hash', { username, hash })
            .addSelect('user.password')
            .getOne())
        ),
        tap(user => {
            if (user) {
                delete user.password;
            }
        })
    );
}

export function register$(user: ApiUser) {
    return from(getRepository(ApiUser)
            .createQueryBuilder('user')
            .where('user.username = :username', { username: user.username })
            .getOne())
        .pipe(
            mergeMap((existing: ApiUser) => {
                console.log(existing);
                if (!!existing) { return throwError('Username already exists'); }
                const { password } = user;
                delete user.password;
                return generateDbToken$(password);
            }),
            tap(hash =>  user.password = `${hash}` ),
            mergeMap(() => from(getRepository(ApiUser).save(user)))
        )
}
