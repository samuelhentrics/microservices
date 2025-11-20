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
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
// support multiple allowed client ids (comma separated) for debugging/env parity
const ALLOWED_GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_ID || '').split(',').map(s => s.trim()).filter(Boolean);
const FRONT_URL = process.env.FRONT_URL || 'http://localhost:4200';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, provider_google) VALUES ($1, $2, $3, $4) RETURNING id, username, email, created_at',
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

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await pool.query('SELECT id, username, email, password_hash FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash || '');
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
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
    let result = await pool.query('SELECT id, username, email FROM users WHERE google_id=$1 OR email=$2', [providerId, email]);
    let user;
    if (result.rows.length > 0) {
      user = result.rows[0];
      // ensure google_id and provider_google flag are set
      await pool.query('UPDATE users SET provider_google=$1, google_id=$2, picture=$3, last_login=NOW() WHERE id=$4', [true, providerId, picture, user.id]);
    } else {
      // create user with google linkage
      result = await pool.query('INSERT INTO users (username, email, provider_google, google_id, picture, created_at, last_login) VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING id, username, email', [username, email, true, providerId, picture]);
      user = result.rows[0];
    }

    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('Google auth error', err);
    res.status(500).json({ error: 'Google auth failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
