const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const pagosRoutes = require('./routes/pagos');
app.use('/pagos', pagosRoutes);
app.use('/wallet', require('./routes/wallet'));

app.use('/approvals', require('./routes/approvals'));
app.use('/products', require('./routes/products'));

app.listen(port, () => {
    console.log(`Server at port ${port}`);
});