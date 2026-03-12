require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Precise Allowed Origins
const allowedOrigins = [
  'https://jewellary-store-pw48.vercel.app',
  'https://www.shrivenkateshwaraenterprises.in',
  'https://shrivenkateshwaraenterprises.in',
  'https://jewellary-store-liard.vercel.app',
  'https://jewellarystore.onrender.com',
  'https://jewellary-store-rouge.vercel.app',
  'https://admin.shrivenkateshwaraenterprises.in', // Added HTTPS version without trailing slash
  'http://admin.shrivenkateshwaraenterprises.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5000'
];

// 2. Optimized CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'auth-token', 'x-auth-token'],
  exposedHeaders: ['auth-token']
}));

// 3. Body Parsers
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 4. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// 5. Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customRoutes = require('./routes/customRequests');
const userRoutes = require('./routes/users');
const attributeRoutes = require('./routes/attributes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom', customRoutes);
app.use('/api/attributes', attributeRoutes);

// 6. Utility Endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'Jewelry Store API is Running',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 7. Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));