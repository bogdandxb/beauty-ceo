-- FAZA 5 — Raport lunar control produse profesionale

-- ============================================================
-- INVENTORY MONTHLY SNAPSHOTS — istoric lunar stoc profesional
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_monthly_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  snapshot_year INT NOT NULL,
  snapshot_month INT NOT NULL,
  stock_start NUMERIC(10,3) NOT NULL DEFAULT 0,
  stock_end NUMERIC(10,3) NOT NULL DEFAULT 0,
  qty_purchased NUMERIC(10,3) NOT NULL DEFAULT 0,
  qty_used NUMERIC(10,3) NOT NULL DEFAULT 0,
  qty_wasted NUMERIC(10,3) NOT NULL DEFAULT 0,
  cost_purchased NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_used NUMERIC(12,2) NOT NULL DEFAULT 0,
  product_name_snapshot TEXT NOT NULL,
  brand_snapshot TEXT,
  unit_snapshot TEXT NOT NULL DEFAULT 'ml',
  cost_per_unit_snapshot NUMERIC(12,4),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, snapshot_year, snapshot_month)
);

CREATE INDEX IF NOT EXISTS idx_inv_snapshots_period ON inventory_monthly_snapshots(snapshot_year, snapshot_month);

CREATE OR REPLACE TRIGGER trg_inv_snapshots_updated_at
  BEFORE UPDATE ON inventory_monthly_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
