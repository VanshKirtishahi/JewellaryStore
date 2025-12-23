require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({
  origin: [
    'https://jewellary-store-pw48.vercel.app',
    'https://www.shrivenkateshwaraenterprises.in',
    "http://localhost:5173",
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'],
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customRoutes = require('./routes/customRequests');
const userRoutes = require('./routes/users');

// 1. IMPORT THE NEW ROUTE FILE
const attributeRoutes = require('./routes/attributes'); 

// --- USE ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom', customRoutes);

// 2. CONNECT THE NEW ROUTE HERE
app.use('/api/attributes', attributeRoutes); 

app.get('/', (req, res) => {
  res.send('Jewelry Store API is Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));