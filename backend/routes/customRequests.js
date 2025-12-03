// routes/customRequests.js
const router = require('express').Router();
const { CustomRequest } = require('../models/Schemas');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// 1. SUBMIT REQUEST (User)
router.post('/', verifyToken, async (req, res) => {
  const newRequest = new CustomRequest(req.body);
  try {
    const savedRequest = await newRequest.save();
    res.status(200).json(savedRequest);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET MY REQUESTS (User Dashboard)
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const requests = await CustomRequest.find({ userId: req.params.userId });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. GET ALL REQUESTS (Admin Dashboard)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const requests = await CustomRequest.find().populate('userId', 'name email'); // Populate shows User Name instead of just ID
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. UPDATE REQUEST (Admin - Reply with Quote/Status)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedRequest = await CustomRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Admin sends { status: "Quote Sent", adminComments: "Cost will be $500" }
      { new: true }
    );
    res.status(200).json(updatedRequest);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;