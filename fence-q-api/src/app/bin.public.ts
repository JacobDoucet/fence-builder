import { FenceBlueprint } from './../models/fence-blueprint.model';
import { FenceMeasurement } from './../models/fence-measurement.model';
import { Customer } from "../models/customer.model";
import { Fence } from "../models/fence.model";
import { FenceOrder } from "../models/fence-order.model";
import { start } from "./bin";
import { ensureAuthenticated } from "../middleware/middleware.public";
import { fenceOrderGetMiddlewarePublic, fenceOrderPostMiddlewarePublic } from "../middleware/fence-order.middleware.public";
import { ApiUser } from '../models/user.model';
import { fenceMeasurementPostMiddlewarePublic } from '../middleware/fence-measurement.middleware.public';
import { FenceOrderStatus } from '../types/fence-order';
import { fenceBlueprintPostMiddlewarePublic, fenceBlueprintGetMiddlewarePublic } from '../middleware/fence-blueprint.middleware.public';
import { customerGetMiddlewarePublic, customerPostMiddlewarePublic } from '../middleware/customer.middleware.public';

const models = [
    ApiUser,
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

Customer.GET_MIDDLEWARE = customerGetMiddlewarePublic;
Customer.ENABLE_POST = true;
Customer.POST_AUTH_MIDDLEWARE = ensureAuthenticated;
Customer.POST_MIDDLEWARE = customerPostMiddlewarePublic;
Customer.ENABLE_PUT = true;
Customer.PUT_AUTH_MIDDLEWARE = ensureAuthenticated;

FenceBlueprint.GET_MIDDLEWARE = fenceBlueprintGetMiddlewarePublic;
FenceBlueprint.ENABLE_POST = true;
FenceBlueprint.POST_MIDDLEWARE = fenceBlueprintPostMiddlewarePublic;
FenceBlueprint.ENABLE_PUT = true;
FenceBlueprint.ENABLE_DELETE = true;

FenceMeasurement.ENABLE_GET = false;
FenceMeasurement.ENABLE_POST = true;
FenceMeasurement.POST_MIDDLEWARE = fenceMeasurementPostMiddlewarePublic;
FenceMeasurement.ENABLE_PUT = true;
FenceMeasurement.ENABLE_DELETE = true;

FenceOrder.GET_MIDDLEWARE = fenceOrderGetMiddlewarePublic;
FenceOrder.ENABLE_POST = true;
FenceOrder.POST_MIDDLEWARE = fenceOrderPostMiddlewarePublic;
FenceOrder.ENABLE_PUT = true;
FenceOrder.ENABLE_DELETE = true;

start(models, constants);
