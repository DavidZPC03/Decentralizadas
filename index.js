require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

console.log("Cargando rutas de pagos...");
app.use('/pagos', require('./routes/pagos'));

console.log("Cargando rutas de wallet...");
app.use('/wallet', require('./routes/wallet'));

console.log("Cargando rutas de approvals...");
app.use('/approvals', require('./routes/approvals'));

console.log("Cargando rutas de products...");
app.use('/products', require('./routes/products'));

console.log("Cargando rutas de examen...");
app.use('/examen', require('./routes/examen'));

console.log("Iniciando servidor...");
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});