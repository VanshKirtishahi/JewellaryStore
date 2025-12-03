require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
// Note: Removed trailing slash from Vercel URL (Browsers usually send origin without it)
app.use(cors({
  origin: ["http://localhost:5173", "https://jewellary-stroe.netlify.app/"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customRoutes = require('./routes/customRequests');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom', customRoutes);

// Root Route (Good for testing if backend is live)
app.get('/', (req, res) => {
  res.send('Jewelry Store API is Running');
});

// CRITICAL FOR VERCEL DEPLOYMENT
// We export the app instead of just listening
module.exports = app;

// Only listen to port if running locally (not on Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}