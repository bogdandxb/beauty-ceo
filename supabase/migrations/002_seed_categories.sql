-- Categorii servicii initiale
INSERT INTO service_categories (name, slug, color, icon, sort_order) VALUES
('Facial', 'facial', '#C6A769', '✦', 1),
('Remodelare Corporala', 'corp', '#B8A090', '◈', 2),
('Epilare Definitiva', 'epilare', '#E8C4B8', '◇', 3),
('Analiza Faciala', 'analiza', '#D4B8A0', '⊕', 4),
('Pachete / Programe', 'pachete', '#C6A769', '◉', 5),
('Mentorat / Training', 'mentorat', '#9A8478', '◎', 6),
('Academie', 'academie', '#C6A769', '◈', 7),
('Retail Produse', 'retail', '#B8A090', '◇', 8),
('Altele', 'altele', '#9A8478', '○', 9)
ON CONFLICT (slug) DO NOTHING;

-- Business settings initiale
INSERT INTO business_settings (
  salon_name, owner_name, currency, currency_symbol,
  working_days, open_time, close_time
) VALUES (
  'Roxana Ica Aesthetic', 'Roxana Ica', 'RON', 'lei',
  '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":true,"sun":false}',
  '09:00', '19:00'
) ON CONFLICT DO NOTHING;
