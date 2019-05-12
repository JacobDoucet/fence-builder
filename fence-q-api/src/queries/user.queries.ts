import { HasUser } from './../types/api-user';
import { Observable, from } from 'rxjs';
import { getRepository } from 'typeorm';
import { Model } from '../models/model';
import { Customer } from '../models/customer.model';
import { of } from 'rxjs';
import { ApiUser } from '../models/user.model';
import { login$, generateDbToken$ } from '../authentication';
import { mergeMap, tap } from 'rxjs/operators';

export function getForUser<T extends HasUser>(model: typeof Model, user: ApiUser): Promise<Model[]> {
    const pointer = `_${model.name.toLowerCase()}`;
    const promise: Promise<Model[]> = getRepository(model)
        .createQueryBuilder()
        .select(pointer)
        .from(model, pointer)
        .where(`${pointer}."userId" = :id`, { id: user.id })
        .getMany();
    return promise;
}
