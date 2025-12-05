const router = require('express').Router();
const { Order } = require('../models/Schemas');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// CREATE ORDER
router.post('/', verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save(); // Saves to 'orders' collection
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER ORDERS
router.get('/find/:userId', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL ORDERS (Admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    // Populate user details from 'users' collection
    const orders = await Order.find().populate('userId', 'name email');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;