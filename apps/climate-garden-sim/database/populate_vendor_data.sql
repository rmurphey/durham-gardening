-- Populate vendor and seed ordering data
-- Durham, NC specific recommendations with real vendor information

-- Insert vendors
INSERT INTO vendors (vendor_key, name, website_url, shipping_threshold, shipping_cost, specialty, region_focus, reliability_rating, notes) VALUES
('true_leaf_market', 'True Leaf Market', 'https://www.trueleafmarket.com', 50.00, 7.95, 'heirloom,organic', 'Southeast US', 5, 'Excellent selection, proven reliability in Durham area'),
('johnnys_seeds', 'Johnny''s Seeds', 'https://www.johnnyseeds.com', 50.00, 8.95, 'commercial,specialty', 'Northeast US', 5, 'Professional quality, excellent heat-tolerant varieties'),
('baker_creek', 'Baker Creek Heirloom Seeds', 'https://www.rareseeds.com', 75.00, 9.95, 'heirloom,rare', 'Missouri/National', 4, 'Unique varieties, excellent for experimental growing'),
('southern_exposure', 'Southern Exposure Seed Exchange', 'https://www.southernexposure.com', 50.00, 6.95, 'heirloom,heat_adapted', 'Southeast US', 5, 'Heat-adapted varieties specifically for Southern gardens'),
('local_harvest_nc', 'Local Harvest NC', 'https://www.localharvestnc.org', 25.00, 5.00, 'local,sweet_potato_slips', 'North Carolina', 4, 'Local NC growers, best source for sweet potato slips');

-- Insert purchase windows
INSERT INTO purchase_windows (window_key, name, timing, description, start_month, end_month, priority, applies_to_categories) VALUES
('winter_seed_order', 'Winter Seed Ordering', 'December - February', 'Primary seed ordering season for best selection and pricing', 12, 2, 1, '["heatTolerant", "coolSeason", "perennials"]'),
('winter_infrastructure', 'Winter Infrastructure Setup', 'January - February', 'Set up seed starting and indoor growing equipment', 1, 2, 2, '["infrastructure"]'),
('spring_prep', 'Spring Infrastructure & Supplies', 'March - April', 'Irrigation, protection systems, soil amendments', 3, 4, 1, '["infrastructure", "supplies"]'),
('summer_supplies', 'Summer Support Supplies', 'May - June', 'Heat protection, watering supplies, pest management', 5, 6, 2, '["supplies"]'),
('fall_infrastructure', 'Fall Infrastructure Maintenance', 'September - October', 'System maintenance and winter prep', 9, 10, 3, '["infrastructure"]');

-- First, get the plant and region IDs we need (Durham, NC region should be US)
-- Insert seed products for heat-tolerant crops

-- Okra seeds
INSERT INTO seed_products (plant_id, vendor_id, sku, variety_name, packet_size, seed_count, price, product_url, is_organic, is_heirloom, heat_tolerance_rating, days_to_maturity, packet_plants_sqft, notes)
SELECT 
    p.id, 
    v.id,
    'OKR-CLE-1000',
    'Clemson Spineless Okra',
    '1000 seeds',
    1000,
    4.95,
    'https://www.trueleafmarket.com/products/okra-clemson-spineless',
    FALSE,
    TRUE,
    5,
    55,
    25,
    'Classic variety, extremely reliable in Durham heat'
FROM plants p 
JOIN vendors v ON v.vendor_key = 'true_leaf_market'
WHERE p.plant_key = 'okra';

-- Hot Peppers
INSERT INTO seed_products (plant_id, vendor_id, sku, variety_name, packet_size, seed_count, price, product_url, is_organic, is_heirloom, heat_tolerance_rating, days_to_maturity, packet_plants_sqft, notes)
SELECT 
    p.id, 
    v.id,
    'PEP-SER-100',
    'Serrano Pepper',
    '100 seeds',
    100,
    4.25,
    'https://www.johnnyseeds.com/vegetables/peppers/hot-peppers/serrano-pepper',
    FALSE,
    FALSE,
    5,
    75,
    15,
    'Consistent producer in heat, excellent for Durham'
