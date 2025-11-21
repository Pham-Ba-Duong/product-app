const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateJWT } = require('../middleware/auth');


// API endpoints (JSON)
router.get('/', async (req, res) => {
    // list with optional pagination
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const products = await Product.findAll({ limit: parseInt(limit), offset: parseInt(offset), order: [['createdAt', 'DESC']] });
    res.json(products);
});


router.get('/search', async (req, res) => {
    const q = req.query.q || '';
    const products = await Product.findAll({ where: { name: { [Product.sequelize.Op.like]: `%${q}%` } }, limit: 100 });
    res.json(products);
});


router.post('/', authenticateJWT, async (req, res) => {
    const { name, price, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const product = await Product.create({ name, price: price || 0, description });
    res.status(201).json(product);
});


router.put('/:id', authenticateJWT, async (req, res) => {
    const id = req.params.id;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    await product.update(req.body);
    res.json(product);
});


router.delete('/:id', authenticateJWT, async (req, res) => {
    const id = req.params.id;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    await product.destroy();
    res.json({ message: 'Deleted' });
});


module.exports = router;