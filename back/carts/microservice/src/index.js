const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
// Configure CORS to properly answer preflight requests from the front (ng serve)
const corsOptions = {
  origin: true, // reflect request origin
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// ensure OPTIONS preflight is handled
app.options('*', cors(corsOptions));
app.use(bodyParser.json());

// Create a cart for a user
app.post('/api/carts', async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    const result = await db.query(
      'INSERT INTO carts(user_id) VALUES($1) RETURNING *',
      [user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Get cart by user id (latest)
app.get('/api/carts', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    const cartRes = await db.query(
      'SELECT * FROM carts WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
      [user_id]
    );
    const cart = cartRes.rows[0];
    if (!cart) return res.json({ cart: null, items: [] });
    const itemsRes = await db.query('SELECT * FROM cart_items WHERE cart_id = $1', [cart.id]);
    res.json({ cart, items: itemsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Add item to cart
app.post('/api/carts/:cartId/items', async (req, res) => {
  try {
    const { cartId } = req.params;
    const { product_id, quantity = 1, metadata = null } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id required' });
    const result = await db.query(
      'INSERT INTO cart_items(cart_id, product_id, quantity, metadata) VALUES($1,$2,$3,$4) RETURNING *',
      [cartId, product_id, quantity, metadata]
    );
    await db.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Remove item
app.delete('/api/carts/:cartId/items/:itemId', async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    await db.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
    await db.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cartId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Simple health
app.get('/api/carts/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Carts microservice started on', port));
