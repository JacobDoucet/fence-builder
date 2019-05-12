import { FenceMeasurementInterface } from './fence-measurement';
import { ModelInterface } from './model';

export interface FenceBlueprintInterface extends ModelInterface {
    name: string;
    fenceMeasurements: FenceMeasurementInterface[];
}

export interface HasFenceBlueprints {
    fenceBlueprints: FenceBlueprintInterface[];
}
