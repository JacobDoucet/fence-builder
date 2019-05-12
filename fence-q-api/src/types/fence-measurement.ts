import { ModelInterface } from './model';

export interface FenceMeasurementInterface extends ModelInterface {
    start_x: number;
    start_y: number;
    end_x: number;
    end_y: number;
}

export interface HasFenceMeasurements {
    fenceMeasurements: FenceMeasurementInterface[]; 
}