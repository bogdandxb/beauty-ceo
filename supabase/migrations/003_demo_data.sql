-- DEMO DATA — Roxana Ica Aesthetic
-- Toate inregistrarile au is_demo = TRUE

DO $$
DECLARE
  -- Categorii
  cat_facial UUID;
  cat_corp UUID;
  cat_epilare UUID;
  cat_analiza UUID;

  -- Echipamente
  eq_laser UUID;
  eq_ipl UUID;
  eq_micro UUID;
  eq_radiofrecventa UUID;
  eq_hydrafacial UUID;

  -- Produse
  pr_ser_vitc UUID;
  pr_acid_hialuronic UUID;
  pr_crema_spf UUID;
  pr_gel_aloe UUID;
  pr_ulei_masaj UUID;
  pr_exfoliant UUID;
  pr_masca_argila UUID;
  pr_ser_retinol UUID;
  pr_lotiune_dupa UUID;
  pr_gel_conductiv UUID;

  -- Servicii
  sv_facial_hidratare UUID;
  sv_facial_antiage UUID;
  sv_microneedling UUID;
  sv_epilare_axile UUID;
  sv_epilare_picioare UUID;
  sv_epilare_bikini UUID;
  sv_remodelare_corp UUID;
  sv_radiofrecventa UUID;
  sv_analiza_faciala UUID;
  sv_hydrafacial UUID;

  -- Clienti
  cl1 UUID; cl2 UUID; cl3 UUID; cl4 UUID; cl5 UUID;
  cl6 UUID; cl7 UUID; cl8 UUID; cl9 UUID; cl10 UUID;
  cl11 UUID; cl12 UUID;

BEGIN

-- ============================================================
-- CATEGORII (deja existente, preluam ID-urile)
-- ============================================================
SELECT id INTO cat_facial FROM service_categories WHERE slug = 'facial';
SELECT id INTO cat_corp FROM service_categories WHERE slug = 'corp';
SELECT id INTO cat_epilare FROM service_categories WHERE slug = 'epilare';
SELECT id INTO cat_analiza FROM service_categories WHERE slug = 'analiza';

-- ============================================================
-- ECHIPAMENTE DEMO
-- ============================================================
INSERT INTO equipment (name, brand, model, purchase_date, purchase_price, purchase_price_ron,
  expected_lifespan_years, maintenance_cost_yearly, is_demo)
VALUES ('Laser Dioda 808nm', 'Alma Lasers', 'Soprano Ice Platinum', '2023-03-15', 15000, 15000, 7, 1200, TRUE)
RETURNING id INTO eq_laser;

INSERT INTO equipment (name, brand, model, purchase_date, purchase_price, purchase_price_ron,
  expected_lifespan_years, maintenance_cost_yearly, is_demo)
VALUES ('Aparat IPL Profesional', 'Lumenis', 'M22', '2022-06-01', 8500, 8500, 6, 800, TRUE)
RETURNING id INTO eq_ipl;

INSERT INTO equipment (name, brand, model, purchase_date, purchase_price, purchase_price_ron,
  expected_lifespan_years, maintenance_cost_yearly, is_demo)
VALUES ('Microneedling Electric', 'Dr. Pen', 'A10 Pro', '2023-09-10', 2800, 2800, 4, 300, TRUE)
RETURNING id INTO eq_micro;

INSERT INTO equipment (name, brand, model, purchase_date, purchase_price, purchase_price_ron,
  expected_lifespan_years, maintenance_cost_yearly, is_demo)
VALUES ('Radiofrecventa Corporala', 'BTL', 'Exilis Ultra 360', '2024-01-20', 22000, 22000, 8, 1500, TRUE)
RETURNING id INTO eq_radiofrecventa;

INSERT INTO equipment (name, brand, model, purchase_date, purchase_price, purchase_price_ron,
  expected_lifespan_years, maintenance_cost_yearly, is_demo)
VALUES ('HydraFacial MD', 'HydraFacial', 'Elite Plus', '2024-05-05', 18000, 18000, 7, 2000, TRUE)
RETURNING id INTO eq_hydrafacial;

-- ============================================================
-- PRODUSE DEMO
-- ============================================================
INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Ser Vitamina C 20%', 'The Ordinary', 'ml', 500, 820, 3, 1, TRUE)
RETURNING id INTO pr_ser_vitc;

INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Acid Hialuronic Pur', 'Hyalogic', 'ml', 500, 650, 4, 1, TRUE)
RETURNING id INTO pr_acid_hialuronic;

INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Crema SPF 50+ Profesionala', 'La Roche-Posay', 'ml', 250, 180, 6, 2, TRUE)
RETURNING id INTO pr_crema_spf;

INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Gel Aloe Vera Pur', 'Holika Holika', 'ml', 1000, 95, 5, 2, TRUE)
RETURNING id INTO pr_gel_aloe;

INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Ulei de Masaj Relaxant', 'Weleda', 'ml', 500, 140, 4, 1, TRUE)
RETURNING id INTO pr_ulei_masaj;

INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Exfoliant Enzimatic Facial', 'Alpha-H', 'ml', 200, 220, 3, 1, TRUE)
RETURNING id INTO pr_exfoliant;

INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Masca Argila Alba', 'Kaolin Clay Pro', 'g', 500, 85, 5, 2, TRUE)
RETURNING id INTO pr_masca_argila;

INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Ser Retinol 0.5%', 'Paula''s Choice', 'ml', 30, 380, 2, 1, TRUE)
RETURNING id INTO pr_ser_retinol;

INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Lotiune Dupa Epilare', 'Lycon', 'ml', 500, 120, 4, 1, TRUE)
RETURNING id INTO pr_lotiune_dupa;

