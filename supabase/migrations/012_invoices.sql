-- Tabel facturi achizitie produse
CREATE TABLE IF NOT EXISTS purchase_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT,
  supplier TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12,2),
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel linii factura (produse din factura)
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,3) NOT NULL,
  unit_price NUMERIC(12,2),
  total_price NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON purchase_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON purchase_invoice_items(product_id);
