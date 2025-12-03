require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// FIX: Import from Schemas.js instead of separate files
const { User, Product } = require('./models/Schemas');

// Sample Data
const products = [
  {
    title: "Classic Gold Band",
    description: "A timeless 24k gold band perfect for weddings.",
    price: 599,
    category: "Ring",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80"]
  },
  {
    title: "Diamond Solitaire Necklace",
    description: "Elegant solitaire diamond pendant on a delicate chain.",
    price: 1299,
    category: "Necklace",
    stock: 5,
    images: ["https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=1000&q=80"]
  },
  {
    title: "Sapphire Drop Earrings",
    description: "Stunning blue sapphires surrounded by diamonds.",
    price: 899,
    category: "Earrings",
    stock: 8,
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80"]
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // 1. Clear existing data (Be careful with this in production!)
    await User.deleteMany();
    await Product.deleteMany();
    console.log('🗑️  Data Destroyed');

    // 2. Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt); // Password is '123456'

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin', // Important!
      address: 'Admin HQ',
      phone: '0000000000'
    });
    console.log('👤 Admin User Created (admin@example.com / 123456)');

    // 3. Create Products
    await Product.insertMany(products);
    console.log('💎 Sample Products Imported');

    console.log('🏁 Seeding Completed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();