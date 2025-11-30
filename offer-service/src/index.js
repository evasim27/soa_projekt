require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

    app.get('/', (req, res) => res.json({ service: 'Offer Service', status: 'ok' }));

    app.listen(PORT, () => console.log(`Offer Service listening on ${PORT}`));
})();