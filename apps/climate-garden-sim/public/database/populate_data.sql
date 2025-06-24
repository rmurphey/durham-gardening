-- Insert base data for Climate Garden Simulation Plant Database

-- Regions
INSERT INTO regions (code, name, currency, language) VALUES
('US', 'United States', 'USD', 'en'),
('CA', 'Canada', 'CAD', 'en');

-- Climate Zones (USDA/Canadian equivalents)
INSERT INTO climate_zones (zone_code, min_temp_f, max_temp_f, description) VALUES
('1a', -60, -55, 'Extreme Arctic'),
('1b', -55, -50, 'Arctic'),
('2a', -50, -45, 'Subarctic'),
('2b', -45, -40, 'Subarctic'),
('3a', -40, -35, 'Very Cold Continental'),
('3b', -35, -30, 'Cold Continental'),
('4a', -30, -25, 'Continental'),
('4b', -25, -20, 'Continental'),
('5a', -20, -15, 'Cool Continental'),
('5b', -15, -10, 'Cool Continental'),
('6a', -10, -5, 'Cool Temperate'),
('6b', -5, 0, 'Cool Temperate'),
('7a', 0, 5, 'Mild Temperate'),
('7b', 5, 10, 'Mild Temperate'),
('8a', 10, 15, 'Warm Temperate'),
('8b', 15, 20, 'Warm Temperate'),
('9a', 20, 25, 'Subtropical'),
('9b', 25, 30, 'Subtropical'),
('10a', 30, 35, 'Tropical'),
('10b', 35, 40, 'Tropical'),
('11', 40, 50, 'Equatorial');

-- Plant Categories
INSERT INTO plant_categories (category_key, name, description) VALUES
('heat_tolerant', 'Heat-Tolerant Crops', 'Vegetables and herbs that thrive in high temperatures and drought conditions'),
('cool_season', 'Cool-Season Crops', 'Vegetables that prefer cooler temperatures and may bolt in heat'),
('perennials', 'Perennial Herbs', 'Long-lived herbs that return year after year'),
('root_vegetables', 'Root Vegetables', 'Crops grown primarily for their edible roots or tubers'),
('leafy_greens', 'Leafy Greens', 'Fast-growing vegetables grown for their leaves'),
('fruiting_crops', 'Fruiting Crops', 'Vegetables that produce edible fruits or pods');

-- Plants - Heat Tolerant Category
INSERT INTO plants (plant_key, category_id, scientific_name, min_zone, max_zone, min_temp_f, max_temp_f, optimal_temp_min_f, optimal_temp_max_f, harvest_start_months, harvest_duration_months, transplant_weeks, drought_tolerance, heat_tolerance, humidity_tolerance, is_perennial, spacing_inches, mature_height_inches, days_to_maturity) VALUES
('okra', 1, 'Abelmoschus esculentus', '6a', '11', -10, 110, 77, 95, 2.0, 4.0, 0, 'excellent', 'excellent', 'excellent', FALSE, 12, 72, 60),
('hot_peppers', 1, 'Capsicum annuum', '5a', '11', -20, 104, 68, 86, 3.0, 5.0, 6, 'good', 'excellent', 'good', FALSE, 18, 36, 75),
('amaranth', 1, 'Amaranthus spp.', '4a', '11', -30, 107, 72, 90, 1.5, 3.0, 0, 'excellent', 'excellent', 'excellent', FALSE, 6, 24, 45),
('sweet_potato', 1, 'Ipomoea batatas', '6a', '11', -10, 100, 75, 86, 4.0, 1.0, 0, 'excellent', 'excellent', 'good', FALSE, 24, 18, 120),
('malabar_spinach', 1, 'Basella alba', '7a', '11', 0, 104, 77, 95, 2.0, 4.0, 4, 'good', 'excellent', 'excellent', FALSE, 12, 48, 70);

