require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');
const fastifyCors = require('@fastify/cors');
const { ensureSchema } = require('./db');
const ordersRoutes = require('./routes/orders');

const PORT = process.env.PORT || 5006;
const QR_DIR = process.env.QR_OUTPUT_DIR || path.join(__dirname, '..', 'qrcodes');

if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true });

(async () => {
    try {
        await ensureSchema();
        fastify.log.info('Order DB schema ensured');
    } catch (err) {
        fastify.log.error('Error ensuring schema', err);
        process.exit(1);
    }

    fastify.register(fastifyCors, { origin: '*' });

    fastify.register(ordersRoutes, { prefix: '/orders', qrDir: QR_DIR });

    fastify.get('/', async () => ({ service: 'Order Service', status: 'ok' }));

    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        fastify.log.info(`Order Service listening on ${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})();