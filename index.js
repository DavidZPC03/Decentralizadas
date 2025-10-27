const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Tus rutas existentes
const pagosRoutes = require('./routes/pagos');
app.use('/pagos', pagosRoutes);
app.use('/wallet', require('./routes/wallet'));

// --- NUEVA LÍNEA: Añadimos la nueva ruta de aprobaciones ---
app.use('/approvals', require('./routes/approvals'));

// Inicia el servidor
app.listen(port, () => {
    console.log(`Server at port ${port}`);
});