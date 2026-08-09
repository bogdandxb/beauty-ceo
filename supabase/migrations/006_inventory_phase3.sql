-- FAZA 3 — Inventar: extindere products + stock movements

-- ============================================================
-- EXTINDE products cu coloane pentru inventar complet
-- ============================================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'professional',
  -- 'professional' = stoc cabină (folosit la tratamente)
  -- 'retail'       = stoc revânzare (vândut clientelor)
  ADD COLUMN IF NOT EXISTS cost_per_unit NUMERIC(12,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retail_price NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pao_months INT,
  ADD COLUMN IF NOT EXISTS opening_date DATE,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS lot_number TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS reorder_quantity NUMERIC(10,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_purchase_date DATE,
  ADD COLUMN IF NOT EXISTS last_purchase_price NUMERIC(12,2);

-- ============================================================
-- RETAIL SALES — vânzări produse retail direct din inventar
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  quantity NUMERIC(10,3) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  cost_snapshot NUMERIC(12,4),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retail_sales_product ON retail_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_retail_sales_date ON retail_sales(sale_date);

-- ============================================================
-- FUNCȚIE: adjust_stock — adaugă o mișcare de stoc și updatează current_stock
-- ============================================================
CREATE OR REPLACE FUNCTION adjust_stock(
  p_product_id UUID,
  p_movement_type TEXT,  -- 'purchase', 'use', 'sale', 'adjustment', 'waste', 'return'
  p_quantity NUMERIC,    -- pozitiv = intrare, negativ = ieșire
  p_cost NUMERIC DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO product_stock_movements (product_id, movement_type, quantity, cost_snapshot, notes, reference_id, reference_type)
  VALUES (p_product_id, p_movement_type, p_quantity, p_cost, p_notes, p_reference_id, p_reference_type);

  UPDATE products
  SET current_stock = GREATEST(current_stock + p_quantity, 0),
      updated_at = NOW()
  WHERE id = p_product_id;

  -- La achiziție, updatează și last_purchase_date / last_purchase_price
  IF p_movement_type = 'purchase' AND p_cost IS NOT NULL THEN
    UPDATE products
    SET last_purchase_date = CURRENT_DATE,
        last_purchase_price = p_cost
    WHERE id = p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
