const CustomRequest = require('../models/CustomRequest');

// @desc    Submit a new custom request
// @route   POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const { fullName, email, visionDescription } = req.body;
    const referenceImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newRequest = new CustomRequest({
      fullName,
      email,
      visionDescription,
      referenceImageUrl
    });

    const savedRequest = await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully', request: savedRequest });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all requests (Admin)
// @route   GET /api/requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await CustomRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get requests for a specific user (Profile Tracking)
// @route   GET /api/requests/my-requests
exports.getUserRequests = async (req, res) => {
  try {
    const { email } = req.query; // We will pass email as a query parameter
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const requests = await CustomRequest.find({ email }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};