INSERT INTO products (name, brand, unit, package_size, cost_per_package, current_stock, min_stock_alert, is_demo)
VALUES ('Gel Conductiv RF', 'InControl Medical', 'ml', 1000, 75, 3, 1, TRUE)
RETURNING id INTO pr_gel_conductiv;

-- ============================================================
-- SERVICII DEMO
-- ============================================================
INSERT INTO services (category_id, equipment_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_facial, eq_hydrafacial, 'Facial Hidratare Intensiva', 'facial-hidratare', 60, 300, 65, TRUE)
RETURNING id INTO sv_facial_hidratare;

INSERT INTO services (category_id, equipment_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_facial, eq_ipl, 'Facial Anti-Age Premium', 'facial-anti-age', 90, 480, 60, TRUE)
RETURNING id INTO sv_facial_antiage;

INSERT INTO services (category_id, equipment_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_facial, eq_micro, 'Microneedling cu Ser', 'microneedling', 75, 500, 62, TRUE)
RETURNING id INTO sv_microneedling;

INSERT INTO services (category_id, equipment_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_epilare, eq_laser, 'Epilare Definitiva Axile', 'epilare-axile', 30, 150, 70, TRUE)
RETURNING id INTO sv_epilare_axile;

INSERT INTO services (category_id, equipment_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_epilare, eq_laser, 'Epilare Definitiva Picioare Intregi', 'epilare-picioare', 90, 450, 68, TRUE)
RETURNING id INTO sv_epilare_picioare;

INSERT INTO services (category_id, equipment_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_epilare, eq_laser, 'Epilare Definitiva Bikini Brazilian', 'epilare-bikini', 45, 250, 68, TRUE)
RETURNING id INTO sv_epilare_bikini;

INSERT INTO services (category_id, equipment_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_corp, eq_radiofrecventa, 'Remodelare Corporala RF', 'remodelare-rf', 60, 400, 60, TRUE)
RETURNING id INTO sv_remodelare_corp;

INSERT INTO services (category_id, equipment_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_corp, eq_radiofrecventa, 'Radiofrecventa Faciala', 'radiofrecventa-faciala', 60, 380, 62, TRUE)
RETURNING id INTO sv_radiofrecventa;

INSERT INTO services (category_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_analiza, 'Analiza Faciala Profesionala', 'analiza-faciala', 45, 200, 75, TRUE)
RETURNING id INTO sv_analiza_faciala;

INSERT INTO services (category_id, equipment_id, name, slug, duration_minutes, price, target_margin_pct, is_demo)
VALUES (cat_facial, eq_hydrafacial, 'HydraFacial Complet', 'hydrafacial-complet', 90, 550, 63, TRUE)
RETURNING id INTO sv_hydrafacial;

-- ============================================================
-- INGREDIENTE SERVICII
-- ============================================================
INSERT INTO service_ingredients (service_id, product_id, quantity) VALUES
(sv_facial_hidratare, pr_acid_hialuronic, 5),
(sv_facial_hidratare, pr_crema_spf, 3),
(sv_facial_hidratare, pr_gel_aloe, 10),
(sv_facial_antiage, pr_ser_vitc, 5),
(sv_facial_antiage, pr_ser_retinol, 2),
(sv_facial_antiage, pr_crema_spf, 3),
(sv_microneedling, pr_ser_vitc, 3),
(sv_microneedling, pr_acid_hialuronic, 5),
(sv_microneedling, pr_gel_aloe, 5),
(sv_epilare_axile, pr_lotiune_dupa, 10),
(sv_epilare_axile, pr_gel_aloe, 5),
(sv_epilare_picioare, pr_lotiune_dupa, 30),
(sv_epilare_picioare, pr_gel_aloe, 15),
(sv_epilare_bikini, pr_lotiune_dupa, 15),
(sv_epilare_bikini, pr_gel_aloe, 8),
(sv_remodelare_corp, pr_gel_conductiv, 30),
(sv_remodelare_corp, pr_ulei_masaj, 20),
(sv_radiofrecventa, pr_gel_conductiv, 20),
(sv_hydrafacial, pr_acid_hialuronic, 8),
(sv_hydrafacial, pr_ser_vitc, 5),
(sv_hydrafacial, pr_crema_spf, 3);

