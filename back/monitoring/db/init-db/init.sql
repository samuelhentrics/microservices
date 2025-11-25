-- Monitoring DB init: create service_health table
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS service_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  ok BOOLEAN NOT NULL,
  status INTEGER,
  time_ms INTEGER,
  body JSONB,
  error TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_health_checked_at ON service_health(service_name, checked_at DESC);
