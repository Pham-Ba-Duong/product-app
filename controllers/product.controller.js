const Product = require("../models/Product");
const Category = require("../models/Category");

exports.getAllProducts = async (req, res) => {
  const products = await Product.findAll({ include: { model: Category, as: "category" } });
  res.json(products);
};

exports.getProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include: "category" });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

exports.createProduct = async (req, res) => {
  const { name, description, image, categoryId, price } = req.body;
  try {
    const product = await Product.create({ name, description, image, categoryId, price });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, description, image, categoryId, price } = req.body;
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  await product.update({ name, description, image, categoryId, price });
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  await product.destroy();
  res.json({ message: "Product deleted" });
};

exports.searchProduct = async (req, res) => {
  const { q } = req.query;
  const products = await Product.findAll({
    where: { name: { [require("sequelize").Op.like]: `%${q}%` } },
    include: "category"
  });
  res.json(products);
};
