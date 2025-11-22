const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require('multer')().single('imageFile'); 

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);
router.post("/", upload, productController.createProduct);
router.put("/:id", upload, productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.get("/search", productController.searchProduct);

module.exports = router;