-- Plants - Cool Season Category  
INSERT INTO plants (plant_key, category_id, scientific_name, min_zone, max_zone, min_temp_f, max_temp_f, optimal_temp_min_f, optimal_temp_max_f, harvest_start_months, harvest_duration_months, transplant_weeks, drought_tolerance, heat_tolerance, humidity_tolerance, is_perennial, spacing_inches, mature_height_inches, days_to_maturity) VALUES
('kale', 2, 'Brassica oleracea var. acephala', '2a', '9a', -50, 77, 50, 68, 2.0, 4.0, 4, 'fair', 'poor', 'good', FALSE, 12, 24, 60),
('cabbage', 2, 'Brassica oleracea var. capitata', '1a', '9a', -60, 72, 46, 64, 3.0, 2.0, 6, 'fair', 'poor', 'fair', FALSE, 18, 18, 90),
('lettuce', 2, 'Lactuca sativa', '2a', '9a', -50, 75, 54, 64, 1.5, 2.0, 3, 'poor', 'poor', 'good', FALSE, 8, 12, 45),
('spinach', 2, 'Spinacia oleracea', '2a', '9a', -50, 68, 50, 61, 1.5, 2.0, 0, 'poor', 'poor', 'good', FALSE, 6, 8, 40),
('carrots', 2, 'Daucus carota', '3a', '10a', -40, 82, 54, 72, 2.5, 1.0, 0, 'fair', 'fair', 'good', FALSE, 3, 12, 75),
('arugula', 2, 'Eruca vesicaria', '2a', '9b', -50, 80, 50, 68, 1.0, 2.0, 0, 'fair', 'fair', 'good', FALSE, 4, 8, 30),
('radishes', 2, 'Raphanus sativus', '2a', '10a', -50, 86, 50, 70, 1.0, 0.5, 0, 'fair', 'fair', 'good', FALSE, 2, 6, 25);

-- Plants - Perennial Herbs
INSERT INTO plants (plant_key, category_id, scientific_name, min_zone, max_zone, min_temp_f, max_temp_f, optimal_temp_min_f, optimal_temp_max_f, harvest_start_months, harvest_duration_months, transplant_weeks, drought_tolerance, heat_tolerance, humidity_tolerance, is_perennial, spacing_inches, mature_height_inches, days_to_maturity) VALUES
('rosemary', 3, 'Rosmarinus officinalis', '6a', '10a', -10, 104, 59, 86, 0.5, 12.0, 0, 'excellent', 'excellent', 'fair', TRUE, 24, 48, 90),
('thyme', 3, 'Thymus vulgaris', '4a', '9b', -30, 95, 59, 77, 0.5, 12.0, 0, 'excellent', 'good', 'fair', TRUE, 12, 12, 75),
('oregano', 3, 'Origanum vulgare', '4a', '10a', -30, 100, 64, 82, 0.5, 12.0, 0, 'good', 'good', 'good', TRUE, 18, 24, 80),
('mint', 3, 'Mentha spp.', '3a', '9a', -40, 86, 59, 77, 0.5, 12.0, 0, 'poor', 'fair', 'excellent', TRUE, 12, 24, 60),
('sage', 3, 'Salvia officinalis', '4a', '8b', -30, 90, 59, 77, 0.5, 12.0, 0, 'excellent', 'good', 'fair', TRUE, 18, 30, 85),
('lavender', 3, 'Lavandula angustifolia', '5a', '9a', -20, 90, 59, 77, 0.5, 12.0, 0, 'excellent', 'good', 'poor', TRUE, 24, 36, 120);

-- Plant Names (English)
INSERT INTO plant_names (plant_id, language, common_name, alternate_names) VALUES
(1, 'en', 'Okra', '["Lady''s Fingers", "Gumbo"]'),
(2, 'en', 'Hot Peppers', '["Chili Peppers", "Cayenne", "Jalapeño"]'),
(3, 'en', 'Amaranth Greens', '["Chinese Spinach", "Callaloo"]'),
(4, 'en', 'Sweet Potato', '["Sweet Potato Vine", "Kumara"]'),
(5, 'en', 'Malabar Spinach', '["Ceylon Spinach", "Climbing Spinach"]'),
(6, 'en', 'Kale', '["Curly Kale", "Dinosaur Kale", "Lacinato"]'),
(7, 'en', 'Cabbage', '["Head Cabbage", "Green Cabbage"]'),
(8, 'en', 'Lettuce', '["Head Lettuce", "Leaf Lettuce", "Romaine"]'),
(9, 'en', 'Spinach', '["Baby Spinach", "True Spinach"]'),
(10, 'en', 'Carrots', '["Garden Carrots", "Baby Carrots"]'),
(11, 'en', 'Arugula', '["Rocket", "Roquette"]'),
(12, 'en', 'Radishes', '["Garden Radish", "Cherry Belle"]'),
(13, 'en', 'Rosemary', '["Garden Rosemary", "Common Rosemary"]'),
(14, 'en', 'Thyme', '["Garden Thyme", "Common Thyme"]'),
(15, 'en', 'Oregano', '["Wild Marjoram", "Pizza Herb"]'),
(16, 'en', 'Mint', '["Spearmint", "Peppermint"]'),
(17, 'en', 'Sage', '["Garden Sage", "Culinary Sage"]'),
(18, 'en', 'Lavender', '["English Lavender", "True Lavender"]');

