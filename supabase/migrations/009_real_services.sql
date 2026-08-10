-- SERVICII REALE — importate din roxana-ica-aesthetic/lib/services.ts
-- Șterge demo services și inserează cele reale

-- 1. Curăță serviciile demo
DELETE FROM service_ingredients WHERE service_id IN (SELECT id FROM services WHERE is_demo = TRUE);
DELETE FROM services WHERE is_demo = TRUE;

-- 2. Asigură categoriile necesare
INSERT INTO service_categories (name, slug, sort_order) VALUES
  ('Protocoale Faciale',         'protocoale-faciale',    1),
  ('Epilare Definitivă',         'epilare-definitiva',    2),
  ('Remodelare Corporală',       'remodelare-corporala',  3),
  ('Electrostimulare',           'electrostimulare',      4),
  ('Plasma Fusion',              'plasma-fusion',         5),
  ('IPL',                        'ipl',                   6),
  ('Laser Nd:YAG',               'laser-yag',             7),
  ('Recuperare & Terapie',       'recuperare-terapie',    8),
  ('Skin Analyzer',              'skin-analyzer',         9),
  ('Mentorat & Cursuri',         'mentorat-cursuri',     10)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- 3. Inserează serviciile reale
-- ============================================================
-- PROTOCOALE FACIALE
-- ============================================================
WITH cat AS (SELECT id FROM service_categories WHERE slug = 'protocoale-faciale')
INSERT INTO services (category_id, name, slug, price, duration_minutes, is_active, is_demo) VALUES
  ((SELECT id FROM cat), 'Skin Reset Hydration',            'skin-reset-hydration',          420,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Acne Control Protocol',           'acne-control-protocol',         435,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Skin Tone Balance',               'skin-tone-balance',             420,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Bio Renewal Peels',               'bio-renewal-peels',             480,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Carboxy Revital Therapy',         'carboxy-revital-therapy',       480,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Facial Glow Ritual',              'facial-glow-ritual',            350,  50, TRUE, FALSE),
  ((SELECT id FROM cat), 'Advanced Microneedling',          'advanced-microneedling',        660,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Microneedling Față + Gât',        'microneedling-fata-gat',        750,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Biorevitalizare Eye Boost',       'biorevitalizare-eye-boost',     390,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Biorevitalizare Neck Boost',      'biorevitalizare-neck-boost',    420,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Biorevitalizare Full Face Boost', 'biorevitalizare-full-face',    1250,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Biorevitalizare Mâini',           'biorevitalizare-maini',         650,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Back Deep Clean Protocol',        'back-deep-clean',               720,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Body Microneedling + BioRePeel',  'body-microneedling-bioreepeel', 800,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Hair Density Protocol',           'hair-density-protocol',         420,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'BioRePeel Face Therapy',          'bioreepeel-face-therapy',       480,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Spongilla Bio Microneedling',     'spongilla-bio-microneedling',   420,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'VITA+ Bioline Jatò',              'vita-plus-bioline',             560,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'ENERGY Bioline Jatò',             'energy-bioline',                560,  60, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  duration_minutes = EXCLUDED.duration_minutes,
  is_demo = FALSE;

-- ============================================================
-- EPILARE DEFINITIVĂ — Femei
-- ============================================================
WITH cat AS (SELECT id FROM service_categories WHERE slug = 'epilare-definitiva')
INSERT INTO services (category_id, name, slug, price, duration_minutes, is_active, is_demo) VALUES
  ((SELECT id FROM cat), 'Epilare Față',               'epilare-fata',               150, 30, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Mustață',             'epilare-mustata',             45, 15, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Bărbie',              'epilare-barbie',              65, 15, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Axilă',               'epilare-axila',              130, 20, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Inghinal Parțial',    'epilare-inghinal-partial',   130, 20, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Inghinal Complet',    'epilare-inghinal-complet',   170, 30, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Fese',                'epilare-fese',                80, 20, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Picioare Scurt',      'epilare-picioare-scurt',     250, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Picioare Lung',       'epilare-picioare-lung',      350, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Spate / Piept',       'epilare-spate-piept',        160, 30, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Abdomen / Lombar',    'epilare-abdomen-lombar',     125, 20, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Brațe',               'epilare-brate',              170, 30, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Full Body Femei',     'epilare-full-body-femei',    650, 120, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Axilă Bărbați',       'epilare-axila-barbati',      150, 20, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Picioare Scurt B.',   'epilare-picioare-scurt-b',   300, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Picioare Lung B.',    'epilare-picioare-lung-b',    450, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Spate / Piept B.',    'epilare-spate-piept-b',      200, 30, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Abdomen / Lombar B.', 'epilare-abdomen-lombar-b',   200, 20, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Brațe Bărbați',       'epilare-brate-barbati',      250, 30, TRUE, FALSE),
  ((SELECT id FROM cat), 'Epilare Full Body Bărbați',   'epilare-full-body-barbati',  800, 120, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, is_demo = FALSE;

-- ============================================================
-- REMODELARE CORPORALĂ
-- ============================================================
WITH cat AS (SELECT id FROM service_categories WHERE slug = 'remodelare-corporala')
INSERT INTO services (category_id, name, slug, price, duration_minutes, is_active, is_demo) VALUES
  ((SELECT id FROM cat), 'Remodelare Față / Flancuri',  'remodelare-fata-flancuri',  150,  20, TRUE, FALSE),
  ((SELECT id FROM cat), 'Remodelare Fese / Spate',     'remodelare-fese-spate',     200,  20, TRUE, FALSE),
  ((SELECT id FROM cat), 'Remodelare Abdomen',          'remodelare-abdomen',        250,  30, TRUE, FALSE),
  ((SELECT id FROM cat), 'Remodelare Picioare',         'remodelare-picioare',       400,  60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Remodelare Full Body',        'remodelare-full-body',     1150,  90, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, is_demo = FALSE;

-- ============================================================
-- ELECTROSTIMULARE
-- ============================================================
WITH cat AS (SELECT id FROM service_categories WHERE slug = 'electrostimulare')
INSERT INTO services (category_id, name, slug, price, duration_minutes, is_active, is_demo) VALUES
  ((SELECT id FROM cat), 'Electrostimulare – 1 ședință', 'electrostimulare-sedinta', 250, 45, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, is_demo = FALSE;

-- ============================================================
-- PLASMA FUSION
-- ============================================================
WITH cat AS (SELECT id FROM service_categories WHERE slug = 'plasma-fusion')
INSERT INTO services (category_id, name, slug, price, duration_minutes, is_active, is_demo) VALUES
  ((SELECT id FROM cat), 'Plasma – Ridicare Pleoape',        'plasma-ridicare-pleoape',     600, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Riduri Zona Ochilor',     'plasma-riduri-ochi',          600, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Pungi Sub Ochi',          'plasma-pungi-ochi',           600, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Full Face',               'plasma-full-face',            900, 90, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Riduri Frunte',           'plasma-riduri-frunte',        500, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Gât și Decolteu',         'plasma-gat-decolteu',         600, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Piele Flască Abdomen',    'plasma-flasca-abdomen',       600, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Vergeturi Abdomen',       'plasma-vergeturi-abdomen',    700, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Vergeturi Coapse',        'plasma-vergeturi-coapse',     650, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Vergeturi Picioare',      'plasma-vergeturi-picioare',   650, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Celulită',                'plasma-celulita',             400, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Cicatrici Acnee',         'plasma-cicatrici-acnee',      500, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Pete Pigmentare',         'plasma-pete-pigmentare',      400, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Lifting Coate/Genunchi',  'plasma-lifting-coate',        300, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Alopecie',                'plasma-alopecie',             400, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Plasma – Acnee',                   'plasma-acnee',                500, 45, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, is_demo = FALSE;

-- ============================================================
-- IPL
-- ============================================================
WITH cat AS (SELECT id FROM service_categories WHERE slug = 'ipl')
INSERT INTO services (category_id, name, slug, price, duration_minutes, is_active, is_demo) VALUES
  ((SELECT id FROM cat), 'IPL Skin Rejuvenation',    'ipl-skin-rejuvenation',  480, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'IPL Pigment Correction',   'ipl-pigment-correction', 500, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'IPL Vascular Therapy',     'ipl-vascular-therapy',   515, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'IPL Rosacea Control',      'ipl-rosacea-control',    515, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'IPL Acne Therapy',         'ipl-acne-therapy',       450, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'IPL Skin Tone & Texture',  'ipl-skin-tone-texture',  480, 45, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, is_demo = FALSE;

-- ============================================================
-- LASER Nd:YAG
-- ============================================================
WITH cat AS (SELECT id FROM service_categories WHERE slug = 'laser-yag')
INSERT INTO services (category_id, name, slug, price, duration_minutes, is_active, is_demo) VALUES
  ((SELECT id FROM cat), 'Carbon Laser Detox (Hollywood Peel)', 'carbon-laser-detox',        420, 60, TRUE, FALSE),
  ((SELECT id FROM cat), 'Laser Acne Therapy',                  'laser-acne-therapy',        450, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Laser Skin Rejuvenation',             'laser-skin-rejuvenation',   480, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Pigment Removal Laser',               'pigment-removal-laser',     515, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Tattoo Removal (per zonă)',            'tattoo-removal',            200, 30, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, is_demo = FALSE;

-- ============================================================
-- RECUPERARE & TERAPIE
-- ============================================================
WITH cat AS (SELECT id FROM service_categories WHERE slug = 'recuperare-terapie')
INSERT INTO services (category_id, name, slug, price, duration_minutes, is_active, is_demo) VALUES
  ((SELECT id FROM cat), 'Terapie Tecar – Ședință Unică',       'tecar-sedinta',         250, 45, TRUE, FALSE),
  ((SELECT id FROM cat), 'Masaj G5 – Ședință Unică',            'masaj-g5-sedinta',      150, 30, TRUE, FALSE),
  ((SELECT id FROM cat), 'Protocol Combinat Tecar + G5',        'tecar-g5-combinat',     350, 60, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, is_demo = FALSE;

-- ============================================================
-- SKIN ANALYZER
-- ============================================================
WITH cat AS (SELECT id FROM service_categories WHERE slug = 'skin-analyzer')
INSERT INTO services (category_id, name, slug, price, duration_minutes, is_active, is_demo) VALUES
  ((SELECT id FROM cat), 'Analiză Facială – Skin Analyzer', 'skin-analyzer-analiza', 200, 30, TRUE, FALSE)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, is_demo = FALSE;
