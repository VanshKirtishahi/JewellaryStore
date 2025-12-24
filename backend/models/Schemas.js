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
  images: { type: [String] }, // Note: This is an Array 'images'
  material: { type: String },
  weight: { type: Number },
  discount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

// 3. ORDERS
const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guestDetails: {
      name: { type: String },
      email: { type: String },
      phone: { type: String }
    },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number },
      },
    ],
    totalAmount: { type: Number, required: true },
    // CHANGED TO STRING TO MATCH FRONTEND FORM
    shippingAddress: { type: String, required: true }, 
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

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

// 5. ATTRIBUTES
const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['category', 'material'] } 
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Product: mongoose.model('Product', productSchema),
  Order: mongoose.model('Order', OrderSchema),
  CustomRequest: mongoose.model('CustomRequest', customRequestSchema),
  Attribute: mongoose.model('Attribute', attributeSchema)
};