-- Regional Planting Months - US Temperate (Zones 5-7)
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
-- Heat Tolerant Crops
(1, 1, 'temperate', '[4, 5, 6]'),     -- Okra
(2, 1, 'temperate', '[3, 4, 5]'),     -- Hot Peppers  
(3, 1, 'temperate', '[4, 5, 6, 7]'),  -- Amaranth
(4, 1, 'temperate', '[5, 6]'),        -- Sweet Potato
(5, 1, 'temperate', '[5, 6, 7]'),     -- Malabar Spinach
-- Cool Season Crops
(6, 1, 'temperate', '[8, 9, 1, 2, 3]'),    -- Kale
(7, 1, 'temperate', '[8, 9, 1, 2]'),       -- Cabbage
(8, 1, 'temperate', '[9, 10, 1, 2, 3]'),   -- Lettuce
(9, 1, 'temperate', '[8, 9, 10, 1, 2, 3]'), -- Spinach
(10, 1, 'temperate', '[9, 10, 1, 2, 3, 4]'), -- Carrots
(11, 1, 'temperate', '[8, 9, 10, 2, 3, 4]'), -- Arugula
(12, 1, 'temperate', '[3, 4, 8, 9, 10]'),   -- Radishes
-- Perennial Herbs
(13, 1, 'temperate', '[3, 4, 9, 10]'), -- Rosemary
(14, 1, 'temperate', '[3, 4, 9, 10]'), -- Thyme
(15, 1, 'temperate', '[3, 4, 9, 10]'), -- Oregano
(16, 1, 'temperate', '[3, 4, 5, 9, 10]'), -- Mint
(17, 1, 'temperate', '[3, 4, 9, 10]'), -- Sage
(18, 1, 'temperate', '[3, 4, 9, 10]'); -- Lavender

-- Regional Planting Months - US Subtropical (Zones 8-9)
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
-- Heat Tolerant Crops
(1, 1, 'subtropical', '[3, 4, 5, 9]'),     -- Okra
(2, 1, 'subtropical', '[2, 3, 4, 10, 11]'), -- Hot Peppers
(3, 1, 'subtropical', '[3, 4, 5, 8, 9]'),  -- Amaranth
(4, 1, 'subtropical', '[3, 4, 5, 9, 10]'), -- Sweet Potato
(5, 1, 'subtropical', '[4, 5, 6, 8, 9]'), -- Malabar Spinach
-- Cool Season Crops
(6, 1, 'subtropical', '[9, 10, 11, 1, 2]'),    -- Kale
(7, 1, 'subtropical', '[9, 10, 11, 1]'),       -- Cabbage
(8, 1, 'subtropical', '[9, 10, 11, 1, 2, 3]'), -- Lettuce
(9, 1, 'subtropical', '[9, 10, 11, 1, 2]'),    -- Spinach
(10, 1, 'subtropical', '[9, 10, 11, 1, 2, 3]'), -- Carrots
(11, 1, 'subtropical', '[9, 10, 11, 1, 2, 3]'), -- Arugula
(12, 1, 'subtropical', '[10, 11, 12, 1, 2, 3]'), -- Radishes
-- Perennial Herbs
(13, 1, 'subtropical', '[3, 4, 5, 9, 10, 11]'), -- Rosemary
(14, 1, 'subtropical', '[3, 4, 5, 9, 10, 11]'), -- Thyme
(15, 1, 'subtropical', '[3, 4, 5, 9, 10, 11]'), -- Oregano
(16, 1, 'subtropical', '[3, 4, 5, 9, 10, 11]'), -- Mint
(17, 1, 'subtropical', '[3, 4, 5, 9, 10, 11]'), -- Sage
(18, 1, 'subtropical', '[3, 4, 5, 9, 10, 11]'); -- Lavender

-- Regional Planting Months - Canada Temperate (Zones 3-6)  
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
-- Heat Tolerant Crops (limited selection for Canada)
(2, 2, 'temperate', '[5, 6]'),         -- Hot Peppers (greenhouse/indoor start)
(3, 2, 'temperate', '[5, 6, 7]'),      -- Amaranth
-- Cool Season Crops
(6, 2, 'temperate', '[8, 9, 4, 5]'),       -- Kale
(7, 2, 'temperate', '[8, 9, 4, 5]'),       -- Cabbage
(8, 2, 'temperate', '[8, 9, 4, 5, 6]'),    -- Lettuce
(9, 2, 'temperate', '[8, 9, 4, 5, 6]'),    -- Spinach
(10, 2, 'temperate', '[4, 5, 6, 7, 8]'),   -- Carrots
(11, 2, 'temperate', '[4, 5, 6, 8, 9]'),   -- Arugula
(12, 2, 'temperate', '[4, 5, 6, 8, 9]'),   -- Radishes
-- Perennial Herbs
(13, 2, 'temperate', '[5, 6, 8, 9]'),   -- Rosemary (zones 6+ only)
(14, 2, 'temperate', '[4, 5, 8, 9]'),   -- Thyme
(15, 2, 'temperate', '[4, 5, 8, 9]'),   -- Oregano
(16, 2, 'temperate', '[4, 5, 6, 8, 9]'), -- Mint
(17, 2, 'temperate', '[4, 5, 8, 9]'),   -- Sage
(18, 2, 'temperate', '[5, 6, 8, 9]');   -- Lavender

