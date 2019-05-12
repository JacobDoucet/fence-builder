import { ModelInterface } from "./model";

export interface FenceInterface extends ModelInterface {
    name: string;
    price: number;
    image_url: string;
}
