const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet');
const { ethers } = require('ethers'); // Asegúrate de importar ethers

router.post('/deposit', async (req, res) => {
    try {
        const { amount, account } = req.body;
        await walletController.deposit(amount, account);
        res.json({ success: true, message: 'Depósito exitoso' });
    } catch (error) {
        console.error('Error en depósito:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/submit', async (req, res) => {
    try {
        const { to, amount, account } = req.body;
        
        // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
        // Se quita '.utils' para usar la sintaxis de Ethers v6
        const parsedAmount = ethers.parseEther(amount.toString()); 
        
        const receipt = await walletController.submitTransaction(to, parsedAmount, account);
        res.json({ success: true, message: 'Transacción enviada', receipt });
    } catch (error) {
        console.error('Error al enviar:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/approve', async (req, res) => {
    try {
        const { transactionId, account } = req.body;
        const receipt = await walletController.approveTransaction(transactionId, account);
        res.json({ success: true, message: 'Transacción aprobada', receipt });
    } catch (error) {
        console.error('Error al aprobar:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/execute', async (req, res) => {
    try {
        const { transactionId, account } = req.body;
        const receipt = await walletController.executeTransaction(transactionId, account);
        res.json({ success: true, message: 'Transacción ejecutada', receipt });
    } catch (error) {
        console.error('Error al ejecutar:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/release', async (req, res) => {
    try {
        const { payee, account } = req.body;
        if (!payee) {
            return res.status(400).json({ success: false, message: "Falta la dirección 'payee' en el body" });
        }
        const receipt = await walletController.releasePayment(payee, account);
        res.json({ success: true, message: `Pago liberado a ${payee}`, receipt });
    } catch (error) {
        console.error('Error al liberar pago:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/transactions', async (req, res) => {
    try {
        const transactions = await walletController.getTransactions();
        res.json({ success: true, transactions });
    } catch (error) {
        console.error('Error al obtener transacciones:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/balance', async (req, res) => {
    try {
        const balance = await walletController.getBalance();
        res.json({ success: true, balance: `${balance} ETH` });
    } catch (error) {
        console.error('Error al obtener balance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;