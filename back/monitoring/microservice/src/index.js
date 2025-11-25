const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Targets to monitor (internal Docker DNS names)
const TARGETS = [
  { name: 'auth', url: process.env.AUTH_URL || 'http://microservice-authentification:3000/api/auth/health' },
  { name: 'products', url: process.env.PRODUCTS_URL || 'http://products:3000/api/products/health' }
];

async function recordResult({ service_name, ok, status, time_ms, body, error }) {
  try {
    await pool.query(
      'INSERT INTO service_health (service_name, ok, status, time_ms, body, error, checked_at) VALUES ($1,$2,$3,$4,$5,$6,NOW())',
      [service_name, ok, status || null, time_ms || null, body ? JSON.stringify(body) : null, error || null]
    );
  } catch (e) {
    console.error('[monitor] failed to write health log', e.message || e);
  }
}

async function pingService(target) {
  const start = Date.now();
  try {
    const resp = await axios.get(target.url, { timeout: 2000 });
    const timeMs = Date.now() - start;
    console.log(`[monitor] ${target.name} OK (${resp.status}) ${timeMs}ms`);
    await recordResult({ service_name: target.name, ok: true, status: resp.status, time_ms: timeMs, body: resp.data });
    return { ok: true, status: resp.status, time_ms: timeMs, body: resp.data };
  } catch (err) {
    const timeMs = Date.now() - start;
    const message = err?.code === 'ECONNABORTED' || err?.message === 'timeout' ? `timeout` : (err?.message || String(err));
    console.warn(`[monitor] ${target.name} ERROR ${message} (${timeMs}ms)`);
    await recordResult({ service_name: target.name, ok: false, status: err?.response?.status || null, time_ms: timeMs, body: err?.response?.data || null, error: message });
    return { ok: false, error: message, time_ms: timeMs };
  }
}

async function checkAll() {
  console.log('[monitor] running checks for targets:', TARGETS.map(t => t.name).join(', '));
  for (const t of TARGETS) {
    try {
      // don't block too long on each; pingService has its own timeout
      await pingService(t);
    } catch (e) {
      console.error('[monitor] unexpected error while pinging', t.name, e.message || e);
    }
  }
}

// HTTP API
app.get('/api/monitoring/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Return recent logs. Query params: service (optional), limit (optional)
app.get('/api/monitoring/logs', async (req, res) => {
  try {
    const service = req.query.service;
    const limit = Number(req.query.limit) || 200;
    let result;
    if (service) {
      result = await pool.query('SELECT * FROM service_health WHERE service_name=$1 ORDER BY checked_at DESC LIMIT $2', [service, limit]);
    } else {
      result = await pool.query('SELECT * FROM service_health ORDER BY checked_at DESC LIMIT $1', [limit]);
    }
    res.json({ rows: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Start periodic checks every 5 minutes (configurable via INTERVAL_MS)
const INTERVAL_MS = Number(process.env.INTERVAL_MS) || 5 * 60 * 1000;
setTimeout(() => {
  // kick off immediately on start
  checkAll().catch(e => console.error('[monitor] initial check failed', e));
  setInterval(() => checkAll().catch(e => console.error('[monitor] scheduled check failed', e)), INTERVAL_MS);
}, 2000);

app.listen(PORT, () => console.log(`Monitoring service listening on ${PORT}, checks every ${INTERVAL_MS}ms`));
