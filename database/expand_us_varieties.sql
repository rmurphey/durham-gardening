-- Expand US Crop Varieties Database
-- Adding 30+ new varieties across 6 major crop categories
-- Research completed: legumes, nightshades, cucurbits, brassicas, root vegetables, corn

-- First add new plant categories
INSERT OR IGNORE INTO plant_categories (category_key, name, description) VALUES
('legumes', 'Legumes', 'Nitrogen-fixing crops including beans, peas, and lentils'),
('nightshades', 'Nightshades', 'Solanaceae family including tomatoes, peppers, and eggplant'),
('cucurbits', 'Cucurbits', 'Gourd family including squash, cucumbers, and melons'),
('brassicas', 'Brassicas', 'Cabbage family including broccoli, cauliflower, and kale'),
('root_vegetables', 'Root Vegetables', 'Underground storage crops including beets, turnips, and radishes'),
('grains', 'Grains', 'Cereal crops including corn and other grain varieties');

-- LEGUMES (Beans & Peas)
INSERT INTO plants (plant_key, category_id, scientific_name, min_zone, max_zone, min_temp_f, max_temp_f, optimal_temp_min_f, optimal_temp_max_f, harvest_start_months, harvest_duration_months, transplant_weeks, drought_tolerance, heat_tolerance, humidity_tolerance, is_perennial, spacing_inches, mature_height_inches, days_to_maturity) VALUES
('bush_bean_heavyweight', (SELECT id FROM plant_categories WHERE category_key = 'legumes'), 'Phaseolus vulgaris', '3a', '11', 32, 95, 60, 85, 2.0, 2.0, 0, 'fair', 'good', 'good', FALSE, 6, 18, 53),
('bush_bean_kentucky_wonder', (SELECT id FROM plant_categories WHERE category_key = 'legumes'), 'Phaseolus vulgaris', '3a', '11', 32, 95, 60, 85, 2.0, 2.0, 0, 'fair', 'good', 'good', FALSE, 6, 18, 58),
('bush_bean_royal_burgundy', (SELECT id FROM plant_categories WHERE category_key = 'legumes'), 'Phaseolus vulgaris', '2a', '11', 25, 95, 60, 85, 2.0, 2.0, 0, 'fair', 'good', 'good', FALSE, 6, 18, 55),
('pole_bean_blue_lake', (SELECT id FROM plant_categories WHERE category_key = 'legumes'), 'Phaseolus vulgaris', '3a', '11', 32, 95, 60, 85, 2.0, 3.0, 0, 'fair', 'good', 'good', FALSE, 8, 72, 60),
('pole_bean_kentucky_wonder', (SELECT id FROM plant_categories WHERE category_key = 'legumes'), 'Phaseolus vulgaris', '3a', '11', 32, 95, 60, 85, 2.0, 3.0, 0, 'fair', 'good', 'good', FALSE, 8, 72, 65),
('pole_bean_romano', (SELECT id FROM plant_categories WHERE category_key = 'legumes'), 'Phaseolus vulgaris', '3a', '11', 32, 95, 60, 85, 2.5, 2.5, 0, 'fair', 'good', 'good', FALSE, 8, 72, 70),
('pole_bean_rattlesnake', (SELECT id FROM plant_categories WHERE category_key = 'legumes'), 'Phaseolus vulgaris', '6a', '11', 40, 110, 70, 95, 2.5, 2.5, 0, 'excellent', 'excellent', 'good', FALSE, 8, 72, 75),
('fava_bean', (SELECT id FROM plant_categories WHERE category_key = 'legumes'), 'Vicia faba', '1a', '5b', 15, 75, 50, 65, 3.0, 2.0, 0, 'good', 'poor', 'fair', FALSE, 8, 36, 85);

