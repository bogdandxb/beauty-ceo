-- FAZA 4 — Calendar (appointments) + Marketing

-- ============================================================
-- APPOINTMENTS — programări
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration_minutes INT NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled',
  -- 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  client_name_manual TEXT,   -- dacă clienta nu e înregistrată
  service_name_manual TEXT,  -- dacă serviciul nu e în listă
  price_estimate NUMERIC(12,2),
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE OR REPLACE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- EXTINDE marketing_campaigns cu câmpuri lipsă
-- ============================================================
ALTER TABLE marketing_campaigns
  ADD COLUMN IF NOT EXISTS objective TEXT,        -- 'awareness' | 'leads' | 'retention' | 'reactivation'
  ADD COLUMN IF NOT EXISTS target_audience TEXT,
  ADD COLUMN IF NOT EXISTS budget_planned NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_pct NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS new_clients_acquired INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS existing_clients_reached INT DEFAULT 0;
