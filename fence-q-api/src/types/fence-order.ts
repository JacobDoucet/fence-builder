import { FenceBlueprintInterface, HasFenceBlueprints } from './fence-blueprint';
import { ModelInterface } from './model';
import { HasUser, ApiUserInterface } from './api-user';
import { FenceInterface } from './fence';
import { CustomerInterface } from './customer';

export interface FenceOrderInterface extends ModelInterface, HasUser, HasFenceBlueprints {
    user: ApiUserInterface;
    customer: CustomerInterface;
    fence: FenceInterface;
    created: Date;
    updated: Date;
    quantity: number;
    fenceBlueprints: FenceBlueprintInterface[];
    message?: string;
    status?: FenceOrderStatus;
}

export enum FenceOrderStatus {
    NONE = 'none',
    REQUESTED = 'requested',
    ACKNOWLEDGED = 'acknowledged',
    CONFIRMED = 'confirmed',
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in-progress',
    COMPLETE = 'complete'
}
