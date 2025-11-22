const express = require('express');
const route = express.Router();
const AdminController = require('../controllers/admin.controller');

route.get('/', AdminController.getAdmin);

route.get('/manage-product', AdminController.getManagePosts);
route.get('/manage-product/create', AdminController.getManageCreatePost);

route.get('/manage-category', AdminController.getManageCategory);
route.get('/manage-category/create', AdminController.getManageCreateCategory);

module.exports = route;