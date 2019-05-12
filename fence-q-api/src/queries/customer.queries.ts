import { CustomerInterface } from './../types/customer';
import { ApiUserInterface } from './../types/api-user';
import { Customer } from './../models/customer.model';
import { getRepository } from 'typeorm';

export function getAllCustomers(): Promise<Customer[]> {
    const pointer = `_customer`;
    const promise: Promise<Customer[]> = getRepository(Customer)
        .createQueryBuilder()
        .select(pointer)
        .from(Customer, pointer)
        .leftJoinAndSelect(`${pointer}.user`, `user`)
        .getMany();
    return promise;
}

export function getCustomersForUser(user: ApiUserInterface): Promise<Customer[]> {
    const pointer = `_customer`;
    const promise: Promise<Customer[]> = getRepository(Customer)
        .createQueryBuilder()
        .select(pointer)
        .from(Customer, pointer)
        .where(`${pointer}."userId" = :id`, { id: user.id })
        .getMany();
    return promise;
}

export function createNewCustomer(customer: CustomerInterface, user: ApiUserInterface): Promise<Customer> {
    if (!user) { return Promise.reject(); }
    const pointer = `_customer`;
    customer.user = user;
    const promise: Promise<Customer> = getRepository(Customer)
        .save(customer);
    return promise;
}
