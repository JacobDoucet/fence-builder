export class AppConstants {
    // static API = "https://fenceqapi.serveo.net";
    static API = "https://fenceq-1550347756039.appspot.com";
    static TOKEN_KEY = "token";
    static USERNAME_KEY = "username";
    static FENCE_MARKER_COLOR = "#ff7200";
    static GATE_MARKER_COLOR = "#0F336D";
    static PRIMARY_COLOR_DARK = "#aa4d01";
    static get CustomerKeys() { return enumToKeyList(CustomerKeys); }
    static get FenceKeys() { return enumToKeyList(CustomerKeys); }
    static get FenceOrderKeys() { return enumToKeyList(FenceOrderKeys); }
    static get FenceBlueprintKeys() { return enumToKeyList(FenceBluprintKeys); }
}

function enumToKeyList(Enum: object): Array<string> {
    return Object.keys(Enum).map((key) => Enum[key]);
}

export enum CustomerKeys {
    ID = "id",
    USER = "user",
    FIRST_NAME = "first_name",
    LAST_NAME = "last_name",
    ADDRESS_LINE_1 = "address_line_1",
    ADDRESS_LINE_2 = "address_line_2",
    CITY = "city",
    STATE = "state",
    ZIP = "zip",
    PHONE = "phone",
    EMAIL = "email"
}

export enum FenceKeys {

}

export enum FenceOrderKeys {
    ID = "id",
    FENCE = "fence",
    CREATED = "created",
    UPDATED = "updated",
    QUANTITY = "quantity",
    FENCE_BLUEPRINTS = "fenceBlueprints",
    MESSAGE = "message",
    STATUS = "status"
}

export enum FenceBluprintKeys {
    NAME = "name",
    FENCE_MEASUREMENTS = "fenceMeasurements"
}
