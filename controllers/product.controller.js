const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;

// Upload buffer trực tiếp lên Cloudinary với unsigned preset 
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { upload_preset: "unsigned_products", folder: "products" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// Get all products
exports.getAllProducts = async (req, res) => {
  const products = await Product.findAll({ include: { model: Category, as: "category" } });
  res.json(products);
};

// Get single product
exports.getProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include: "category" });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, categoryId, price } = req.body;
    let imageUrl = null;

    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer);

    const product = await Product.create({ name, description, price, categoryId, image: imageUrl });
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, categoryId, price } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let imageUrl = product.image;
    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer);

    await product.update({ name, description, categoryId, price, image: imageUrl });
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.destroy();
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// Search products
exports.searchProduct = async (req, res) => {
  try {
    const { q } = req.query;
    const products = await Product.findAll({
      where: { name: { [require("sequelize").Op.like]: `%${q}%` } },
      include: "category",
    });
    res.json(products);
  } catch (err) {
    console.error("Search product error:", err);
    res.status(500).json({ message: "Failed to search products" });
  }
};
