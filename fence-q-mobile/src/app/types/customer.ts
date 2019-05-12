import { ModelInterface } from "./../types/model";
import { ApiUserInterface } from "./api-user";

export interface CustomerInterface extends ModelInterface {
    user: ApiUserInterface;
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
}
