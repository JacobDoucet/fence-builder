import { FenceBlueprint } from './../models/fence-blueprint.model';
import { ApiUserInterface } from './../types/api-user';
import { getRepository } from 'typeorm';

export function getFenceBlueprintsForUser(user: ApiUserInterface): Promise<FenceBlueprint[]> {
    const pointer = `_blueprint`;
    const promise: Promise<FenceBlueprint[]> = getRepository(FenceBlueprint)
        .createQueryBuilder()
        .select(pointer)
        .from(FenceBlueprint, pointer)
        .leftJoinAndSelect(`${pointer}.fenceMeasurements`, 'fenceMeasurements')
        .innerJoin(`${pointer}.fenceOrder`, 'fenceOrder')
        .where(`"fenceOrder"."userId" = :id`, { id: user.id })
        .getMany();
    return promise;
}
