const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;

// Upload buffer trực tiếp lên Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// GET all products
exports.getAllProducts = async (req, res) => {
  const products = await Product.findAll({ include: { model: Category, as: "category" } });
  res.json(products);
};

// GET single product
exports.getProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include: "category" });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// CREATE product
exports.createProduct = async (req, res) => {
  const { name, description, categoryId, price } = req.body;
  let imageUrl = null;

  try {
    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer);

    const product = await Product.create({ name, description, categoryId, price, image: imageUrl });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cloudinary upload failed: " + err.message });
  }
};

// UPDATE product
exports.updateProduct = async (req, res) => {
  const { name, description, categoryId, price } = req.body;
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  try {
    let imageUrl = product.image;
    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer);

    await product.update({ name, description, categoryId, price, image: imageUrl });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cloudinary upload failed: " + err.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  await product.destroy();
  res.json({ message: "Product deleted" });
};

// SEARCH product
exports.searchProduct = async (req, res) => {
  const { q } = req.query;
  const products = await Product.findAll({
    where: { name: { [require("sequelize").Op.like]: `%${q}%` } },
    include: "category",
  });
  res.json(products);
};
