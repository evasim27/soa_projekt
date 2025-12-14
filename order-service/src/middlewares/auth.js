const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'microservices_soa_2025_26';

async function authenticateJWT(request, reply) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
            error: 'Missing or invalid Authorization header'
        });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        request.user = decoded;
    } catch (err) {
        return reply.status(401).send({
            error: 'Invalid or expired token',
            detail: err.message
        });
    }
}

module.exports = { authenticateJWT };