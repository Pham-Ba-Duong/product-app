const express = require('express');
const route = express.Router();
const AdminController = require('../controllers/admin.controller');
const Product = require('../models/Product');

route.get('/', AdminController.getAdmin);

route.get('/manage-product', AdminController.getManagePosts);
route.get('/manage-product/create', AdminController.getManageCreatePost);

// route.get('/manage-product/update/:id', async (req, res) => {
//     try {
//       const product = await Product.findByPk(req.params.id, { include: 'category' });
//       if (!product) return res.status(404).send('Product not found');
//       res.render("../views/product-edit.ejs", { product });
//     } catch (err) {
//       res.status(500).send('Server error');
//     }
//   });

route.get('/manage-category', AdminController.getManageCategory);
route.get('/manage-category/create', AdminController.getManageCreateCategory);

module.exports = route;