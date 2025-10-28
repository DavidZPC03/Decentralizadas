const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');

router.post('/add', async (req, res) => {
    try {
        const { name, price, account } = req.body;
        if (!name || !price || !account) {
            return res.status(400).json({ success: false, message: 'Faltan name, price o account' });
        }
        const receipt = await productController.addProduct(name, price, account);
        res.json({ success: true, message: 'Producto agregado', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/buy', async (req, res) => {
    try {
        const { productId, amount, account } = req.body;
        if (productId === undefined || !amount || !account) {
            return res.status(400).json({ success: false, message: 'Faltan productId, amount o account' });
        }
        const receipt = await productController.buyProduct(productId, amount, account);
        res.json({ success: true, message: 'Producto comprado', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/disable', async (req, res) => {
    try {
        const { productId, account } = req.body;
        if (productId === undefined || !account) {
            return res.status(400).json({ success: false, message: 'Faltan productId o account' });
        }
        const receipt = await productController.disableProduct(productId, account);
        res.json({ success: true, message: 'Producto desactivado', receipt });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const products = await productController.getAllProducts();
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;