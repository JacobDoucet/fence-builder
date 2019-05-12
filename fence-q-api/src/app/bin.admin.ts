import { FenceBlueprint } from './../models/fence-blueprint.model';
import { ApiUser } from './../models/user.model';
import { FenceOrderStatus } from './../types/fence-order';
import { Customer } from "../models/customer.model";
import { Fence } from "../models/fence.model";
import { FenceMeasurement } from "../models/fence-measurement.model";
import { FenceOrder } from "../models/fence-order.model";
import { start } from "./bin";
import { fenceOrderGetMiddlewareAdmin } from "../middleware/fence-order.middleware.admin";
import { fenceBlueprintPostMiddlewarePublic } from '../middleware/fence-blueprint.middleware.public';

const models = [
    Customer,
    Fence,
    FenceBlueprint,
    FenceMeasurement,
    FenceOrder
];

const constants = [
    { name: 'orderStatus', enum: FenceOrderStatus }
];

ApiUser.ENABLE_POST = true;

Fence.ENABLE_POST = true;
Fence.ENABLE_PUT = true;
Fence.ENABLE_DELETE = true;

Customer.ENABLE_POST = true;
Customer.ENABLE_PUT = true;
Customer.ENABLE_DELETE = true;

FenceBlueprint.ENABLE_POST = true;
FenceBlueprint.POST_MIDDLEWARE = fenceBlueprintPostMiddlewarePublic;
FenceBlueprint.ENABLE_PUT = true;
FenceBlueprint.ENABLE_DELETE = true;

FenceMeasurement.ENABLE_POST = true;
FenceMeasurement.ENABLE_PUT = true;
FenceMeasurement.ENABLE_DELETE = true;

FenceOrder.GET_MIDDLEWARE = fenceOrderGetMiddlewareAdmin;
FenceOrder.ENABLE_POST = true;
FenceOrder.ENABLE_PUT = true;
FenceOrder.ENABLE_DELETE = true;

start(models, constants);