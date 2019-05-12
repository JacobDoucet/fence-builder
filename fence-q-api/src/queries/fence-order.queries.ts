import { ApiUserInterface } from './../types/api-user';
import { FenceOrder } from '../models/fence-order.model';
import { getRepository } from 'typeorm';

export function getAllFenceOrders(): Promise<FenceOrder[]> {
    const pointer = `_order`;
    const promise: Promise<FenceOrder[]> = getRepository(FenceOrder)
        .createQueryBuilder()
        .select(pointer)
        .from(FenceOrder, pointer)
        .leftJoinAndSelect(`${pointer}.fence`, `fence`)
        .leftJoinAndSelect(`${pointer}.user`, `user`)
        .leftJoinAndSelect(`${pointer}.fenceBlueprints`, `fenceBlueprints`)
        .leftJoinAndSelect(`fenceBlueprints.fenceMeasurements`, 'fenceMeasurements')
        .getMany();
    return promise;
}

export function getFenceOrdersForUser(user: ApiUserInterface): Promise<FenceOrder[]> {
    const pointer = `_order`;
    const promise: Promise<FenceOrder[]> = getRepository(FenceOrder)
        .createQueryBuilder()
        .select(pointer)
        .from(FenceOrder, pointer)
        .leftJoinAndSelect(`${pointer}.fence`, `fence`)
        .leftJoinAndSelect(`${pointer}.fenceBlueprints`, `fenceBlueprints`)
        .leftJoinAndSelect(`fenceBlueprints.fenceMeasurements`, 'fenceMeasurements')
        .where(`${pointer}."userId" = :id`, { id: user.id })
        .getMany();
    return promise;
}

export function getFenceOrdersWithUser(user: ApiUserInterface): Promise<FenceOrder[]> {
    const pointer = `_order`;
    const promise: Promise<FenceOrder[]> = getRepository(FenceOrder)
        .createQueryBuilder()
        .select(pointer)
        .from(FenceOrder, pointer)
        .leftJoinAndSelect(`${pointer}.fence`, `fence`)
        .leftJoinAndSelect(`${pointer}.user`, `user`)
        .leftJoinAndSelect(`${pointer}.fenceBlueprints`, `fenceBlueprints`)
        .leftJoinAndSelect(`fenceBlueprints.fenceMeasurements`, 'fenceMeasurements')
        .getMany();
    return promise;
}
