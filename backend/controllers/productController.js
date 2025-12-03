const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  const { keyword, category, minPrice, maxPrice } = req.query;
  let query = {};

  if (keyword) query.title = { $regex: keyword, $options: 'i' }; // Search by name
  if (category && category !== 'All') query.category = category;
  if (minPrice || maxPrice) query.price = { $gte: minPrice || 0, $lte: maxPrice || 1000000 };

  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json(products);
};

// @desc    Create a product (Admin)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { title, category, price, material, weight, stockStatus } = req.body;
    
    // Validate image
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newProduct = new Product({
      title,
      category,
      price,
      material,
      weight,
      stockStatus,
      imageUrl
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};