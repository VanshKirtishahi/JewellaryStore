const router = require('express').Router();
const { User } = require('../models/Schemas');
const { verifyAdmin } = require('../middleware/authMiddleware');

// GET ALL USERS (Admin Only)
// Supports /api/users?role=user
router.get('/', verifyAdmin, async (req, res) => {
  const query = req.query.new;
  const role = req.query.role;
  
  try {
    let users;
    
    if (query) {
      // Fetch latest 5 users
      users = await User.find().sort({ _id: -1 }).limit(5);
    } else if (role) {
      // Fetch by role (e.g., only 'user')
      users = await User.find({ role: role });
    } else {
      // Fetch all
      users = await User.find();
    }
    
    // Return users without sensitive data (password)
    const sanitizedUsers = users.map(user => {
      const { password, ...others } = user._doc;
      return others;
    });

    res.status(200).json(sanitizedUsers);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER STATS (Optional - for Analytics)
router.get('/stats', verifyAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE USER
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;