const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');

module.exports = async function (fastify, opts) {
    const qrDir = opts.qrDir || path.join(__dirname, '..', '..', 'qrcodes');

    // GET 1: list orders
    fastify.get('/', {
        schema: {
            summary: 'List orders',
            description: 'Return list of orders, optionally filtered by status',
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'integer', default: 50 },
                    offset: { type: 'integer', default: 0 },
                    status: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            offer_id: { type: ['integer', 'null'] },
                            name: { type: 'string' },
                            email: { type: ['string', 'null'] },
                            phone: { type: ['string', 'null'] },
                            quantity: { type: 'integer' },
                            status: { type: 'string' },
                            qr_image: { type: ['string', 'null'] },
                            created_at: { type: 'string' },
                            updated_at: { type: 'string' }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const { limit = 50, offset = 0, status } = request.query;
        const params = [];
        let sql = 'SELECT * FROM orders';
        if (status) {
            sql += ' WHERE status=$1';
            params.push(status);
        }
        sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(limit), parseInt(offset));
        const { rows } = await pool.query(sql, params);
        return rows;
    });

    // GET 2: get order
    fastify.get('/:id', {
        schema: {
            summary: 'Get an order by id',
            params: {
                type: 'object',
                properties: { id: { type: 'integer' } },
                required: ['id']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        offer_id: { type: ['integer', 'null'] },
                        name: { type: 'string' },
                        email: { type: ['string', 'null'] },
                        phone: { type: ['string', 'null'] },
                        quantity: { type: 'integer' },
                        status: { type: 'string' },
                        qr_image: { type: ['string', 'null'] },
                        created_at: { type: 'string' },
                        updated_at: { type: 'string' }
                    }
                },
                404: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1', [request.params.id]);
        if (!rows[0]) return reply.status(404).send({ error: 'not found' });
        return rows[0];
    });

    // POST 1: create order + generate QR
    fastify.post('/', {
        schema: {
            summary: 'Create order and generate QR',
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    offer_id: { type: ['integer', 'null'] },
                    name: { type: 'string' },
                    email: { type: ['string', 'null'] },
                    phone: { type: ['string', 'null'] },
                    quantity: { type: 'integer', default: 1 }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        order: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                offer_id: { type: ['integer', 'null'] },
                                name: { type: 'string' },
                                email: { type: ['string', 'null'] },
                                phone: { type: ['string', 'null'] },
                                quantity: { type: 'integer' },
                                status: { type: 'string' },
                                qr_image: { type: ['string', 'null'] },
                                created_at: { type: 'string' },
                                updated_at: { type: 'string' }
                            }
                        },
                        qrUrl: { type: 'string' }
                    }
                },
                400: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const { offer_id, name, email, phone, quantity = 1 } = request.body;
            if (!name) return reply.status(400).send({ error: 'name required' });
            const insert = `INSERT INTO orders (offer_id, name, email, phone, quantity) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
            const { rows } = await pool.query(insert, [offer_id, name, email, phone, quantity]);
            const order = rows[0];
            const qrData = JSON.stringify({ type: 'reservation', id: order.id });
            const filename = `qr-${order.id}.png`;
            const filepath = path.join(qrDir, filename);
            try { fs.mkdirSync(qrDir, { recursive: true }); } catch (e) { }
            await QRCode.toFile(filepath, qrData, { width: 300 });
            await pool.query('UPDATE orders SET qr_image=$1, updated_at=now() WHERE id=$2', [filename, order.id]);
            const { rows: updated } = await pool.query('SELECT * FROM orders WHERE id=$1', [order.id]);

            return reply.status(201).send({ order: updated[0], qrUrl: `/orders/qrcodes/${filename}` });
        } catch (err) {
            return reply.status(400).send({ error: err.message });
        }
    });

    // POST 2: confirm reservation
    fastify.post('/:id/confirm', {
        schema: {
            summary: 'Confirm reservation',
            params: {
                type: 'object',
                properties: { id: { type: 'integer' } },
                required: ['id']
            },
            response: {
                200: { type: 'object' },
                404: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1', [request.params.id]);
        if (!rows[0]) return reply.status(404).send({ error: 'not found' });
        await pool.query('UPDATE orders SET status=$1, updated_at=now() WHERE id=$2', ['reserved', request.params.id]);
        const { rows: updated } = await pool.query('SELECT * FROM orders WHERE id=$1', [request.params.id]);
        return updated[0];
    });

    // PUT 1: update order
    fastify.put('/:id', {
        schema: {
            summary: 'Update order fields',
            params: {
                type: 'object',
                properties: { id: { type: 'integer' } },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    offer_id: { type: ['integer', 'null'] },
                    name: { type: 'string' },
                    email: { type: ['string', 'null'] },
                    phone: { type: ['string', 'null'] },
                    quantity: { type: 'integer' }
                }
            },
            response: {
                200: { type: 'object' },
                400: { type: 'object', properties: { error: { type: 'string' } } },
                404: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const fields = ['offer_id', 'name', 'email', 'phone', 'quantity'];
            const updates = [];
            const params = [];
            let idx = 1;
            for (const f of fields) {
                if (request.body[f] !== undefined) {
                    updates.push(`${f}=$${idx++}`);
                    params.push(request.body[f]);
                }
            }
            if (updates.length === 0) return reply.status(400).send({ error: 'no fields provided' });
            params.push(request.params.id);
            const sql = `UPDATE orders SET ${updates.join(',')}, updated_at=now() WHERE id=$${idx} RETURNING *`;
            const { rows } = await pool.query(sql, params);
            if (!rows[0]) return reply.status(404).send({ error: 'not found' });
            return rows[0];
        } catch (err) {
            return reply.status(400).send({ error: err.message });
        }
    });

    // PUT 2: change status only
    fastify.put('/:id/status', {
        schema: {
            summary: 'Change order status',
            params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] },
            body: {
                type: 'object',
                properties: { status: { type: 'string', enum: ['pending', 'reserved', 'collected', 'cancelled'] } },
                required: ['status']
            },
            response: {
                200: { type: 'object' },
                400: { type: 'object', properties: { error: { type: 'string' } } },
                404: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        const { status } = request.body;
        if (!['pending', 'reserved', 'collected', 'cancelled'].includes(status)) {
            return reply.status(400).send({ error: 'invalid status' });
        }
        const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1', [request.params.id]);
        if (!rows[0]) return reply.status(404).send({ error: 'not found' });
        await pool.query('UPDATE orders SET status=$1, updated_at=now() WHERE id=$2', [status, request.params.id]);
        const { rows: updated } = await pool.query('SELECT * FROM orders WHERE id=$1', [request.params.id]);
        return updated[0];
    });

    // DELETE 1: cancel order
    fastify.delete('/:id', {
        schema: {
            summary: 'Delete (cancel) order',
            params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] },
            response: {
                200: { type: 'object', properties: { message: { type: 'string' } } },
                404: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        const { rows } = await pool.query('DELETE FROM orders WHERE id=$1 RETURNING *', [request.params.id]);
        if (!rows[0]) return reply.status(404).send({ error: 'not found' });
        if (rows[0].qr_image) {
            try { fs.unlinkSync(path.join(qrDir, rows[0].qr_image)); } catch (e) { }
        }
        return { message: 'deleted' };
    });

    // DELETE 2: delete qr only
    fastify.delete('/:id/qr', {
        schema: {
            summary: 'Delete QR of order',
            params: { type: 'object', properties: { id: { type: 'integer' } }, required: ['id'] },
            response: {
                200: { type: 'object', properties: { message: { type: 'string' } } },
                404: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        const { rows } = await pool.query('SELECT qr_image FROM orders WHERE id=$1', [request.params.id]);
        if (!rows[0]) return reply.status(404).send({ error: 'not found' });
        if (rows[0].qr_image) {
            try { fs.unlinkSync(path.join(qrDir, rows[0].qr_image)); } catch (e) { }
            await pool.query('UPDATE orders SET qr_image=NULL, updated_at=now() WHERE id=$1', [request.params.id]);
        }
        return { message: 'qr deleted' };
    });

    fastify.get('/qrcodes/:file', {
        schema: {
            summary: 'Serve QR image file',
            params: { type: 'object', properties: { file: { type: 'string' } }, required: ['file'] },
            response: {
                200: { type: 'string' },
                404: { type: 'object', properties: { error: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        const file = request.params.file;
        const p = path.join(qrDir, file);
        if (!fs.existsSync(p)) return reply.status(404).send({ error: 'not found' });
        const ext = path.extname(file).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : 'application/octet-stream';
        reply.header('Content-Type', contentType);
        const stream = fs.createReadStream(p);
        return reply.send(stream);
    });

};