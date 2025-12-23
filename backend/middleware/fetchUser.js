const jwt = require('jsonwebtoken');

const fetchUser = (req, res, next) => {
    // 1. Get the token from the header
    const token = req.header('auth-token');
    
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
        // 2. Verify the token
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data; // Attach user data to request object
        next(); // Continue to the route
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
}

module.exports = fetchUser;