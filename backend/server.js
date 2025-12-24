require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. CORS Middleware - FIRST
app.use(cors({
  origin: [
    'https://jewellary-store-pw48.vercel.app',
    'https://www.shrivenkateshwaraenterprises.in',
    'https://jewellary-store-liard.vercel.app',
    'https://jewellarystore.onrender.com', // Add root domain
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5000' // Add localhost:5000 for testing
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'auth-token', 'x-auth-token'],
}));

// 2. Explicit OPTIONS handler for preflight
app.options('*', cors());

// 3. Body parsers
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customRoutes = require('./routes/customRequests');
const userRoutes = require('./routes/users');
const attributeRoutes = require('./routes/attributes');

// 4. Add CORS headers middleware before routes
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://jewellary-store-pw48.vercel.app',
    'https://www.shrivenkateshwaraenterprises.in',
    'https://jewellary-store-liard.vercel.app',
    'https://jewellarystore.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, auth-token, x-auth-token');
  next();
});

// --- USE ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom', customRoutes);
app.use('/api/attributes', attributeRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Jewelry Store API is Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));