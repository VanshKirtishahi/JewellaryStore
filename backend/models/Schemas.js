const mongoose = require('mongoose');

// 1. USERS
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 2. PRODUCTS
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  images: { type: [String] }, 
  material: { type: String },
  weight: { type: Number },
  discount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

// 3. ORDERS
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      image: String,
      quantity: { type: Number, default: 1 },
      price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  paymentMethod: { type: String, default: 'Online' },
  shippingAddress: { type: String, required: true },
  contactNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 4. CUSTOM REQUESTS
const customRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userEmail: String,
  jewelryType: String,
  description: String,
  budgetRange: String,
  status: { type: String, default: 'Submitted' },
  createdAt: { type: Date, default: Date.now }
});

// 5. ATTRIBUTES (New! Stores Categories & Materials)
const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Rose Gold"
  type: { type: String, required: true, enum: ['category', 'material'] } 
});

// EXPORT
module.exports = {
  User: mongoose.model('User', userSchema),
  Product: mongoose.model('Product', productSchema),
  Order: mongoose.model('Order', orderSchema),
  CustomRequest: mongoose.model('CustomRequest', customRequestSchema),
  Attribute: mongoose.model('Attribute', attributeSchema) // Export the new model
};