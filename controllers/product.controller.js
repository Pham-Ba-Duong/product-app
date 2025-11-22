const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Hàm helper upload lên Cloudinary và xóa temp file
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'products',  // Folder trên Cloudinary
      resource_type: 'image'
    });
    fs.unlinkSync(filePath);  // Xóa file temp
    return result.secure_url;  // Trả về URL an toàn
  } catch (err) {
    if (filePath) fs.unlinkSync(filePath);  
    throw new Error('Cloudinary upload failed: ' + err.message);
  }
};

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
  const { name, description, categoryId, price } = req.body;
  let imageUrl = null;
  if (req.file) {
    try {
      imageUrl = await uploadToCloudinary(req.file.path);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
  try {
    const product = await Product.create({ name, description, image: imageUrl, categoryId, price });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, description, categoryId, price } = req.body;
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  let imageUrl = product.image;
  if (req.file) {
    try {
      // Optional: Xóa ảnh cũ trên Cloudinary (lấy public_id từ URL)
      if (product.image) {
        const publicId = product.image.split('/').pop().split('.')[0];  // Ví dụ: products/image-id
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }
      imageUrl = await uploadToCloudinary(req.file.path);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  await product.update({ name, description, image: imageUrl, categoryId, price });
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // Optional: Xóa ảnh trên Cloudinary
  if (product.image) {
    const publicId = product.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`products/${publicId}`);
  }

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