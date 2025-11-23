const Category = require("../models/Category");

// Get all category
exports.getAllCategories = async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
};

// Get category
exports.getCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json(category);
};

// Create category
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const category = await Category.create({ name });
  res.status(201).json(category);
};

// Update category
exports.updateCategory = async (req, res) => {
  const { name } = req.body;
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  await category.update({ name });
  res.json(category);
};

// Delete category
exports.deleteCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  await category.destroy();
  res.json({ message: "Category deleted" });
};
