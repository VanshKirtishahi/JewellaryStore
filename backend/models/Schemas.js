const mongoose = require('mongoose');

// 1. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  address: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 2. Product Schema
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  images: [{ type: String }],
  stock: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 3. Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
      priceAtPurchase: { type: Number }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered'], default: 'Pending' },
  shippingAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 4. Custom Request Schema
const customRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  referenceImage: { type: String },
  budgetRange: { type: String },
  status: { type: String, enum: ['Submitted', 'Quote Sent', 'Approved', 'Rejected'], default: 'Submitted' },
  adminComments: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// EXPORT ALL MODELS
module.exports = {
  User: mongoose.model('User', userSchema),
  Product: mongoose.model('Product', productSchema),
  Order: mongoose.model('Order', orderSchema),
  CustomRequest: mongoose.model('CustomRequest', customRequestSchema)
};