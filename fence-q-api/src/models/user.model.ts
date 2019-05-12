import { ApiUserInterface } from './../types/api-user';
import { CustomerInterface } from './../types/customer';
import { Column, Entity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Model } from './model';
import { of } from "rxjs";
import { userPostMiddleware, userPutMiddleware } from '../middleware/user.middleware';
import { Customer } from './customer.model';

@Entity()
export class ApiUser extends Model implements ApiUserInterface {

    static POST_MIDDLEWARE = userPostMiddleware;
    static PUT_MIDDLEWARE = userPutMiddleware;

    @Column()
    username: string;

    @Column({ select: false })
    password: string;

    @OneToOne(type => Customer, customer => customer.user)
    @JoinColumn()
    customer: Customer;
}
