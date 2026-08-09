-- FAZA 1 — Extensions pentru Settings, Services CRUD, Expenses CRUD

-- ============================================================
-- EXTINDE business_settings cu coloane noi
-- ============================================================
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS operator_cost_per_hour NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS demo_mode BOOLEAN NOT NULL DEFAULT TRUE;

-- ============================================================
-- SEGMENT RULES — reguli configurabile pentru segmentare clienti
-- ============================================================
CREATE TABLE IF NOT EXISTS segment_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  segment TEXT NOT NULL UNIQUE,
  min_visits INT DEFAULT 0,
  max_visits INT,
  min_days_since_last_visit INT DEFAULT 0,
  max_days_since_last_visit INT,
  label_ro TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#C6A769',
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO segment_rules (segment, min_visits, max_visits, min_days_since_last_visit, max_days_since_last_visit, label_ro, color, sort_order) VALUES
('new',       0, 1,    0,   9999, 'Nouă',      '#C6A769', 1),
('returning', 2, 5,    0,   90,   'Recurentă', '#3b82f6', 2),
('loyal',     6, NULL, 0,   90,   'Loială',    '#22c55e', 3),
('inactive',  1, NULL, 91,  180,  'Inactivă',  '#f59e0b', 4),
('lapsed',    1, NULL, 181, NULL, 'Pierdută',  '#ef4444', 5)
ON CONFLICT (segment) DO NOTHING;

-- ============================================================
-- EXPENSE CATEGORIES — categorii configurabile
-- ============================================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'variable', -- fixed / variable / investment
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO expense_categories (name, type, sort_order) VALUES
('Chirie',           'fixed',      1),
('Utilități',        'fixed',      2),
('Contabilitate',    'fixed',      3),
('Software',         'fixed',      4),
('Salarii',          'fixed',      5),
('Marketing',        'variable',   6),
('Produse',          'variable',   7),
('Consumabile',      'variable',   8),
('Service aparat',   'variable',   9),
('Training',         'variable',  10),
('Taxe',             'fixed',     11),
('Aparatură',        'investment',12),
('Altele',           'variable',  13)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- EXTINDE expenses cu tip cost si vendor
-- ============================================================
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS expense_type TEXT NOT NULL DEFAULT 'variable',
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- EXTINDE recurring_expenses cu detalii
-- ============================================================
ALTER TABLE recurring_expenses
  ADD COLUMN IF NOT EXISTS vendor TEXT,
  ADD COLUMN IF NOT EXISTS expense_type TEXT NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'transfer';

-- ============================================================
-- EXTINDE services cu costuri detaliate
-- ============================================================
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS operator_cost NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_costs NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consumables_cost NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- EXTINDE equipment cu costuri complete
-- ============================================================
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS installation_cost NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS training_cost NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accessories_cost NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_service_date DATE,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- TARGETS — adauga coloane pentru occupancy si avg ticket
-- ============================================================
ALTER TABLE targets
  ADD COLUMN IF NOT EXISTS target_revenue_weekly NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS target_revenue_quarterly NUMERIC(12,2);

-- ============================================================
-- INVENTORY SETTINGS in business_settings
-- ============================================================
ALTER TABLE business_settings
  ADD COLUMN IF NOT EXISTS low_stock_threshold_pct NUMERIC(5,2) DEFAULT 20,
  ADD COLUMN IF NOT EXISTS expiry_warning_days_1 INT DEFAULT 90,
  ADD COLUMN IF NOT EXISTS expiry_warning_days_2 INT DEFAULT 60,
  ADD COLUMN IF NOT EXISTS expiry_warning_days_3 INT DEFAULT 30;

-- ============================================================
-- UPDATE update_client_stats function
-- ============================================================
CREATE OR REPLACE FUNCTION update_client_stats(p_client_id UUID)
RETURNS void AS $$
DECLARE
  v_visits INT;
  v_spent NUMERIC;
  v_last_visit DATE;
  v_avg NUMERIC;
  v_seg TEXT;
  v_days_since INT;
BEGIN
  SELECT
    COUNT(*),
    COALESCE(SUM(final_price), 0),
    MAX(treatment_date),
    COALESCE(AVG(final_price), 0)
  INTO v_visits, v_spent, v_last_visit, v_avg
  FROM treatments
  WHERE client_id = p_client_id AND status = 'completed';

  v_days_since := COALESCE(CURRENT_DATE - v_last_visit, 9999);

  IF v_days_since > 180 AND v_visits >= 1 THEN
    v_seg := 'lapsed';
  ELSIF v_days_since > 90 AND v_visits >= 1 THEN
    v_seg := 'inactive';
  ELSIF v_visits >= 6 THEN
    v_seg := 'loyal';
  ELSIF v_visits >= 2 THEN
    v_seg := 'returning';
  ELSE
    v_seg := 'new';
  END IF;

  UPDATE clients SET
    total_visits        = v_visits,
    total_spent         = v_spent,
    last_visit_date     = v_last_visit,
    average_order_value = v_avg,
    segment             = v_seg,
    updated_at          = NOW()
  WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DELETE ALL DEMO DATA function
-- ============================================================
CREATE OR REPLACE FUNCTION delete_all_demo_data()
RETURNS void AS $$
BEGIN
  DELETE FROM treatment_products_used WHERE treatment_id IN (SELECT id FROM treatments WHERE is_demo = TRUE);
  DELETE FROM treatments WHERE is_demo = TRUE;
  DELETE FROM packages WHERE is_demo = TRUE;
  DELETE FROM clients WHERE is_demo = TRUE;
  DELETE FROM service_ingredients WHERE service_id IN (SELECT id FROM services WHERE is_demo = TRUE);
  DELETE FROM services WHERE is_demo = TRUE;
  DELETE FROM equipment WHERE is_demo = TRUE;
  DELETE FROM product_stock_movements WHERE is_demo = TRUE;
  DELETE FROM products WHERE is_demo = TRUE;
  DELETE FROM expenses WHERE is_demo = TRUE;
  DELETE FROM recurring_expenses WHERE is_demo = TRUE;
  DELETE FROM marketing_campaigns WHERE is_demo = TRUE;
  UPDATE business_settings SET demo_mode = FALSE WHERE TRUE;
END;
$$ LANGUAGE plpgsql;
