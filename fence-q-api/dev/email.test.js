const express = require('express');

const { FenceQServerMiddleware } = require('../dist/app/middleware');
const { fenceOrderTemplate } = require('../dist/templates/order.html');

const MockOrders = require('../mocks/order.mock').data;

const app = express();
FenceQServerMiddleware(app);

app.get('/', (req, res) => {
    res.send({ test: 'Hello' });
});

app.get('/:index', function(req, res) {
    let { index } = req.params;
    index = Number(index);
    const order = MockOrders[index];
    if (!order) {
        return res.send({ error: `MockOrders[${index}] not defined. Max index: ${MockOrders.length - 1}`})
    }
    const email = fenceOrderTemplate(order);
    res.send(email);
});

console.log(MockOrders);

app.listen(3000, function() {
    console.log(`Mock Email Templare Service Running. ${MockOrders.length} mocks available`);
});
