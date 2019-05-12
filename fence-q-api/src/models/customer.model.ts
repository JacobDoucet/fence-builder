import { Model } from './model';
import { ApiUser } from './user.model';
import { CustomerInterface } from './../types/customer';
import { Column, Entity, OneToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity()
export class Customer extends Model implements CustomerInterface {
    @OneToOne(type => ApiUser)
    @JoinColumn()
    user: ApiUser;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    address_line_1: string;

    @Column()
    address_line_2: string;

    @Column()
    city: string;

    @Column()
    state: string;

    @Column()
    zip: string;

    @Column()
    phone: string;

    @Column()
    email: string;

}