-- Market Prices - United States
INSERT INTO market_prices (plant_id, region_id, price_per_lb, price_per_unit, unit_type, price_premium, seasonal_peak_months) VALUES
(1, 1, 3.50, 0.50, 'pod', 1.2, '[6, 7, 8]'),        -- Okra
(2, 1, 5.00, 0.25, 'pepper', 1.3, '[7, 8, 9]'),     -- Hot Peppers
(3, 1, 4.00, 2.00, 'bunch', 1.1, '[6, 7, 8]'),      -- Amaranth
(4, 1, 2.00, 1.50, 'pound', 1.0, '[10, 11, 12]'),   -- Sweet Potato
(5, 1, 6.00, 3.00, 'bunch', 1.4, '[6, 7, 8]'),      -- Malabar Spinach
(6, 1, 3.00, 2.50, 'bunch', 1.0, '[10, 11, 12, 1, 2]'), -- Kale
(7, 1, 1.50, 2.00, 'head', 1.0, '[10, 11, 12, 1]'), -- Cabbage
(8, 1, 3.50, 2.00, 'head', 1.0, '[3, 4, 5, 10, 11]'), -- Lettuce
(9, 1, 4.00, 3.00, 'bunch', 1.0, '[3, 4, 5, 10, 11]'), -- Spinach
(10, 1, 2.00, 0.15, 'carrot', 1.0, '[10, 11, 12, 1]'), -- Carrots
(11, 1, 8.00, 4.00, 'bunch', 1.2, '[3, 4, 5, 10, 11]'), -- Arugula
(12, 1, 3.00, 0.10, 'radish', 1.0, '[4, 5, 10, 11]'), -- Radishes
(13, 1, 12.00, 0.50, 'ounce', 2.5, '[6, 7, 8, 9, 10]'), -- Rosemary
(14, 1, 15.00, 0.25, 'ounce', 2.5, '[5, 6, 7, 8, 9]'), -- Thyme
(15, 1, 10.00, 0.30, 'ounce', 2.5, '[6, 7, 8, 9]'),    -- Oregano
(16, 1, 8.00, 0.25, 'ounce', 2.0, '[5, 6, 7, 8, 9]'),  -- Mint
(17, 1, 20.00, 0.20, 'ounce', 3.0, '[6, 7, 8, 9, 10]'), -- Sage
(18, 1, 25.00, 1.00, 'bunch', 3.5, '[6, 7, 8]');       -- Lavender

-- Market Prices - Canada (CAD, generally 10-20% higher due to shorter growing season)
INSERT INTO market_prices (plant_id, region_id, price_per_lb, price_per_unit, unit_type, price_premium, seasonal_peak_months) VALUES
(2, 2, 6.50, 0.35, 'pepper', 1.5, '[7, 8, 9]'),     -- Hot Peppers
(3, 2, 5.50, 2.50, 'bunch', 1.3, '[6, 7, 8]'),      -- Amaranth
(6, 2, 4.00, 3.00, 'bunch', 1.1, '[9, 10, 11, 5, 6]'), -- Kale
(7, 2, 2.00, 2.50, 'head', 1.1, '[9, 10, 11, 5]'),  -- Cabbage
(8, 2, 4.50, 2.50, 'head', 1.1, '[5, 6, 9, 10]'),   -- Lettuce
(9, 2, 5.00, 3.50, 'bunch', 1.1, '[5, 6, 9, 10]'),  -- Spinach
(10, 2, 2.50, 0.20, 'carrot', 1.1, '[8, 9, 10]'),   -- Carrots
(11, 2, 10.00, 5.00, 'bunch', 1.4, '[5, 6, 9, 10]'), -- Arugula
(12, 2, 3.50, 0.15, 'radish', 1.1, '[5, 6, 9, 10]'), -- Radishes
(13, 2, 15.00, 0.60, 'ounce', 3.0, '[7, 8, 9]'),    -- Rosemary
(14, 2, 18.00, 0.30, 'ounce', 3.0, '[6, 7, 8, 9]'), -- Thyme
(15, 2, 12.00, 0.40, 'ounce', 3.0, '[7, 8, 9]'),    -- Oregano
(16, 2, 10.00, 0.30, 'ounce', 2.5, '[6, 7, 8, 9]'), -- Mint
(17, 2, 25.00, 0.25, 'ounce', 3.5, '[7, 8, 9]'),    -- Sage
(18, 2, 30.00, 1.25, 'bunch', 4.0, '[7, 8]');       -- Lavender