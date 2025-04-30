const jwt = require('jsonwebtoken');

// JWT secret key (in production, this would be in an environment variable)
const JWT_SECRET = 'pathfinder-campaign-secret-key';

// Middleware to authenticate requests
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(403).json({ error: 'Invalid token' });
    }
}

// Middleware to check if user is a DM
function isDM(req, res, next) {
    if (!req.user.isDM) {
        return res.status(403).json({ error: 'Access denied. DM privileges required.' });
    }
    next();
}

module.exports = {
    authenticateToken,
    isDM
};