-- ============================================================
-- CLIENTI DEMO
-- ============================================================
INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Maria', 'Ionescu', '0722111001', 'maria.ionescu@gmail.com', '1988-03-15', 'Instagram', '2024-02-10', 'loyal', '2026-07-20', 18, 8450, 469, TRUE)
RETURNING id INTO cl1;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Elena', 'Popescu', '0722111002', 'elena.pop@yahoo.ro', '1992-07-22', 'Recomandare', '2024-04-05', 'loyal', '2026-07-15', 14, 6720, 480, TRUE)
RETURNING id INTO cl2;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Andreea', 'Constantin', '0722111003', 'andreea.c@gmail.com', '1995-11-08', 'Facebook', '2024-06-12', 'returning', '2026-07-10', 7, 2850, 407, TRUE)
RETURNING id INTO cl3;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Cristina', 'Mihai', '0722111004', 'cristina.m@gmail.com', '1985-04-30', 'Google', '2024-08-20', 'returning', '2026-06-25', 9, 3600, 400, TRUE)
RETURNING id INTO cl4;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Roxana', 'Stanescu', '0722111005', 'roxana.s@gmail.com', '1990-09-14', 'Instagram', '2025-01-08', 'returning', '2026-07-28', 8, 3200, 400, TRUE)
RETURNING id INTO cl5;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Alexandra', 'Dumitrescu', '0722111006', 'alex.d@gmail.com', '1993-01-25', 'TikTok', '2025-03-15', 'returning', '2026-07-05', 6, 2400, 400, TRUE)
RETURNING id INTO cl6;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Ioana', 'Gheorghe', '0722111007', 'ioana.g@yahoo.ro', '1987-06-18', 'Recomandare', '2025-05-20', 'returning', '2026-06-15', 5, 1850, 370, TRUE)
RETURNING id INTO cl7;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Laura', 'Popa', '0722111008', 'laura.popa@gmail.com', '1997-12-03', 'Instagram', '2025-07-10', 'new', '2026-07-30', 2, 650, 325, TRUE)
RETURNING id INTO cl8;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Mihaela', 'Nitu', '0722111009', 'mihaela.n@gmail.com', '1983-08-27', 'Facebook', '2025-09-05', 'inactive', '2025-12-10', 3, 1100, 367, TRUE)
RETURNING id INTO cl9;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Gabriela', 'Marin', '0722111010', 'gabi.marin@yahoo.ro', '1991-02-14', 'Recomandare', '2025-10-22', 'returning', '2026-05-18', 4, 1600, 400, TRUE)
RETURNING id INTO cl10;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Bianca', 'Stoica', '0722111011', 'bianca.s@gmail.com', '1999-05-09', 'TikTok', '2026-02-14', 'new', '2026-07-25', 3, 900, 300, TRUE)
RETURNING id INTO cl11;

INSERT INTO clients (first_name, last_name, phone, email, birthday, acquisition_source, acquisition_date, segment, last_visit_date, total_visits, total_spent, average_order_value, is_demo)
VALUES ('Diana', 'Florea', '0722111012', 'diana.f@gmail.com', '1994-10-31', 'Instagram', '2026-05-03', 'new', '2026-07-18', 2, 750, 375, TRUE)
RETURNING id INTO cl12;

-- ============================================================
-- TRATAMENTE DEMO 2025 (sezonalitate realista)
-- ============================================================

-- IANUARIE 2025 (luna slaba ~9.500 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_facial_hidratare, eq_hydrafacial, '2025-01-08', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl2, sv_epilare_axile, eq_laser, '2025-01-10', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl4, sv_analiza_faciala, NULL, '2025-01-14', 'Analiza Faciala Profesionala', 200, 20, 45, 200, 'card', 'completed', TRUE),
(cl1, sv_microneedling, eq_micro, '2025-01-20', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl3, sv_facial_hidratare, eq_hydrafacial, '2025-01-22', 'Facial Hidratare Intensiva', 300, 45, 60, 280, 'cash', 'completed', TRUE),
(cl2, sv_facial_antiage, eq_ipl, '2025-01-27', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl5, sv_epilare_axile, eq_laser, '2025-01-29', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl9, sv_remodelare_corp, eq_radiofrecventa, '2025-01-31', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE);

