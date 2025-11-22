const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("cloudinary").v2;

// Upload buffer trực tiếp lên Cloudinary
const uploadToCloudinary = async (fileBuffer, filename) => {
  try {
    const uploadStream = (fileBuffer, options) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        stream.end(fileBuffer);
      });
    };
    const result = await uploadStream(fileBuffer, { folder: "products" });
    return await stream(fileBuffer, { folder: "products" });
  } catch (err) {
    throw new Error("Cloudinary upload failed: " + err.message);
  }
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
  const { name, description, categoryId, price } = req.body;
  let imageUrl = null;

  try {
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    }
    const product = await Product.create({ name, description, categoryId, price, image: imageUrl.secure_url });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  const { name, description, categoryId, price } = req.body;
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  let imageUrl = product.image;
  try {
    if (req.file) {
      if (product.image) {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      imageUrl = uploaded.secure_url;
    }
    await product.update({ name, description, categoryId, price, image: imageUrl });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  try {
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }
    await product.destroy();
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Search products
exports.searchProduct = async (req, res) => {
  const { q } = req.query;
  const products = await Product.findAll({
    where: { name: { [require("sequelize").Op.like]: `%${q}%` } },
    include: "category",
  });
  res.json(products);
};
