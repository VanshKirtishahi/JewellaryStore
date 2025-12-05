const mongoose = require('mongoose');

// 1. USERS (Collection: "users")
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 2. PRODUCTS (Collection: "products")
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  material: { type: String },     // e.g., Gold, Silver
  gemstone: { type: String },     // e.g., Diamond, Ruby
  weight: { type: Number },       // e.g., 10.5 (grams)
  dimensions: { type: String },   // e.g., 10x10mm
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, unique: true },
  tags: [{ type: String }],
  images: [{ type: String }],     // Stores Cloudinary URLs
  featured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// 3. ORDERS (Collection: "orders")
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,    // Snapshot of product name
      image: String,   // Snapshot of product image
      quantity: { type: Number, default: 1 },
      price: Number    // Price at time of purchase
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  paymentMethod: { type: String, default: 'Online' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  shippingAddress: { type: String, required: true },
  contactNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 4. CUSTOM REQUESTS (Collection: "customrequests")
const customRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  userEmail: { type: String },
  
  // Design Details
  jewelryType: { type: String, required: true }, // Ring, Necklace, etc.
  description: { type: String, required: true },
  budgetRange: { type: String },
  metalType: { type: String },
  gemstoneType: { type: String },
  gemstoneSize: { type: String },
  size: { type: String }, // Ring size, etc.
  personalization: { type: String },
  occasion: { type: String },
  deadline: { type: String },
  
  referenceImage: { type: String }, // Cloudinary URL
  referenceNumber: { type: String }, // e.g., CUST123456

  // Admin Interaction
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'Quote Sent', 'Approved', 'In Production', 'Completed', 'Rejected'], 
    default: 'Submitted' 
  },
  adminComments: { type: String },
  quoteAmount: { type: Number },
  repliedAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
});

// EXPORT MODELS
module.exports = {
  User: mongoose.model('User', userSchema),
  Product: mongoose.model('Product', productSchema),
  Order: mongoose.model('Order', orderSchema),
  CustomRequest: mongoose.model('CustomRequest', customRequestSchema)
};