FROM plants p 
JOIN vendors v ON v.vendor_key = 'johnnys_seeds'
WHERE p.plant_key = 'peppers';

-- Kale
INSERT INTO seed_products (plant_id, vendor_id, sku, variety_name, packet_size, seed_count, price, product_url, is_organic, is_heirloom, heat_tolerance_rating, days_to_maturity, packet_plants_sqft, notes)
SELECT 
    p.id, 
    v.id,
    'KAL-RED-500',
    'Red Russian Kale',
    '500 seeds',
    500,
    3.95,
    'https://www.trueleafmarket.com/products/kale-red-russian',
    FALSE,
    TRUE,
    3,
    60,
    20,
    'Most bolt-resistant kale for Durham climate'
FROM plants p 
JOIN vendors v ON v.vendor_key = 'true_leaf_market'
WHERE p.plant_key = 'kale';

-- Lettuce
INSERT INTO seed_products (plant_id, vendor_id, sku, variety_name, packet_size, seed_count, price, product_url, is_organic, is_heirloom, heat_tolerance_rating, days_to_maturity, packet_plants_sqft, notes)
SELECT 
    p.id, 
    v.id,
    'LET-JER-1000',
    'Jericho Lettuce (Romaine)',
    '1000 seeds',
    1000,
    5.50,
    'https://www.johnnyseeds.com/vegetables/lettuce/romaine-lettuce/jericho-lettuce',
    FALSE,
    FALSE,
    4,
    55,
    30,
    'Heat-tolerant romaine, essential for Durham climate'
FROM plants p 
JOIN vendors v ON v.vendor_key = 'johnnys_seeds'
WHERE p.plant_key = 'lettuce';

-- Spinach
INSERT INTO seed_products (plant_id, vendor_id, sku, variety_name, packet_size, seed_count, price, product_url, is_organic, is_heirloom, heat_tolerance_rating, days_to_maturity, packet_plants_sqft, notes)
SELECT 
    p.id, 
    v.id,
    'SPI-SPA-250',
    'Space Spinach F1',
    '250 seeds',
    250,
    6.95,
    'https://www.johnnyseeds.com/vegetables/spinach/space-spinach',
    FALSE,
    FALSE,
    3,
    40,
    25,
    'Slow-bolt F1 hybrid, only spinach that works reliably in Durham spring'
FROM plants p 
JOIN vendors v ON v.vendor_key = 'johnnys_seeds'
WHERE p.plant_key = 'spinach';

-- Carrots
INSERT INTO seed_products (plant_id, vendor_id, sku, variety_name, packet_size, seed_count, price, product_url, is_organic, is_heirloom, heat_tolerance_rating, days_to_maturity, packet_plants_sqft, notes)
SELECT 
    p.id, 
    v.id,
    'CAR-PAR-500',
    'Paris Market Carrot',
    '500 seeds',
    500,
    3.25,
    'https://www.rareseeds.com/carrot-paris-market',
    FALSE,
    TRUE,
    2,
    70,
    35,
    'Round carrots work better in Durham clay soil'
FROM plants p 
JOIN vendors v ON v.vendor_key = 'baker_creek'
WHERE p.plant_key = 'carrots';

-- Cabbage
INSERT INTO seed_products (plant_id, vendor_id, sku, variety_name, packet_size, seed_count, price, product_url, is_organic, is_heirloom, heat_tolerance_rating, days_to_maturity, packet_plants_sqft, notes)
SELECT 
    p.id, 
    v.id,
    'CAB-EJW-100',
    'Early Jersey Wakefield Cabbage',
    '100 seeds',
    100,
    3.95,
    'https://www.trueleafmarket.com/products/cabbage-early-jersey-wakefield',
    FALSE,
    TRUE,
    2,
    65,
    8,
    'Quick-maturing variety perfect for Durham short spring window'
