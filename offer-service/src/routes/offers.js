const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');

const router = express.Router();
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET 1: list offers
router.get('/', async (req, res) => {
    try {
        const { limit = 50, offset = 0, q } = req.query;
        let sql = 'SELECT * FROM offers';
        const params = [];
        if (q) {
            sql += ' WHERE title ILIKE $1 OR description ILIKE $1';
            params.push(`%${q}%`);
        }
        sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(limit), parseInt(offset));
        const { rows } = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET 2: get by id
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM offers WHERE id=$1', [req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST 1: create offer
router.post('/', async (req, res) => {
    try {
        const { title, description, quantity = 1, unit = 'pcs', price = 0, location } = req.body;
        if (!title) return res.status(400).json({ error: 'title required' });
        const sql = `INSERT INTO offers (title, description, quantity, unit, price, location) 
                 VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
        const params = [title, description, quantity, unit, price, location];
        const { rows } = await pool.query(sql, params);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST 2: upload image
router.post('/:id/image', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'image file required' });

        const { rows } = await pool.query('SELECT image FROM offers WHERE id=$1', [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Not found' });
        if (rows[0].image) {
            try { fs.unlinkSync(path.join(UPLOAD_DIR, rows[0].image)); } catch (e) { }
        }
        await pool.query('UPDATE offers SET image=$1, updated_at=now() WHERE id=$2', [file.filename, id]);
        res.json({ message: 'Uploaded', imageUrl: `/uploads/${file.filename}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT 1: update offer
router.put('/:id', async (req, res) => {
    try {
        const fields = ['title', 'description', 'quantity', 'unit', 'price', 'location'];
        const updates = [];
        const params = [];
        let idx = 1;
        for (const f of fields) {
            if (req.body[f] !== undefined) {
                updates.push(`${f}=$${idx++}`);
                params.push(req.body[f]);
            }
        }
        if (updates.length === 0) return res.status(400).json({ error: 'no fields provided' });
        params.push(req.params.id);
        const sql = `UPDATE offers SET ${updates.join(',')}, updated_at=now() WHERE id=$${idx} RETURNING *`;
        const { rows } = await pool.query(sql, params);
        if (!rows[0]) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT 2: adjust stock
router.put('/:id/stock', async (req, res) => {
    try {
        const { delta } = req.body;
        if (typeof delta !== 'number') return res.status(400).json({ error: 'delta number required' });
        const sql = `UPDATE offers SET quantity = GREATEST(0, COALESCE(quantity,0) + $1), updated_at=now() WHERE id=$2 RETURNING *`;
        const { rows } = await pool.query(sql, [delta, req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE 1: delete offer
router.delete('/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('DELETE FROM offers WHERE id=$1 RETURNING *', [req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: 'Not found' });
        if (rows[0].image) {
            try { fs.unlinkSync(path.join(UPLOAD_DIR, rows[0].image)); } catch (e) { }
        }
        res.json({ message: 'deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE 2: delete image only
router.delete('/:id/image', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT image FROM offers WHERE id=$1', [req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: 'Not found' });
        if (rows[0].image) {
            try { fs.unlinkSync(path.join(UPLOAD_DIR, rows[0].image)); } catch (e) { }
            await pool.query('UPDATE offers SET image=NULL, updated_at=now() WHERE id=$1', [req.params.id]);
        }
        res.json({ message: 'image deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;