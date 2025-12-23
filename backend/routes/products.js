const router = require('express').Router();
// Import models using the name exported in Schemas.js
const { Product } = require('../models/Schemas'); 
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- DEBUG: CHECK KEYS ---
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
  console.error("❌ CRITICAL ERROR: Cloudinary keys are missing from .env file!");
}

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 2. Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jewelry-store',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// --- POST ROUTE (Create Product) ---
router.post('/', (req, res, next) => {
  // Wrap upload to catch Cloudinary errors specifically
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error("❌ Image Upload Error:", err);
      return res.status(500).json({ message: "Image Upload Failed", error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log("✅ Request Body:", req.body); // Debug log

    const { 
      title, description, price, category, stock, 
      material, weight, discount, featured 
    } = req.body;

    // Basic Validation
    if (!title || !price || !category) {
      return res.status(400).json({ message: "Title, Price, and Category are required." });
    }

    // Handle Image URL
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path; 
    } else if (req.body.image) {
      imageUrl = req.body.image; 
    }

    const newProduct = new Product({
      title,
      description,
      price: Number(price), // Ensure conversion to Number
      category,
      stock: Number(stock) || 0,
      material,
      weight: Number(weight) || 0,
      discount: Number(discount) || 0,
      featured: featured === 'true' || featured === true,
      images: imageUrl ? [imageUrl] : [], 
    });

    const savedProduct = await newProduct.save();
    console.log("✅ Product Saved:", savedProduct._id);
    res.status(201).json(savedProduct);

  } catch (err) {
    console.error("❌ Database Error:", err);
    res.status(500).json({ message: "Database Error", error: err.message });
  }
});

// --- GET ALL PRODUCTS ---
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET SINGLE PRODUCT ---
router.get('/find/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET RELATED PRODUCTS ---
router.get('/related/:category', async (req, res) => {
  try {
    const category = req.params.category;
    
    // Find products in the same category (limit to 4 for the "You May Also Like" section)
    const products = await Product.find({ category: category }).limit(4);
    
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching related products", error: err.message });
  }
});

// --- UPDATE PRODUCT ---
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.images = [req.file.path];
    }
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DELETE PRODUCT ---
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;