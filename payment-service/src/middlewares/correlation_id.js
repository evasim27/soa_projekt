const { v4: uuidv4 } = require('uuid');
const rabbitmqLogger = require('../utils/rabbitmq_logger');

const correlationIdMiddleware = async (req, res, next) => {
    let correlationId = req.headers['x-correlation-id'];
    
    if (!correlationId) {
        correlationId = uuidv4();
    }
    
    req.correlationId = correlationId;
    
    res.setHeader('X-Correlation-ID', correlationId);
    
    const url = `http://${req.get('host')}${req.originalUrl}`;
    await rabbitmqLogger.logInfo(
        url,
        correlationId,
        `Klic storitve ${req.method} ${req.path}`
    );
    
    next();
};

module.exports = correlationIdMiddleware;