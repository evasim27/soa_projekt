require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { ensureSchema } = require('./db');
const offersRouter = require('./routes/offers');

const PORT = process.env.PORT || 5005;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

(async () => {
    try {
        await ensureSchema();
        console.log('Offer DB schema ensured');
    } catch (err) {
        console.error('Error ensuring schema', err);
        process.exit(1);
    }

    const app = express();
    app.use(cors());
    app.use(morgan('tiny'));
    app.use(express.json());
    app.use('/uploads', express.static(UPLOAD_DIR));

    app.use('/offers', offersRouter);

    const specPath = path.join(__dirname, '..', 'docs', 'openapi.yaml');
    let spec = {};
    try {
        if (fs.existsSync(specPath)) {
            spec = YAML.load(specPath);
        } else {
            console.warn('Swagger spec not found at', specPath);
        }
    } catch (err) {
        console.error('Error loading OpenAPI spec:', err);
    }

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));

    app.get('/documentation/json', (req, res) => {
        return res.json(spec);
    });

    app.get('/documentation', (req, res) => {
        return res.redirect('/docs');
    });

    app.get('/', (req, res) => res.json({ service: 'Offer Service', status: 'ok' }));

    app.listen(PORT, () => console.log(`Offer Service listening on ${PORT}`));
})();