FROM plants p 
JOIN vendors v ON v.vendor_key = 'true_leaf_market'
WHERE p.plant_key = 'cabbage';

-- Amaranth
INSERT INTO seed_products (plant_id, vendor_id, sku, variety_name, packet_size, seed_count, price, product_url, is_organic, is_heirloom, heat_tolerance_rating, days_to_maturity, packet_plants_sqft, notes)
SELECT 
    p.id, 
    v.id,
    'AMA-CAL-200',
    'Red Callaloo Amaranth',
    '200 seeds',
    200,
    3.75,
    'https://www.rareseeds.com/amaranth-red-callaloo',
    FALSE,
    TRUE,
    5,
    45,
    20,
    'Thrives in Durham heat, continuous harvest leafy green'
FROM plants p 
JOIN vendors v ON v.vendor_key = 'baker_creek'
WHERE p.plant_key = 'amaranth';

-- Sweet Potato (slips, not seeds)
INSERT INTO seed_products (plant_id, vendor_id, sku, variety_name, packet_size, seed_count, price, product_url, is_organic, is_heirloom, heat_tolerance_rating, days_to_maturity, packet_plants_sqft, notes)
SELECT 
    p.id, 
    v.id,
    'SP-BEAU-25',
    'Beauregard Sweet Potato Slips',
    '25 slips',
    25,
    15.00,
    'https://www.localharvestnc.org/sweet-potato-slips',
    FALSE,
    FALSE,
    5,
    90,
    10,
    'Short-season variety perfect for Durham, order slips from local growers'
FROM plants p 
JOIN vendors v ON v.vendor_key = 'local_harvest_nc'
WHERE p.plant_key = 'sweetPotato';

-- Insert regional recommendations for Durham, NC (US region)
-- Priority 1 recommendations
INSERT INTO regional_vendor_recommendations (plant_id, region_id, vendor_id, seed_product_id, preference_rank, order_timing, planting_instructions, succession_plantings, packets_needed_per_100sqft, special_notes)
SELECT 
    p.id,
    r.id,
    v.id,
    sp.id,
    1,
    'January (for May planting)',
    'Direct sow after soil temps reach 65°F (mid-May Durham)',
    1,
    2,
    'Heat-loving, extremely reliable in Durham summers. Order early for best selection.'
FROM plants p 
JOIN regions r ON r.code = 'US'
JOIN vendors v ON v.vendor_key = 'true_leaf_market'
JOIN seed_products sp ON sp.plant_id = p.id AND sp.vendor_id = v.id
WHERE p.plant_key = 'okra';

INSERT INTO regional_vendor_recommendations (plant_id, region_id, vendor_id, seed_product_id, preference_rank, order_timing, planting_instructions, succession_plantings, packets_needed_per_100sqft, special_notes)
SELECT 
    p.id,
    r.id,
    v.id,
    sp.id,
    1,
    'December-January (for February indoor start)',
    'Start indoors 8-10 weeks before last frost (mid-February). Transplant mid-May.',
    1,
    1,
    'Consistent producer in heat. Order by January for seed starting supplies.'
FROM plants p 
JOIN regions r ON r.code = 'US'
JOIN vendors v ON v.vendor_key = 'johnnys_seeds'
JOIN seed_products sp ON sp.plant_id = p.id AND sp.vendor_id = v.id
WHERE p.plant_key = 'peppers';

INSERT INTO regional_vendor_recommendations (plant_id, region_id, vendor_id, seed_product_id, preference_rank, order_timing, planting_instructions, succession_plantings, packets_needed_per_100sqft, special_notes)
SELECT 
    p.id,
    r.id,
    v.id,
    sp.id,
    1,
    'January (for succession plantings March-September)',
    'Direct sow March 15, then every 3 weeks through September',
    4,
    2,
    'Most bolt-resistant kale for Durham. Plan 4-5 succession plantings.'
