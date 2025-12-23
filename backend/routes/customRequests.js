// routes/customRequests.js
const router = require('express').Router();
const { CustomRequest } = require('../models/Schemas');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. SUBMIT REQUEST
router.post('/', verifyToken, upload.single('referenceImage'), async (req, res) => {
  try {
    const requestData = req.body;
    if (req.file) requestData.referenceImage = req.file.path;

    const newRequest = new CustomRequest(requestData);
    const savedRequest = await newRequest.save(); 
    res.status(200).json(savedRequest);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. UPDATE REQUEST (Admin: Reply / Status) -- WAS MISSING
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedRequest = await CustomRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedRequest);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. DELETE REQUEST (Admin) -- WAS MISSING
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await CustomRequest.findByIdAndDelete(req.params.id);
    res.status(200).json("Request has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. GET USER REQUESTS
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const requests = await CustomRequest.find({ userId: req.params.userId });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. GET ALL REQUESTS (Admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    // Populate user details for the admin view
    const requests = await CustomRequest.find()
      .populate('userId', 'name email phone') // Fetch user details
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;