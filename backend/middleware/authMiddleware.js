// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 1. Verify if the user is logged in
const verifyToken = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // We attach the user ID and Role to the request
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};

// 2. Verify if the user is an Admin
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

module.exports = { verifyToken, verifyAdmin };