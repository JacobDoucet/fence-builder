import { FenceOrderInterface } from "~/app/types/fence-order";
import { CustomerInterface } from "~/app/types/customer";

export interface ValidationResult {
    valid: boolean;
    reason?: Array<string>;
}

const newValidationResult: () => ValidationResult = () => ({
    valid: false, reason: []
});

// TODO should probably add more validation
export function validateOrder(order: FenceOrderInterface): ValidationResult {
    const validation = newValidationResult();

    validation.reason = validation.reason.concat(validateCustomer(order.customer).reason);

    if (!order.quantity) {
        validation.reason.push(" ");
        validation.reason.push("No measurements are provided.");
        validation.reason.push(`Either enter the measurement at the top of the screen
        or plot out the measurements on the mapper page`);
    }

    if (!order.fence) {
        validation.reason.push(" ");
        validation.reason.push("No fence type is selected");
    }

    validation.valid = validation.reason.length === 0;

    return validation;
}

export function validateCustomer(customer: CustomerInterface): ValidationResult {
    const validation = newValidationResult();

    const requiredProps = {
        first_name: "first name",
        last_name: "last name",
        email: "email"
    };

    if (!customer) {
        validation.reason.push(" ");
        validation.reason.push("No customer information");
        validation.reason.push("Please login or register and fill in at least the following details");
        validation.reason.push(Object.keys(requiredProps)
            .map((key) => requiredProps[key])
            .join(", "));

        return validation;
    }

    const missingParams = Object.keys(requiredProps)
        .filter((key) => !customer[key])
        .map((key) => requiredProps[key])
        .join(", ");

    if (missingParams) {
        validation.reason.push(`The following details are missing: ${missingParams}`);
    }

    validation.valid = validation.reason.length === 0;

    return validation;
}
