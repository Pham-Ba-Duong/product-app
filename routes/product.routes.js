const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.get("/search", productController.searchProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);
router.post("/", upload.single("imageFile"), productController.createProduct);
router.put("/:id", upload.single("imageFile"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
