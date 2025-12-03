const router = require('express').Router(); // <--- This was missing
const { Product } = require('../models/Schemas'); // <--- Import your Database Model
const { verifyAdmin } = require('../middleware/authMiddleware'); // <--- Import Security

// 1. GET ALL PRODUCTS (Public)
router.get('/', async (req, res) => {
  try {
    const qCategory = req.query.category;
    let products;

    if (qCategory) {
      products = await Product.find({ category: qCategory });
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err); // Logs error to terminal
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

// 2. GET ONE PRODUCT (Public)
router.get('/find/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. CREATE PRODUCT (Admin Only)
router.post('/', verifyAdmin, async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. UPDATE PRODUCT (Admin Only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. DELETE PRODUCT (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router; // <--- This exports the router so server.js can use it