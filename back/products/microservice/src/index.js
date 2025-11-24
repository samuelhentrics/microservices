const express = require('express');
const pool = require('./db');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// List products with optional simple filters
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.price, p.image_url AS image, p.origin, p.weight,
              t.name AS type, a.name AS animal
       FROM products p
       LEFT JOIN type t ON p.type_id = t.id
       LEFT JOIN animal a ON p.animal_id = a.id
       ORDER BY p.name ASC`
    );
    const rows = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      price: Number(r.price),
      image: r.image,
      origin: r.origin,
      weight: r.weight,
      category: r.type,
      animal: r.animal
    }));
    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Return N random products (default 3)
app.get('/api/products/random', async (req, res) => {
  try {
    const count = Number(req.query.count) || 3;
    const result = await pool.query(
      `SELECT p.id, p.name, p.price, p.image_url AS image, p.origin, p.weight,
              t.name AS type, a.name AS animal
       FROM products p
       LEFT JOIN type t ON p.type_id = t.id
       LEFT JOIN animal a ON p.animal_id = a.id
       ORDER BY random()
       LIMIT $1`,
      [count]
    );
    const rows = result.rows.map(r => ({
      id: r.id,
      name: r.name,
      price: Number(r.price),
      image: r.image,
      origin: r.origin,
      weight: r.weight,
      category: r.type,
      animal: r.animal
    }));
    console.log(`[products] random: found ${rows.length} products (requested ${count})`);
    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Debug endpoint: return all products (no joins) for quick inspection
app.get('/api/products/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name');
    console.log(`[products] /all: rows=${result.rows.length}`);
    res.json({ rows: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Only match UUID-like ids to avoid catching literal route names like 'random' or 'all'
app.get('/api/products/:id([0-9a-fA-F-]{36})', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      `SELECT p.id, p.name, p.price, p.image_url AS image, p.origin, p.weight,
              t.name AS type, a.name AS animal
       FROM products p
       LEFT JOIN type t ON p.type_id = t.id
       LEFT JOIN animal a ON p.animal_id = a.id
       WHERE p.id = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const r = result.rows[0];
    res.json({ product: {
      id: r.id,
      name: r.name,
      price: Number(r.price),
      image: r.image,
      origin: r.origin,
      weight: r.weight,
      category: r.type,
      animal: r.animal
    }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Products service listening on ${port}`));