-- FEBRUARIE 2025 (~11.000 lei - Valentine's boost)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_radiofrecventa, eq_radiofrecventa, '2025-02-03', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl2, sv_epilare_bikini, eq_laser, '2025-02-05', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'cash', 'completed', TRUE),
(cl3, sv_microneedling, eq_micro, '2025-02-07', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl4, sv_facial_hidratare, eq_hydrafacial, '2025-02-10', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl1, sv_hydrafacial, eq_hydrafacial, '2025-02-12', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl5, sv_facial_antiage, eq_ipl, '2025-02-14', 'Facial Anti-Age Premium', 480, 65, 90, 430, 'card', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2025-02-17', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl6, sv_epilare_axile, eq_laser, '2025-02-19', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'card', 'completed', TRUE),
(cl4, sv_remodelare_corp, eq_radiofrecventa, '2025-02-21', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl3, sv_epilare_picioare, eq_laser, '2025-02-24', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'cash', 'completed', TRUE),
(cl1, sv_epilare_axile, eq_laser, '2025-02-26', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'card', 'completed', TRUE),
(cl7, sv_analiza_faciala, NULL, '2025-02-28', 'Analiza Faciala Profesionala', 200, 20, 45, 200, 'card', 'completed', TRUE);

-- MARTIE 2025 (~14.000 lei - spring boost)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_facial_hidratare, eq_hydrafacial, '2025-03-03', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl2, sv_epilare_axile, eq_laser, '2025-03-05', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl3, sv_hydrafacial, eq_hydrafacial, '2025-03-07', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl4, sv_microneedling, eq_micro, '2025-03-10', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl5, sv_epilare_picioare, eq_laser, '2025-03-12', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl6, sv_facial_antiage, eq_ipl, '2025-03-14', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl1, sv_radiofrecventa, eq_radiofrecventa, '2025-03-17', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl2, sv_remodelare_corp, eq_radiofrecventa, '2025-03-19', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl7, sv_epilare_bikini, eq_laser, '2025-03-21', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'cash', 'completed', TRUE),
(cl3, sv_facial_hidratare, eq_hydrafacial, '2025-03-24', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl8, sv_analiza_faciala, NULL, '2025-03-26', 'Analiza Faciala Profesionala', 200, 20, 45, 200, 'card', 'completed', TRUE),
(cl4, sv_epilare_axile, eq_laser, '2025-03-28', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl5, sv_microneedling, eq_micro, '2025-03-31', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE);

-- APRILIE 2025 (~16.000 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_hydrafacial, eq_hydrafacial, '2025-04-02', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl2, sv_epilare_picioare, eq_laser, '2025-04-04', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl3, sv_facial_antiage, eq_ipl, '2025-04-07', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl4, sv_remodelare_corp, eq_radiofrecventa, '2025-04-09', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl5, sv_epilare_axile, eq_laser, '2025-04-11', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl6, sv_microneedling, eq_micro, '2025-04-14', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl1, sv_epilare_bikini, eq_laser, '2025-04-16', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'card', 'completed', TRUE),
(cl7, sv_facial_hidratare, eq_hydrafacial, '2025-04-18', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl2, sv_radiofrecventa, eq_radiofrecventa, '2025-04-21', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl3, sv_epilare_axile, eq_laser, '2025-04-23', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl9, sv_facial_hidratare, eq_hydrafacial, '2025-04-25', 'Facial Hidratare Intensiva', 300, 45, 60, 280, 'cash', 'completed', TRUE),
(cl4, sv_hydrafacial, eq_hydrafacial, '2025-04-28', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl5, sv_facial_antiage, eq_ipl, '2025-04-30', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE);

-- MAI 2025 (~18.500 lei - pre-vara)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_epilare_picioare, eq_laser, '2025-05-02', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl2, sv_microneedling, eq_micro, '2025-05-05', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl3, sv_remodelare_corp, eq_radiofrecventa, '2025-05-07', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl4, sv_epilare_axile, eq_laser, '2025-05-09', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl5, sv_hydrafacial, eq_hydrafacial, '2025-05-12', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl6, sv_epilare_picioare, eq_laser, '2025-05-14', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl1, sv_facial_antiage, eq_ipl, '2025-05-16', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl7, sv_epilare_bikini, eq_laser, '2025-05-19', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'cash', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2025-05-21', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl3, sv_epilare_axile, eq_laser, '2025-05-23', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'card', 'completed', TRUE),
(cl8, sv_facial_hidratare, eq_hydrafacial, '2025-05-26', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl4, sv_epilare_picioare, eq_laser, '2025-05-28', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl5, sv_radiofrecventa, eq_radiofrecventa, '2025-05-30', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl10, sv_analiza_faciala, NULL, '2025-05-31', 'Analiza Faciala Profesionala', 200, 20, 45, 200, 'cash', 'completed', TRUE);

-- IUNIE 2025 (~20.000 lei - vara buna)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_epilare_axile, eq_laser, '2025-06-02', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'card', 'completed', TRUE),
(cl2, sv_epilare_picioare, eq_laser, '2025-06-04', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl3, sv_hydrafacial, eq_hydrafacial, '2025-06-06', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl4, sv_epilare_bikini, eq_laser, '2025-06-09', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'card', 'completed', TRUE),
(cl5, sv_facial_hidratare, eq_hydrafacial, '2025-06-11', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl6, sv_epilare_axile, eq_laser, '2025-06-13', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl1, sv_microneedling, eq_micro, '2025-06-16', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl7, sv_epilare_picioare, eq_laser, '2025-06-18', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl2, sv_remodelare_corp, eq_radiofrecventa, '2025-06-20', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl3, sv_epilare_axile, eq_laser, '2025-06-23', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl4, sv_facial_antiage, eq_ipl, '2025-06-25', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl9, sv_epilare_bikini, eq_laser, '2025-06-27', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'cash', 'completed', TRUE),
(cl10, sv_facial_hidratare, eq_hydrafacial, '2025-06-28', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl5, sv_epilare_picioare, eq_laser, '2025-06-30', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE);

