import { CustomerInterface } from './customer';
import { ModelInterface } from './../types/model';

export interface ApiUserInterface extends ModelInterface {
    username: string;
    password: string;
}

export interface HasUser {
    user: ApiUserInterface;
}
