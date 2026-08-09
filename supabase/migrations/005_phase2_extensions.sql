-- FAZA 2 — Extindere clients cu skin_type, hair_type

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS skin_type TEXT,
  ADD COLUMN IF NOT EXISTS hair_type TEXT;