-- IULIE 2025 (~21.000 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_epilare_axile, eq_laser, '2025-07-02', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'card', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2025-07-04', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl3, sv_epilare_picioare, eq_laser, '2025-07-07', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl4, sv_hydrafacial, eq_hydrafacial, '2025-07-09', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl5, sv_epilare_bikini, eq_laser, '2025-07-11', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'cash', 'completed', TRUE),
(cl6, sv_facial_antiage, eq_ipl, '2025-07-14', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl1, sv_remodelare_corp, eq_radiofrecventa, '2025-07-16', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl7, sv_epilare_axile, eq_laser, '2025-07-18', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl2, sv_microneedling, eq_micro, '2025-07-21', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl3, sv_facial_hidratare, eq_hydrafacial, '2025-07-23', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl4, sv_epilare_picioare, eq_laser, '2025-07-25', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl8, sv_facial_hidratare, eq_hydrafacial, '2025-07-28', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl10, sv_epilare_bikini, eq_laser, '2025-07-30', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'cash', 'completed', TRUE);

-- AUGUST 2025 (~19.500 lei - concedii)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_facial_antiage, eq_ipl, '2025-08-04', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl2, sv_epilare_axile, eq_laser, '2025-08-06', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl5, sv_hydrafacial, eq_hydrafacial, '2025-08-08', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl3, sv_remodelare_corp, eq_radiofrecventa, '2025-08-11', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl6, sv_epilare_picioare, eq_laser, '2025-08-13', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl4, sv_facial_hidratare, eq_hydrafacial, '2025-08-15', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl1, sv_epilare_bikini, eq_laser, '2025-08-18', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'card', 'completed', TRUE),
(cl7, sv_microneedling, eq_micro, '2025-08-20', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2025-08-22', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl9, sv_epilare_axile, eq_laser, '2025-08-25', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl5, sv_radiofrecventa, eq_radiofrecventa, '2025-08-27', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl3, sv_epilare_axile, eq_laser, '2025-08-29', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE);

-- SEPTEMBRIE 2025 (~18.000 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_microneedling, eq_micro, '2025-09-03', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl2, sv_hydrafacial, eq_hydrafacial, '2025-09-05', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl4, sv_facial_antiage, eq_ipl, '2025-09-08', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl5, sv_epilare_axile, eq_laser, '2025-09-10', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl3, sv_remodelare_corp, eq_radiofrecventa, '2025-09-12', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl6, sv_facial_hidratare, eq_hydrafacial, '2025-09-15', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl1, sv_epilare_picioare, eq_laser, '2025-09-17', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl10, sv_microneedling, eq_micro, '2025-09-19', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2025-09-22', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl7, sv_epilare_bikini, eq_laser, '2025-09-24', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'cash', 'completed', TRUE),
(cl4, sv_radiofrecventa, eq_radiofrecventa, '2025-09-26', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl5, sv_facial_antiage, eq_ipl, '2025-09-29', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE);

-- OCTOMBRIE 2025 (~20.500 lei - toamna)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_hydrafacial, eq_hydrafacial, '2025-10-01', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl2, sv_microneedling, eq_micro, '2025-10-03', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl3, sv_facial_antiage, eq_ipl, '2025-10-06', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl4, sv_facial_hidratare, eq_hydrafacial, '2025-10-08', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl5, sv_remodelare_corp, eq_radiofrecventa, '2025-10-10', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl6, sv_microneedling, eq_micro, '2025-10-13', 'Microneedling cu Ser', 500, 68, 75, 450, 'card', 'completed', TRUE),
(cl1, sv_radiofrecventa, eq_radiofrecventa, '2025-10-15', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl7, sv_hydrafacial, eq_hydrafacial, '2025-10-17', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2025-10-20', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl10, sv_facial_antiage, eq_ipl, '2025-10-22', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl3, sv_epilare_axile, eq_laser, '2025-10-24', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl4, sv_microneedling, eq_micro, '2025-10-27', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl5, sv_hydrafacial, eq_hydrafacial, '2025-10-29', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE);

-- NOIEMBRIE 2025 (~22.000 lei - Black Friday)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_microneedling, eq_micro, '2025-11-03', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl2, sv_hydrafacial, eq_hydrafacial, '2025-11-05', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl3, sv_facial_antiage, eq_ipl, '2025-11-07', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl4, sv_remodelare_corp, eq_radiofrecventa, '2025-11-10', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl5, sv_facial_hidratare, eq_hydrafacial, '2025-11-12', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl6, sv_hydrafacial, eq_hydrafacial, '2025-11-14', 'HydraFacial Complet', 550, 78, 90, 500, 'card', 'completed', TRUE),
(cl1, sv_facial_antiage, eq_ipl, '2025-11-17', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl7, sv_microneedling, eq_micro, '2025-11-19', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl2, sv_remodelare_corp, eq_radiofrecventa, '2025-11-21', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl10, sv_hydrafacial, eq_hydrafacial, '2025-11-24', 'HydraFacial Complet', 550, 78, 90, 500, 'card', 'completed', TRUE),
(cl3, sv_facial_hidratare, eq_hydrafacial, '2025-11-26', 'Facial Hidratare Intensiva', 300, 45, 60, 270, 'card', 'completed', TRUE),
(cl4, sv_radiofrecventa, eq_radiofrecventa, '2025-11-28', 'Radiofrecventa Faciala', 380, 52, 60, 350, 'card', 'completed', TRUE);

-- DECEMBRIE 2025 (~22.500 lei - Craciun)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_hydrafacial, eq_hydrafacial, '2025-12-01', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl2, sv_facial_antiage, eq_ipl, '2025-12-03', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl3, sv_microneedling, eq_micro, '2025-12-05', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl4, sv_facial_hidratare, eq_hydrafacial, '2025-12-08', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl5, sv_hydrafacial, eq_hydrafacial, '2025-12-10', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl6, sv_facial_antiage, eq_ipl, '2025-12-12', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl1, sv_remodelare_corp, eq_radiofrecventa, '2025-12-15', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl7, sv_hydrafacial, eq_hydrafacial, '2025-12-17', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl2, sv_microneedling, eq_micro, '2025-12-19', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl10, sv_facial_hidratare, eq_hydrafacial, '2025-12-20', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl3, sv_facial_antiage, eq_ipl, '2025-12-22', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl4, sv_hydrafacial, eq_hydrafacial, '2025-12-27', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl5, sv_microneedling, eq_micro, '2025-12-29', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE);

-- ============================================================
-- TRATAMENTE DEMO 2026 (ian - aug curent)
-- ============================================================

-- IANUARIE 2026 (~10.000 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_facial_hidratare, eq_hydrafacial, '2026-01-07', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl2, sv_microneedling, eq_micro, '2026-01-10', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl3, sv_facial_antiage, eq_ipl, '2026-01-13', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl11, sv_analiza_faciala, NULL, '2026-01-15', 'Analiza Faciala Profesionala', 200, 20, 45, 200, 'card', 'completed', TRUE),
(cl4, sv_hydrafacial, eq_hydrafacial, '2026-01-17', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl5, sv_epilare_axile, eq_laser, '2026-01-20', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl1, sv_radiofrecventa, eq_radiofrecventa, '2026-01-22', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl6, sv_facial_hidratare, eq_hydrafacial, '2026-01-24', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl2, sv_remodelare_corp, eq_radiofrecventa, '2026-01-27', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl11, sv_facial_hidratare, eq_hydrafacial, '2026-01-29', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE);

