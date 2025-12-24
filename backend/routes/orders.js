const router = require('express').Router();
const { Order } = require('../models/Schemas');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// 1. CREATE ORDER (User or Admin Guest Order)
router.post('/', verifyToken, async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    console.error("Create Order Error:", err); // Added logging
    res.status(500).json(err);
  }
});

// 2. UPDATE ORDER STATUS (Admin Only)
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

// 3. DELETE ORDER
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. GET USER ORDERS
router.get('/find/:userId', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. GET ALL ORDERS (Admin)
router.get('/', verifyAdmin, async (req, res) => {
  const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  try {
    let query = {};
    if (status && status !== 'all') query.status = status;
    
    // Improved ID Search logic
    if (search) {
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = search;
      }
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .populate('userId', 'name email phone') 
      // FIX: Changed 'img image' to 'images' to match Product Schema
      .populate('products.productId', 'title images price'); 

    res.status(200).json({
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page),
      totalOrders
    });
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json(err);
  }
});

// 6. GET MONTHLY INCOME
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