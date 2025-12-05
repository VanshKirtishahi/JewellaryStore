require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "https://jewellary-store-pw48.vercel.app/" // <--- REPLACE THIS with your actual Vercel domain
  ], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Body parsers (Increased limit for base64 if needed, though we use Cloudinary now)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. Database Connection
// Ensure your .env file has: MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/jewellery_store_db
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected to jewellery_store_db'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// 3. Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customRoutes = require('./routes/customRequests');
const userRoutes = require('./routes/users');

// 4. Use Routes
app.use('/api/auth', authRoutes);         // Users (Register/Login)
app.use('/api/users', userRoutes);        // Users (Management)
app.use('/api/products', productRoutes);  // Products
app.use('/api/orders', orderRoutes);      // Orders
app.use('/api/custom', customRoutes);     // Custom Requests

// Root Route
app.get('/', (req, res) => {
  res.send('Jewelry Store API is Running');
});

// 5. Start Server
module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}