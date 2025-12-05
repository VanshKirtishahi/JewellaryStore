const router = require('express').Router();
const { CustomRequest } = require('../models/Schemas');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// SUBMIT REQUEST
router.post('/', verifyToken, upload.single('referenceImage'), async (req, res) => {
  try {
    const requestData = req.body;
    if (req.file) requestData.referenceImage = req.file.path;

    const newRequest = new CustomRequest(requestData);
    const savedRequest = await newRequest.save(); // Saves to 'customrequests' collection
    res.status(200).json(savedRequest);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER REQUESTS
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const requests = await CustomRequest.find({ userId: req.params.userId });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL REQUESTS (Admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const requests = await CustomRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;