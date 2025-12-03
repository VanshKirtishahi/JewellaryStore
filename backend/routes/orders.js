// routes/orders.js
const router = require('express').Router();
const { Order } = require('../models/Schemas');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// 1. CREATE ORDER (User Only)
router.post('/', verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET USER ORDERS (User Dashboard - "Track my orders")
router.get('/find/:userId', verifyToken, async (req, res) => {
  try {
    // Users can only see their own orders
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json("You can only view your own orders");
    }
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. GET ALL ORDERS (Admin Dashboard)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. UPDATE ORDER STATUS (Admin Only - e.g., "Shipped")
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. GET MONTHLY INCOME (Admin Dashboard Stats)
// This helps you create a chart in the admin panel
router.get('/income', verifyAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$totalAmount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;