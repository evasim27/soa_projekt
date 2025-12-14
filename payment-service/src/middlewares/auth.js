const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'microservices_soa_2025_26';

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Missing or invalid Authorization header'
        });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired token',
            detail: err.message
        });
    }
}

module.exports = { authenticateJWT };