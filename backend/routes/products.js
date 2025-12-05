const router = require('express').Router();
const { Product } = require('../models/Schemas');
const { verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    // Fetches directly from 'products' collection
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ONE PRODUCT
router.get('/find/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE PRODUCT (Admin)
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    if (req.file) productData.images = [req.file.path];
    
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save(); // Saves to 'products' collection
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE PRODUCT (Admin Only)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const updateData = req.body;
    
    // If a new file is uploaded, update the image
    if (req.file) {
      updateData.images = [req.file.path];
    }
    // If no file, we keep the existing image URL passed in body or do nothing

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
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


router.get('/related/:category', async (req, res) => {
  try {
    const category = req.params.category;
    
    // Find products with the same category
    // We limit to 4 items since it's usually for a "You might also like" section
    const products = await Product.find({ 
      category: { $regex: new RegExp('^' + category + '$', "i") } // Case-insensitive match
    }).limit(4);

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch related products", error: err.message });
  }
});

module.exports = router; // <--- This exports the router so server.js can use it