import { FenceOrderInterface } from "../types/fence-order";
import { CustomerInterface } from "../types/customer";
import { OrderStylesheet } from "./order.css";

export function fenceOrderTemplate(order: FenceOrderInterface) {
    
    // If the price throws an error, then the email will fail (GOOD)
    const price = formatPrice(order.quantity, order.fence.price);

    try {
        order = JSON.parse(JSON.stringify(order)); // Deep Copy
    } catch(e) {
        throw new Error('Error cloning order for templating');
    }

    try {
        const price = formatPrice(order.quantity, order.fence.price);
        order.quantity = trimLength(order.quantity);
    } catch(e) {}

    return `
${OrderStylesheet()}
<table>
    <tr>
        <th align="left">
            <h1>Thanks for using <span class="text-primary">FenceQ</span></h1>
        </th>
    </tr>
    <tr>
        <th align="left">
            <h3 class="text-primary">A representative will be in touch with you soon!</h3>
        </th>
    </tr>
    
    <tr>
        <th align="left">
            <h3><u>Here is a summary of your potential order</u></h3>
        </th>
    </tr>
    ${ dataRow(() => `<strong class="text-lg"><span class="text-primary">${formatLength(order.quantity)}</span> ${order.fence.name} fence</strong>` ) }
    ${ dataRow(() => `<strong class="text-lg">Estimated total: <span class="text-primary">${price}</span></strong>`) }
    ${ dataRow(() => '&nbsp;') }
    ${ dataRow(() => formatName(order.customer)) }
    ${ dataRow(() => formatContactInfo(order.customer))}
    ${ dataRow(() => order.customer.address_line_1) }
    ${ dataRow(() => order.customer.address_line_2) }
    ${ dataRow(() => order.customer.zip) }
    ${ dataRow(() => formatCityState(order.customer)) }

</table>
    `
}

function dataRow(getValue: () => string): string {
    let value;
    try {
        value = getValue()
    } catch (e) {
        value = '';
    }

    if (!value) {
        return '';
    }

    return `
        <tr>
            <td align="left" style="padding-left: 5px;">${value}</td>
        </tr>
    `;
}

function trimLength(length: number) {
    return Math.round(length);
}

function formatPrice(q: number, p: number): string {
    return `$${Math.round(q * p * 100) / 10000}`;
}

function formatLength(length: number): string {
    const feet = Math.floor(length / 12);
    const inches = length % 12;
    return `${feet} ft ${inches} in`;
}

function formatName(customer: CustomerInterface): string {
    return `${customer.first_name}, ${customer.last_name}`
}

function formatContactInfo(customer: CustomerInterface): string {
    if (!customer.phone) {
        return customer.email;
    }
    return `${customer.email} | ${customer.phone}`;
}

function formatCityState(customer: CustomerInterface): string {
    if (!customer.city && !customer.state) {
        return '';
    }
    if (!customer.city || !customer.state) {
        return customer.city || customer.state;
    }
    return `${customer.city}, ${customer.state}`
}