-- NIGHTSHADES (Tomatoes)
INSERT INTO plants (plant_key, category_id, scientific_name, min_zone, max_zone, min_temp_f, max_temp_f, optimal_temp_min_f, optimal_temp_max_f, harvest_start_months, harvest_duration_months, transplant_weeks, drought_tolerance, heat_tolerance, humidity_tolerance, is_perennial, spacing_inches, mature_height_inches, days_to_maturity) VALUES
('tomato_sub_arctic', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '2a', '6b', 25, 85, 60, 80, 1.5, 2.0, 6, 'fair', 'poor', 'fair', FALSE, 24, 36, 42),
('tomato_siberian', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '2a', '7a', 25, 85, 60, 80, 2.0, 2.5, 6, 'fair', 'poor', 'fair', FALSE, 24, 48, 58),
('tomato_oregon_spring', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '3a', '8a', 32, 90, 60, 80, 2.0, 2.5, 6, 'fair', 'fair', 'fair', FALSE, 24, 36, 58),
('tomato_siletz', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '3a', '9a', 32, 95, 60, 85, 2.0, 2.5, 6, 'fair', 'good', 'fair', FALSE, 24, 36, 52),
('tomato_cherokee_purple', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '5a', '9a', 40, 95, 65, 85, 3.0, 3.0, 6, 'good', 'good', 'good', FALSE, 36, 72, 75),
('tomato_early_girl', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '4a', '10a', 35, 95, 65, 85, 2.5, 3.0, 6, 'fair', 'fair', 'fair', FALSE, 24, 60, 65),
('tomato_better_boy', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '4a', '10a', 35, 95, 65, 85, 3.0, 3.0, 6, 'fair', 'fair', 'fair', FALSE, 36, 72, 75),
('tomato_heatmaster', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '7a', '11', 45, 110, 70, 95, 3.0, 3.0, 6, 'good', 'excellent', 'excellent', FALSE, 24, 48, 70),
('tomato_phoenix', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '8a', '11', 50, 110, 75, 100, 3.0, 2.5, 6, 'good', 'excellent', 'excellent', FALSE, 24, 36, 65),
('tomato_sun_gold', (SELECT id FROM plant_categories WHERE category_key = 'nightshades'), 'Solanum lycopersicum', '6a', '11', 40, 105, 70, 90, 2.5, 4.0, 6, 'good', 'excellent', 'good', FALSE, 24, 72, 65);

