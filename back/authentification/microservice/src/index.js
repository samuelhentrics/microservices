const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const pool = require('./db');
const cors = require('cors');
const helmet = require('helmet');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(helmet());
// Configure CORS to allow the frontend and common local dev origins.
// We allow requests with no Origin (curl, server-to-server) and any http://localhost:* origins for dev.
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser requests
    // allow configured FRONT_URL
    if (origin.startsWith(FRONT_URL)) return callback(null, true);
    // allow any localhost origin (development convenience)
    if (origin.startsWith('http://localhost')) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
// support multiple allowed client ids (comma separated) for debugging/env parity
const ALLOWED_GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_ID || '').split(',').map(s => s.trim()).filter(Boolean);
const FRONT_URL = process.env.FRONT_URL || 'http://localhost:4200';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function getClientIp(req) {
  // Prefer X-Forwarded-For when behind proxy/load-balancer
  const xff = req.headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') return xff.split(',')[0].trim();
  if (req.ip) return req.ip;
  if (req.connection && req.connection.remoteAddress) return req.connection.remoteAddress;
  return null;
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

// Simple JWT authentication middleware. Attaches `req.user` with token payload.
function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/auth/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, provider_google) VALUES ($1, $2, $3, $4) RETURNING id, username, email, picture, created_at',
      [username, email, hashed, false]
    );
    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'User already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await pool.query('SELECT id, username, email, password_hash, picture FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash || '');
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    // record a login event
    try {
      const ip = getClientIp(req);
      const ua = req.headers['user-agent'] || null;
      await pool.query('INSERT INTO logs (user_id, ip, user_agent, event, created_at) VALUES ($1,$2,$3,$4,NOW())', [user.id, ip, ua, 'login']);
    } catch (e) {
      console.warn('Failed to record login log', e);
    }

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, picture: user.picture || null } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Google Sign-In: client will POST { idToken }
app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
  // quick decode for debugging audience issues (unsafe without verification)
  let decoded = null;
  try {
    decoded = jwt.decode(idToken);
    console.log('Decoded idToken (unsafe):', { aud: decoded?.aud, iss: decoded?.iss, sub: decoded?.sub, email: decoded?.email });
  } catch (e) {
    console.warn('Failed to decode idToken', e);
  }

  try {
    // Determine audience for verification. Prefer explicit configured client IDs.
    // If none are configured (empty array), fall back to the decoded token aud for local/dev convenience
    // but log a warning so the developer can set GOOGLE_CLIENT_ID in the environment.
    let audience;
    if (ALLOWED_GOOGLE_CLIENT_IDS.length === 1) {
      audience = ALLOWED_GOOGLE_CLIENT_IDS[0];
    } else if (ALLOWED_GOOGLE_CLIENT_IDS.length > 1) {
      audience = ALLOWED_GOOGLE_CLIENT_IDS;
    } else {
      // No allowed client IDs configured in env — fall back to the decoded token aud if available
      audience = decoded?.aud || GOOGLE_CLIENT_ID || null;
      console.warn('No GOOGLE_CLIENT_ID configured in environment. Falling back to token aud for verification (development only). Please set GOOGLE_CLIENT_ID in the backend env to lock this down.');
    }

    console.log('Verifying idToken. Expected audience(s):', audience);
    const ticket = await googleClient.verifyIdToken({ idToken, audience });
    const payload = ticket.getPayload();
    // payload contains: sub (id), email, name, picture
    const providerId = payload.sub;
    const email = payload.email;
    const username = payload.name || (email ? email.split('@')[0] : null);
    const picture = payload.picture || null;

    // Try to find existing user by google_id or email
    let result = await pool.query('SELECT id, username, email, picture FROM users WHERE google_id=$1 OR email=$2', [providerId, email]);
    let user;
    if (result.rows.length > 0) {
      user = result.rows[0];
      // ensure google_id and provider_google flag are set
      await pool.query('UPDATE users SET provider_google=$1, google_id=$2, picture=$3, last_login=NOW() WHERE id=$4', [true, providerId, picture, user.id]);
    } else {
      // create user with google linkage
      result = await pool.query('INSERT INTO users (username, email, provider_google, google_id, picture, created_at, last_login) VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING id, username, email, picture', [username, email, true, providerId, picture]);
      user = result.rows[0];
    }

    const token = signToken(user);
    // record a login event for Google sign-in
    try {
      const ip = getClientIp(req);
      const ua = req.headers['user-agent'] || null;
      await pool.query('INSERT INTO logs (user_id, ip, user_agent, event, created_at) VALUES ($1,$2,$3,$4,NOW())', [user.id, ip, ua, 'google_login']);
    } catch (e) {
      console.warn('Failed to record google login log', e);
    }

    res.json({ token, user });
  } catch (err) {
    console.error('Google auth error', err);
    res.status(500).json({ error: 'Google auth failed' });
  }
});

// Return current user's profile
app.get('/api/users/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, username, email, picture, first_name AS "firstName", last_name AS "lastName", created_at AS "createdAt", last_login AS "lastLogin" FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get current user's logs (recent)
app.get('/api/users/me/logs', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, ip, user_agent AS "userAgent", event, created_at AS "createdAt" FROM logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
      [userId]
    );
    res.json({ logs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Update current user's profile (partial allowed)
app.put('/api/users/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    // fetch current user
    const current = await pool.query('SELECT id, username, email, picture, first_name, last_name FROM users WHERE id=$1', [userId]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const existing = current.rows[0];

    const { username, first_name, last_name, picture } = req.body;
    const newUsername = (typeof username === 'string' && username.length > 0) ? username : existing.username;
    const newFirst = (typeof first_name === 'string') ? first_name : existing.first_name;
    const newLast = (typeof last_name === 'string') ? last_name : existing.last_name;
    const newPicture = (typeof picture === 'string') ? picture : existing.picture;

    const result = await pool.query(
      'UPDATE users SET username=$1, first_name=$2, last_name=$3, picture=$4, last_login=NOW() WHERE id=$5 RETURNING id, username, email, picture, first_name AS "firstName", last_name AS "lastName", created_at AS "createdAt", last_login AS "lastLogin"',
      [newUsername, newFirst, newLast, newPicture, userId]
    );
    const updated = result.rows[0];
    res.json({ user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Get current user's address
app.get('/api/users/me/address', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, user_id AS "userId", line1, line2, city, postal_code AS "postalCode", country, created_at AS "createdAt" FROM addresses WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) return res.json({ address: null });
    res.json({ address: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Create or update current user's address
app.put('/api/users/me/address', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { line1, line2, city, postal_code, country } = req.body;

    // Check if address exists
    const existing = await pool.query('SELECT id FROM addresses WHERE user_id = $1', [userId]);
    let result;
    if (existing.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO addresses (user_id, line1, line2, city, postal_code, country, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING id, user_id AS "userId", line1, line2, city, postal_code AS "postalCode", country, created_at AS "createdAt"',
        [userId, line1 || null, line2 || null, city || null, postal_code || null, country || null]
      );
    } else {
      result = await pool.query(
        'UPDATE addresses SET line1=$1, line2=$2, city=$3, postal_code=$4, country=$5 WHERE user_id=$6 RETURNING id, user_id AS "userId", line1, line2, city, postal_code AS "postalCode", country, created_at AS "createdAt"',
        [line1 || null, line2 || null, city || null, postal_code || null, country || null, userId]
      );
    }
    res.json({ address: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
