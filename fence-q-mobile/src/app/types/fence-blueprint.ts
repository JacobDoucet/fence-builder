import { FenceMeasurementInterface } from "./fence-measurement";
import { ModelInterface } from "./model";

export interface FenceBlueprintInterface extends ModelInterface {
    name: string;
    fenceMeasurements: Array<FenceMeasurementInterface>;
    gateLocations: Array<FenceMeasurementInterface>;
}

export interface HasFenceBlueprints {
    fenceBlueprints: Array<FenceBlueprintInterface>;
}