-- CUCURBITS (Squash, Cucumbers, Melons)
INSERT INTO plants (plant_key, category_id, scientific_name, min_zone, max_zone, min_temp_f, max_temp_f, optimal_temp_min_f, optimal_temp_max_f, harvest_start_months, harvest_duration_months, transplant_weeks, drought_tolerance, heat_tolerance, humidity_tolerance, is_perennial, spacing_inches, mature_height_inches, days_to_maturity) VALUES
('zucchini_black_beauty', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Cucurbita pepo', '3a', '11', 32, 100, 65, 85, 2.0, 3.0, 3, 'fair', 'good', 'fair', FALSE, 36, 24, 50),
('summer_squash_crookneck', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Cucurbita pepo', '3a', '11', 32, 100, 65, 85, 2.0, 3.0, 3, 'fair', 'good', 'fair', FALSE, 36, 24, 50),
('summer_squash_pattypan', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Cucurbita pepo', '3a', '11', 32, 100, 65, 85, 2.0, 3.0, 3, 'fair', 'good', 'fair', FALSE, 36, 24, 50),
('winter_squash_butternut', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Cucurbita moschata', '4a', '11', 35, 100, 65, 85, 4.0, 1.0, 3, 'good', 'good', 'fair', FALSE, 48, 36, 110),
('winter_squash_honeynut', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Cucurbita moschata', '4a', '11', 35, 100, 65, 85, 3.5, 1.0, 3, 'good', 'good', 'fair', FALSE, 36, 24, 105),
('winter_squash_delicata', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Cucurbita pepo', '3a', '10a', 32, 95, 65, 85, 3.5, 1.0, 3, 'fair', 'fair', 'fair', FALSE, 36, 24, 100),
('cucumber_slicing', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Cucumis sativus', '3a', '11', 32, 95, 65, 85, 2.0, 2.5, 3, 'fair', 'fair', 'poor', FALSE, 18, 72, 60),
('cucumber_pickling', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Cucumis sativus', '3a', '11', 32, 95, 65, 85, 2.0, 2.5, 3, 'fair', 'fair', 'poor', FALSE, 18, 72, 55),
('cantaloupe', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Cucumis melo', '4a', '11', 35, 100, 70, 90, 3.0, 1.5, 3, 'good', 'good', 'fair', FALSE, 48, 18, 85),
('watermelon', (SELECT id FROM plant_categories WHERE category_key = 'cucurbits'), 'Citrullus lanatus', '5a', '11', 40, 105, 75, 95, 3.5, 1.5, 3, 'excellent', 'excellent', 'fair', FALSE, 60, 18, 95);

-- BRASSICAS (Cool Season)
INSERT INTO plants (plant_key, category_id, scientific_name, min_zone, max_zone, min_temp_f, max_temp_f, optimal_temp_min_f, optimal_temp_max_f, harvest_start_months, harvest_duration_months, transplant_weeks, drought_tolerance, heat_tolerance, humidity_tolerance, is_perennial, spacing_inches, mature_height_inches, days_to_maturity) VALUES
('broccoli_everest', (SELECT id FROM plant_categories WHERE category_key = 'brassicas'), 'Brassica oleracea var. italica', '2a', '10a', 25, 75, 50, 65, 2.5, 2.0, 6, 'fair', 'poor', 'fair', FALSE, 18, 24, 65),
('broccoli_gypsy', (SELECT id FROM plant_categories WHERE category_key = 'brassicas'), 'Brassica oleracea var. italica', '2a', '10a', 25, 75, 50, 65, 2.5, 2.0, 6, 'fair', 'poor', 'fair', FALSE, 18, 24, 60),
('brussels_sprouts', (SELECT id FROM plant_categories WHERE category_key = 'brassicas'), 'Brassica oleracea var. gemmifera', '2a', '9a', 25, 75, 45, 65, 4.0, 3.0, 8, 'fair', 'poor', 'fair', FALSE, 24, 36, 100),
('cauliflower_white', (SELECT id FROM plant_categories WHERE category_key = 'brassicas'), 'Brassica oleracea var. botrytis', '2a', '10a', 25, 75, 50, 65, 3.0, 1.5, 6, 'fair', 'poor', 'fair', FALSE, 18, 24, 80),
('cabbage_consul', (SELECT id FROM plant_categories WHERE category_key = 'brassicas'), 'Brassica oleracea var. capitata', '1a', '10a', 20, 75, 45, 65, 3.0, 1.0, 6, 'fair', 'poor', 'fair', FALSE, 18, 18, 75);

-- ROOT VEGETABLES (Cold Hardy)
INSERT INTO plants (plant_key, category_id, scientific_name, min_zone, max_zone, min_temp_f, max_temp_f, optimal_temp_min_f, optimal_temp_max_f, harvest_start_months, harvest_duration_months, transplant_weeks, drought_tolerance, heat_tolerance, humidity_tolerance, is_perennial, spacing_inches, mature_height_inches, days_to_maturity) VALUES
('beet_detroit_dark_red', (SELECT id FROM plant_categories WHERE category_key = 'root_vegetables'), 'Beta vulgaris', '2a', '10a', 25, 85, 50, 75, 2.0, 2.0, 0, 'good', 'fair', 'fair', FALSE, 4, 12, 55),
('beet_early_wonder', (SELECT id FROM plant_categories WHERE category_key = 'root_vegetables'), 'Beta vulgaris', '2a', '10a', 25, 85, 50, 75, 2.0, 2.0, 0, 'good', 'fair', 'fair', FALSE, 4, 12, 50),
('turnip_purple_top', (SELECT id FROM plant_categories WHERE category_key = 'root_vegetables'), 'Brassica rapa', '1a', '9a', 20, 75, 45, 65, 1.5, 2.0, 0, 'good', 'poor', 'fair', FALSE, 6, 12, 55),
('turnip_tokyo_market', (SELECT id FROM plant_categories WHERE category_key = 'root_vegetables'), 'Brassica rapa', '2a', '9a', 25, 75, 45, 65, 1.0, 1.5, 0, 'good', 'poor', 'fair', FALSE, 4, 8, 30),
('parsnip_hollow_crown', (SELECT id FROM plant_categories WHERE category_key = 'root_vegetables'), 'Pastinaca sativa', '1a', '8a', 15, 75, 45, 65, 4.0, 1.0, 0, 'good', 'poor', 'fair', FALSE, 6, 12, 120),
('radish_french_breakfast', (SELECT id FROM plant_categories WHERE category_key = 'root_vegetables'), 'Raphanus sativus', '2a', '10a', 25, 80, 50, 70, 1.0, 1.0, 0, 'fair', 'poor', 'fair', FALSE, 2, 6, 25),
('radish_daikon', (SELECT id FROM plant_categories WHERE category_key = 'root_vegetables'), 'Raphanus sativus', '3a', '10a', 32, 80, 50, 70, 2.0, 1.5, 0, 'fair', 'poor', 'fair', FALSE, 6, 18, 60);

-- GRAINS (Corn)
INSERT INTO plants (plant_key, category_id, scientific_name, min_zone, max_zone, min_temp_f, max_temp_f, optimal_temp_min_f, optimal_temp_max_f, harvest_start_months, harvest_duration_months, transplant_weeks, drought_tolerance, heat_tolerance, humidity_tolerance, is_perennial, spacing_inches, mature_height_inches, days_to_maturity) VALUES
('corn_golden_bantam', (SELECT id FROM plant_categories WHERE category_key = 'grains'), 'Zea mays', '3a', '10a', 32, 95, 65, 85, 3.0, 1.0, 0, 'fair', 'good', 'fair', FALSE, 12, 72, 80),
('corn_early_sunglow', (SELECT id FROM plant_categories WHERE category_key = 'grains'), 'Zea mays', '2a', '9a', 25, 90, 60, 80, 2.5, 1.0, 0, 'fair', 'fair', 'fair', FALSE, 12, 60, 65),
('corn_peaches_cream', (SELECT id FROM plant_categories WHERE category_key = 'grains'), 'Zea mays', '4a', '10a', 35, 95, 65, 85, 3.0, 1.0, 0, 'fair', 'good', 'fair', FALSE, 12, 72, 82),
('corn_painted_mountain', (SELECT id FROM plant_categories WHERE category_key = 'grains'), 'Zea mays', '3a', '8a', 32, 85, 60, 80, 3.0, 1.0, 0, 'good', 'fair', 'fair', FALSE, 12, 84, 80),
('corn_bloody_butcher', (SELECT id FROM plant_categories WHERE category_key = 'grains'), 'Zea mays', '4a', '9a', 35, 90, 65, 85, 4.0, 1.0, 0, 'good', 'good', 'fair', FALSE, 12, 144, 105),
('popcorn_strawberry', (SELECT id FROM plant_categories WHERE category_key = 'grains'), 'Zea mays', '4a', '9a', 35, 90, 65, 85, 3.5, 0.5, 0, 'good', 'good', 'fair', FALSE, 12, 60, 98);

-- Add common names for all new varieties
INSERT INTO plant_names (plant_id, language, common_name, alternate_names) VALUES
((SELECT id FROM plants WHERE plant_key = 'bush_bean_heavyweight'), 'en', 'Heavyweight II Bush Bean', '["Bush Bean", "Green Bean"]'),
((SELECT id FROM plants WHERE plant_key = 'bush_bean_kentucky_wonder'), 'en', 'Bush Kentucky Wonder Bean', '["Bush Bean", "Green Bean"]'),
((SELECT id FROM plants WHERE plant_key = 'bush_bean_royal_burgundy'), 'en', 'Royal Burgundy Bush Bean', '["Purple Bean", "Bush Bean"]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_blue_lake'), 'en', 'Blue Lake Pole Bean', '["Pole Bean", "Green Bean"]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_kentucky_wonder'), 'en', 'Kentucky Wonder Pole Bean', '["Pole Bean", "Green Bean"]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_romano'), 'en', 'Romano Pole Bean', '["Italian Bean", "Flat Bean"]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_rattlesnake'), 'en', 'Rattlesnake Pole Bean', '["Heirloom Bean", "Speckled Bean"]'),
((SELECT id FROM plants WHERE plant_key = 'fava_bean'), 'en', 'Fava Bean', '["Broad Bean", "Horse Bean", "Field Bean"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_sub_arctic'), 'en', 'Sub Arctic Plenty Tomato', '["Cold Hardy Tomato", "Short Season Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_siberian'), 'en', 'Siberian Tomato', '["Cold Hardy Tomato", "Early Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_oregon_spring'), 'en', 'Oregon Spring Tomato', '["Cool Climate Tomato", "Determinate Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_siletz'), 'en', 'Siletz Tomato', '["Pacific Northwest Tomato", "Early Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_cherokee_purple'), 'en', 'Cherokee Purple Tomato', '["Heirloom Tomato", "Purple Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_early_girl'), 'en', 'Early Girl Tomato', '["Hybrid Tomato", "Early Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_better_boy'), 'en', 'Better Boy Tomato', '["Hybrid Tomato", "Disease Resistant Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_heatmaster'), 'en', 'Heatmaster Tomato', '["Heat Tolerant Tomato", "Southern Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_phoenix'), 'en', 'Phoenix Tomato', '["Heat Tolerant Tomato", "Texas Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_sun_gold'), 'en', 'Sun Gold Cherry Tomato', '["Cherry Tomato", "Heat Tolerant Tomato"]'),
((SELECT id FROM plants WHERE plant_key = 'zucchini_black_beauty'), 'en', 'Black Beauty Zucchini', '["Summer Squash", "Zucchini"]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_crookneck'), 'en', 'Yellow Crookneck Squash', '["Summer Squash", "Crookneck"]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_pattypan'), 'en', 'Pattypan Squash', '["Summer Squash", "Scallop Squash"]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_butternut'), 'en', 'Butternut Squash', '["Winter Squash", "Storage Squash"]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_honeynut'), 'en', 'Honeynut Squash', '["Winter Squash", "Mini Butternut"]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_delicata'), 'en', 'Delicata Squash', '["Winter Squash", "Sweet Potato Squash"]'),
((SELECT id FROM plants WHERE plant_key = 'cucumber_slicing'), 'en', 'Slicing Cucumber', '["Fresh Cucumber", "Table Cucumber"]'),
((SELECT id FROM plants WHERE plant_key = 'cucumber_pickling'), 'en', 'Pickling Cucumber', '["Pickle Cucumber", "Processing Cucumber"]'),
((SELECT id FROM plants WHERE plant_key = 'cantaloupe'), 'en', 'Cantaloupe', '["Muskmelon", "Rockmelon"]'),
((SELECT id FROM plants WHERE plant_key = 'watermelon'), 'en', 'Watermelon', '["Summer Melon"]'),
((SELECT id FROM plants WHERE plant_key = 'broccoli_everest'), 'en', 'Everest Broccoli', '["Heading Broccoli"]'),
((SELECT id FROM plants WHERE plant_key = 'broccoli_gypsy'), 'en', 'Gypsy Broccoli', '["Heading Broccoli"]'),
((SELECT id FROM plants WHERE plant_key = 'brussels_sprouts'), 'en', 'Brussels Sprouts', '["Mini Cabbages"]'),
((SELECT id FROM plants WHERE plant_key = 'cauliflower_white'), 'en', 'White Cauliflower', '["Heading Cauliflower"]'),
((SELECT id FROM plants WHERE plant_key = 'cabbage_consul'), 'en', 'Consul Cabbage', '["Storage Cabbage", "Heading Cabbage"]'),
((SELECT id FROM plants WHERE plant_key = 'beet_detroit_dark_red'), 'en', 'Detroit Dark Red Beet', '["Table Beet", "Garden Beet"]'),
((SELECT id FROM plants WHERE plant_key = 'beet_early_wonder'), 'en', 'Early Wonder Beet', '["Quick Beet", "Baby Beet"]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_purple_top'), 'en', 'Purple Top Turnip', '["Storage Turnip"]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_tokyo_market'), 'en', 'Tokyo Market Turnip', '["Hakurei Turnip", "Salad Turnip"]'),
((SELECT id FROM plants WHERE plant_key = 'parsnip_hollow_crown'), 'en', 'Hollow Crown Parsnip', '["Storage Parsnip"]'),
((SELECT id FROM plants WHERE plant_key = 'radish_french_breakfast'), 'en', 'French Breakfast Radish', '["Oblong Radish"]'),
((SELECT id FROM plants WHERE plant_key = 'radish_daikon'), 'en', 'Daikon Radish', '["Winter Radish", "White Radish"]'),
((SELECT id FROM plants WHERE plant_key = 'corn_golden_bantam'), 'en', 'Golden Bantam Sweet Corn', '["Heirloom Corn", "Yellow Corn"]'),
((SELECT id FROM plants WHERE plant_key = 'corn_early_sunglow'), 'en', 'Early Sunglow Sweet Corn', '["Early Corn", "Short Season Corn"]'),
((SELECT id FROM plants WHERE plant_key = 'corn_peaches_cream'), 'en', 'Peaches and Cream Sweet Corn', '["Bicolor Corn"]'),
((SELECT id FROM plants WHERE plant_key = 'corn_painted_mountain'), 'en', 'Painted Mountain Corn', '["Flint Corn", "Ornamental Corn"]'),
((SELECT id FROM plants WHERE plant_key = 'corn_bloody_butcher'), 'en', 'Bloody Butcher Dent Corn', '["Field Corn", "Dent Corn"]'),
((SELECT id FROM plants WHERE plant_key = 'popcorn_strawberry'), 'en', 'Strawberry Popcorn', '["Ornamental Corn", "Mini Popcorn"]');