FROM plants p 
JOIN regions r ON r.code = 'US'
JOIN vendors v ON v.vendor_key = 'true_leaf_market'
JOIN seed_products sp ON sp.plant_id = p.id AND sp.vendor_id = v.id
WHERE p.plant_key = 'kale';

INSERT INTO regional_vendor_recommendations (plant_id, region_id, vendor_id, seed_product_id, preference_rank, order_timing, planting_instructions, succession_plantings, packets_needed_per_100sqft, special_notes)
SELECT 
    p.id,
    r.id,
    v.id,
    sp.id,
    1,
    'January (for March-October succession)',
    'Start March 1, succession plant every 2 weeks through April, resume August-October',
    6,
    3,
    'Heat-tolerant romaine. Essential for Durham climate. Order 2-3 packets for succession.'
FROM plants p 
JOIN regions r ON r.code = 'US'
JOIN vendors v ON v.vendor_key = 'johnnys_seeds'
JOIN seed_products sp ON sp.plant_id = p.id AND sp.vendor_id = v.id
WHERE p.plant_key = 'lettuce';

INSERT INTO regional_vendor_recommendations (plant_id, region_id, vendor_id, seed_product_id, preference_rank, order_timing, planting_instructions, succession_plantings, packets_needed_per_100sqft, special_notes)
SELECT 
    p.id,
    r.id,
    v.id,
    sp.id,
    1,
    'January (for March and September plantings)',
    'Direct sow March 1-15, then September 1-30 for fall/winter harvest',
    2,
    2,
    'Slow-bolt F1 hybrid. Only spinach that works reliably in Durham spring.'
FROM plants p 
JOIN regions r ON r.code = 'US'
JOIN vendors v ON v.vendor_key = 'johnnys_seeds'
JOIN seed_products sp ON sp.plant_id = p.id AND sp.vendor_id = v.id
WHERE p.plant_key = 'spinach';

INSERT INTO regional_vendor_recommendations (plant_id, region_id, vendor_id, seed_product_id, preference_rank, order_timing, planting_instructions, succession_plantings, packets_needed_per_100sqft, special_notes)
SELECT 
    p.id,
    r.id,
    v.id,
    sp.id,
    1,
    'January (for March-September succession)',
    'Direct sow every 3 weeks March through August. Short round variety perfect for clay soil.',
    5,
    2,
    'Round carrots work better in Durham clay. Succession plant for continuous harvest.'
FROM plants p 
JOIN regions r ON r.code = 'US'
JOIN vendors v ON v.vendor_key = 'baker_creek'
JOIN seed_products sp ON sp.plant_id = p.id AND sp.vendor_id = v.id
WHERE p.plant_key = 'carrots';

-- Link products to purchase windows
INSERT INTO product_purchase_windows (seed_product_id, purchase_window_id, is_primary_window, notes)
SELECT 
    sp.id,
    pw.id,
    TRUE,
    'Primary ordering window for best selection and pricing'
FROM seed_products sp
JOIN purchase_windows pw ON pw.window_key = 'winter_seed_order'
WHERE sp.variety_name IN ('Clemson Spineless Okra', 'Serrano Pepper', 'Red Russian Kale', 'Jericho Lettuce (Romaine)', 'Space Spinach F1', 'Paris Market Carrot', 'Early Jersey Wakefield Cabbage', 'Red Callaloo Amaranth');

-- Sweet potato slips get spring prep window
INSERT INTO product_purchase_windows (seed_product_id, purchase_window_id, is_primary_window, notes)
SELECT 
    sp.id,
    pw.id,
    TRUE,
    'Pre-order slips for May planting'
FROM seed_products sp
JOIN purchase_windows pw ON pw.window_key = 'spring_prep'
WHERE sp.variety_name = 'Beauregard Sweet Potato Slips';