-- FEBRUARIE 2026 (~13.000 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_microneedling, eq_micro, '2026-02-04', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl3, sv_hydrafacial, eq_hydrafacial, '2026-02-06', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl11, sv_facial_antiage, eq_ipl, '2026-02-09', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl4, sv_epilare_axile, eq_laser, '2026-02-11', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2026-02-13', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl5, sv_facial_antiage, eq_ipl, '2026-02-14', 'Facial Anti-Age Premium', 480, 65, 90, 430, 'card', 'completed', TRUE),
(cl6, sv_microneedling, eq_micro, '2026-02-17', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl1, sv_remodelare_corp, eq_radiofrecventa, '2026-02-19', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl7, sv_facial_hidratare, eq_hydrafacial, '2026-02-21', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl12, sv_analiza_faciala, NULL, '2026-02-24', 'Analiza Faciala Profesionala', 200, 20, 45, 200, 'card', 'completed', TRUE),
(cl3, sv_radiofrecventa, eq_radiofrecventa, '2026-02-26', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl4, sv_hydrafacial, eq_hydrafacial, '2026-02-28', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE);

-- MARTIE 2026 (~15.500 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_hydrafacial, eq_hydrafacial, '2026-03-03', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl2, sv_facial_antiage, eq_ipl, '2026-03-05', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl12, sv_facial_hidratare, eq_hydrafacial, '2026-03-07', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl3, sv_microneedling, eq_micro, '2026-03-10', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl5, sv_epilare_picioare, eq_laser, '2026-03-12', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl4, sv_remodelare_corp, eq_radiofrecventa, '2026-03-14', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl6, sv_hydrafacial, eq_hydrafacial, '2026-03-17', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl1, sv_epilare_axile, eq_laser, '2026-03-19', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl11, sv_microneedling, eq_micro, '2026-03-21', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2026-03-24', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl7, sv_facial_antiage, eq_ipl, '2026-03-26', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl12, sv_epilare_bikini, eq_laser, '2026-03-28', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'card', 'completed', TRUE);

-- APRILIE 2026 (~17.000 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_microneedling, eq_micro, '2026-04-02', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl3, sv_hydrafacial, eq_hydrafacial, '2026-04-04', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl4, sv_facial_antiage, eq_ipl, '2026-04-07', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl5, sv_epilare_axile, eq_laser, '2026-04-09', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl2, sv_remodelare_corp, eq_radiofrecventa, '2026-04-11', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl6, sv_facial_hidratare, eq_hydrafacial, '2026-04-14', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl11, sv_hydrafacial, eq_hydrafacial, '2026-04-16', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl1, sv_epilare_picioare, eq_laser, '2026-04-18', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl12, sv_microneedling, eq_micro, '2026-04-21', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl3, sv_facial_hidratare, eq_hydrafacial, '2026-04-23', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl7, sv_radiofrecventa, eq_radiofrecventa, '2026-04-25', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE),
(cl4, sv_epilare_bikini, eq_laser, '2026-04-28', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'card', 'completed', TRUE),
(cl5, sv_hydrafacial, eq_hydrafacial, '2026-04-30', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE);

-- MAI 2026 (~19.500 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_facial_antiage, eq_ipl, '2026-05-04', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl2, sv_epilare_picioare, eq_laser, '2026-05-06', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl3, sv_facial_hidratare, eq_hydrafacial, '2026-05-08', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl11, sv_remodelare_corp, eq_radiofrecventa, '2026-05-11', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl4, sv_microneedling, eq_micro, '2026-05-13', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl5, sv_epilare_axile, eq_laser, '2026-05-15', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl6, sv_hydrafacial, eq_hydrafacial, '2026-05-18', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl1, sv_epilare_bikini, eq_laser, '2026-05-20', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'card', 'completed', TRUE),
(cl12, sv_facial_antiage, eq_ipl, '2026-05-22', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2026-05-25', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl7, sv_microneedling, eq_micro, '2026-05-27', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl3, sv_epilare_picioare, eq_laser, '2026-05-29', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl10, sv_radiofrecventa, eq_radiofrecventa, '2026-05-30', 'Radiofrecventa Faciala', 380, 52, 60, 380, 'card', 'completed', TRUE);

-- IUNIE 2026 (~20.500 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_hydrafacial, eq_hydrafacial, '2026-06-01', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl4, sv_epilare_picioare, eq_laser, '2026-06-03', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl5, sv_facial_antiage, eq_ipl, '2026-06-05', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl11, sv_epilare_axile, eq_laser, '2026-06-08', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl2, sv_microneedling, eq_micro, '2026-06-10', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl6, sv_epilare_bikini, eq_laser, '2026-06-12', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'card', 'completed', TRUE),
(cl3, sv_remodelare_corp, eq_radiofrecventa, '2026-06-15', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl1, sv_epilare_axile, eq_laser, '2026-06-17', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl12, sv_hydrafacial, eq_hydrafacial, '2026-06-19', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl4, sv_facial_hidratare, eq_hydrafacial, '2026-06-22', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl7, sv_epilare_picioare, eq_laser, '2026-06-24', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl5, sv_microneedling, eq_micro, '2026-06-26', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl2, sv_facial_antiage, eq_ipl, '2026-06-29', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl10, sv_epilare_axile, eq_laser, '2026-06-30', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE);

-- IULIE 2026 (~20.000 lei)
INSERT INTO treatments (client_id, service_id, equipment_id, treatment_date, service_name_snapshot, price_snapshot, cost_snapshot, duration_snapshot, final_price, payment_method, status, is_demo) VALUES
(cl1, sv_epilare_axile, eq_laser, '2026-07-02', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'card', 'completed', TRUE),
(cl3, sv_hydrafacial, eq_hydrafacial, '2026-07-04', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl5, sv_epilare_picioare, eq_laser, '2026-07-07', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE),
(cl2, sv_microneedling, eq_micro, '2026-07-09', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl11, sv_facial_antiage, eq_ipl, '2026-07-11', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl4, sv_epilare_bikini, eq_laser, '2026-07-14', 'Epilare Definitiva Bikini', 250, 30, 45, 250, 'card', 'completed', TRUE),
(cl6, sv_remodelare_corp, eq_radiofrecventa, '2026-07-16', 'Remodelare Corporala RF', 400, 55, 60, 400, 'card', 'completed', TRUE),
(cl1, sv_facial_antiage, eq_ipl, '2026-07-18', 'Facial Anti-Age Premium', 480, 65, 90, 480, 'card', 'completed', TRUE),
(cl8, sv_facial_hidratare, eq_hydrafacial, '2026-07-20', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'card', 'completed', TRUE),
(cl12, sv_epilare_axile, eq_laser, '2026-07-22', 'Epilare Definitiva Axile', 150, 18, 30, 150, 'cash', 'completed', TRUE),
(cl3, sv_microneedling, eq_micro, '2026-07-24', 'Microneedling cu Ser', 500, 68, 75, 500, 'card', 'completed', TRUE),
(cl5, sv_hydrafacial, eq_hydrafacial, '2026-07-26', 'HydraFacial Complet', 550, 78, 90, 550, 'card', 'completed', TRUE),
(cl2, sv_facial_hidratare, eq_hydrafacial, '2026-07-28', 'Facial Hidratare Intensiva', 300, 45, 60, 300, 'cash', 'completed', TRUE),
(cl10, sv_epilare_picioare, eq_laser, '2026-07-30', 'Epilare Definitiva Picioare', 450, 58, 90, 450, 'card', 'completed', TRUE);

-- ============================================================
-- CHELTUIELI DEMO (2025-2026)
-- ============================================================
INSERT INTO expenses (name, category, subcategory, amount, expense_date, payment_method, vendor, is_tax_deductible, is_demo) VALUES
('Chirie salon - Ian 2025', 'chirie', NULL, 2500, '2025-01-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Ian 2025', 'utilitati', 'curent', 420, '2025-01-10', 'transfer', 'Electrica', TRUE, TRUE),
('Produse consumabile Jan', 'consumabile', 'produse', 1200, '2025-01-15', 'card', 'Provita Cosmetics', TRUE, TRUE),
('Chirie salon - Feb 2025', 'chirie', NULL, 2500, '2025-02-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Marketing Instagram - Feb', 'marketing', 'social', 500, '2025-02-10', 'card', 'Meta Ads', TRUE, TRUE),
('Produse consumabile Feb', 'consumabile', 'produse', 1400, '2025-02-18', 'card', 'Provita Cosmetics', TRUE, TRUE),
('Chirie salon - Mar 2025', 'chirie', NULL, 2500, '2025-03-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Mar 2025', 'utilitati', 'curent', 380, '2025-03-10', 'transfer', 'Electrica', TRUE, TRUE),
('Consumabile epilare - Mar', 'consumabile', 'produse', 850, '2025-03-20', 'card', 'Lycon Romania', TRUE, TRUE),
('Chirie salon - Apr 2025', 'chirie', NULL, 2500, '2025-04-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Marketing TikTok - Apr', 'marketing', 'social', 350, '2025-04-12', 'card', 'TikTok Ads', TRUE, TRUE),
('Produse consumabile Apr', 'consumabile', 'produse', 1600, '2025-04-22', 'card', 'Provita Cosmetics', TRUE, TRUE),
('Chirie salon - Mai 2025', 'chirie', NULL, 2500, '2025-05-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Mai 2025', 'utilitati', 'curent', 450, '2025-05-10', 'transfer', 'Electrica', TRUE, TRUE),
('Fotografie profesionala', 'marketing', 'fotografie', 800, '2025-05-20', 'cash', 'Studio Photo', TRUE, TRUE),
('Chirie salon - Iun 2025', 'chirie', NULL, 2500, '2025-06-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Consumabile vara - Iun', 'consumabile', 'produse', 2000, '2025-06-15', 'card', 'Lycon Romania', TRUE, TRUE),
('Marketing vara - Iun', 'marketing', 'social', 600, '2025-06-20', 'card', 'Meta Ads', TRUE, TRUE),
('Chirie salon - Iul 2025', 'chirie', NULL, 2500, '2025-07-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Iul 2025', 'utilitati', 'curent', 520, '2025-07-10', 'transfer', 'Electrica', TRUE, TRUE),
('Produse consumabile Iul', 'consumabile', 'produse', 1800, '2025-07-18', 'card', 'Provita Cosmetics', TRUE, TRUE),
('Chirie salon - Aug 2025', 'chirie', NULL, 2500, '2025-08-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Mentenanta laser - Aug', 'mentenanta', 'echipamente', 600, '2025-08-12', 'transfer', 'Alma Lasers Service', TRUE, TRUE),
('Chirie salon - Sep 2025', 'chirie', NULL, 2500, '2025-09-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Sep 2025', 'utilitati', 'curent', 390, '2025-09-10', 'transfer', 'Electrica', TRUE, TRUE),
('Produse toamna - Sep', 'consumabile', 'produse', 1500, '2025-09-22', 'card', 'Provita Cosmetics', TRUE, TRUE),
('Chirie salon - Oct 2025', 'chirie', NULL, 2500, '2025-10-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Marketing toamna - Oct', 'marketing', 'social', 700, '2025-10-15', 'card', 'Meta Ads', TRUE, TRUE),
('Chirie salon - Nov 2025', 'chirie', NULL, 2500, '2025-11-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Nov 2025', 'utilitati', 'curent', 480, '2025-11-10', 'transfer', 'Electrica', TRUE, TRUE),
('Campanie Black Friday', 'marketing', 'promotii', 900, '2025-11-20', 'card', 'Meta Ads', TRUE, TRUE),
('Chirie salon - Dec 2025', 'chirie', NULL, 2500, '2025-12-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Cadouri clientele fidele', 'marketing', 'fidelizare', 1200, '2025-12-15', 'cash', 'Florarie & Gift', FALSE, TRUE),
('Chirie salon - Ian 2026', 'chirie', NULL, 2700, '2026-01-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Ian 2026', 'utilitati', 'curent', 440, '2026-01-10', 'transfer', 'Electrica', TRUE, TRUE),
('Produse consumabile Ian 2026', 'consumabile', 'produse', 1300, '2026-01-18', 'card', 'Provita Cosmetics', TRUE, TRUE),
('Chirie salon - Feb 2026', 'chirie', NULL, 2700, '2026-02-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Marketing Valentine Feb 2026', 'marketing', 'social', 600, '2026-02-10', 'card', 'Meta Ads', TRUE, TRUE),
('Chirie salon - Mar 2026', 'chirie', NULL, 2700, '2026-03-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Mar 2026', 'utilitati', 'curent', 400, '2026-03-10', 'transfer', 'Electrica', TRUE, TRUE),
('Consumabile spring - Mar 2026', 'consumabile', 'produse', 1700, '2026-03-20', 'card', 'Lycon Romania', TRUE, TRUE),
('Chirie salon - Apr 2026', 'chirie', NULL, 2700, '2026-04-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Marketing primavara Apr 2026', 'marketing', 'social', 500, '2026-04-15', 'card', 'Meta Ads', TRUE, TRUE),
('Chirie salon - Mai 2026', 'chirie', NULL, 2700, '2026-05-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Mai 2026', 'utilitati', 'curent', 460, '2026-05-10', 'transfer', 'Electrica', TRUE, TRUE),
('Produse consumabile Mai 2026', 'consumabile', 'produse', 1900, '2026-05-22', 'card', 'Provita Cosmetics', TRUE, TRUE),
('Chirie salon - Iun 2026', 'chirie', NULL, 2700, '2026-06-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Mentenanta HydraFacial Iun', 'mentenanta', 'echipamente', 1000, '2026-06-12', 'transfer', 'HydraFacial Service', TRUE, TRUE),
('Marketing vara - Iun 2026', 'marketing', 'social', 650, '2026-06-20', 'card', 'Meta Ads', TRUE, TRUE),
('Chirie salon - Iul 2026', 'chirie', NULL, 2700, '2026-07-05', 'transfer', 'Proprietar Imobil', TRUE, TRUE),
('Curent electric - Iul 2026', 'utilitati', 'curent', 540, '2026-07-10', 'transfer', 'Electrica', TRUE, TRUE),
('Consumabile vara - Iul 2026', 'consumabile', 'produse', 2100, '2026-07-18', 'card', 'Lycon Romania', TRUE, TRUE);

-- ============================================================
-- TARGETE DEMO 2026
-- ============================================================
INSERT INTO targets (period_type, period_year, period_number, target_revenue, target_profit, target_clients, target_treatments, target_new_clients, target_retention_pct, target_occupancy_pct, target_avg_ticket) VALUES
('month', 2026, 1, 12000, 6000, 25, 30, 3, 70, 60, 380),
('month', 2026, 2, 14000, 7000, 28, 35, 4, 72, 65, 390),
('month', 2026, 3, 16000, 8000, 30, 38, 4, 73, 68, 400),
('month', 2026, 4, 18000, 9000, 32, 42, 5, 74, 70, 410),
('month', 2026, 5, 20000, 10000, 35, 45, 5, 75, 72, 420),
('month', 2026, 6, 21000, 10500, 36, 47, 5, 75, 73, 425),
('month', 2026, 7, 21000, 10500, 36, 46, 4, 76, 72, 425),
('month', 2026, 8, 20000, 9500, 34, 44, 4, 75, 70, 420),
('month', 2026, 9, 19000, 9000, 32, 42, 4, 74, 68, 415),
('month', 2026, 10, 22000, 11000, 38, 50, 6, 76, 75, 430),
('month', 2026, 11, 23000, 11500, 40, 52, 6, 77, 77, 435),
('month', 2026, 12, 24000, 12000, 42, 55, 7, 78, 80, 440),
('year', 2026, 2026, 220000, 108000, 380, 486, 57, 75, 71, 418)
ON CONFLICT (period_type, period_year, period_number) DO NOTHING;

-- ============================================================
-- CAMPANII MARKETING DEMO
-- ============================================================
INSERT INTO marketing_campaigns (name, channel, start_date, end_date, budget_spent, leads_generated, clients_acquired, revenue_attributed, offer_description, is_active, is_demo) VALUES
('Valentine''s Day Special', 'Instagram', '2025-02-10', '2025-02-15', 500, 45, 8, 4200, 'Facial + masaj 20% reducere', FALSE, TRUE),
('Spring Glow Campaign', 'Instagram+TikTok', '2025-03-01', '2025-03-31', 800, 68, 12, 7800, 'Pachet Primavara - analiza + facial', FALSE, TRUE),
('Summer Ready Body', 'Instagram', '2025-05-01', '2025-06-30', 1200, 90, 15, 12000, 'Epilare + remodelare corporala', FALSE, TRUE),
('Black Friday Beauty', 'Instagram+Email', '2025-11-20', '2025-11-30', 900, 120, 20, 15000, '30% la toate serviciile', FALSE, TRUE),
('Glow Up 2026', 'Instagram', '2026-01-10', '2026-01-31', 600, 55, 10, 6500, 'Start nou, piele noua', FALSE, TRUE),
('Spring Fresh 2026', 'Instagram+TikTok', '2026-03-01', '2026-04-15', 1000, 80, 14, 9800, 'Pachet detox + glow facial', FALSE, TRUE);

END $$;
