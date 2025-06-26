-- Regional Planting Schedules for New US Varieties
-- Based on USDA hardiness zones and climate types:
-- Temperate: Zones 1-7 (cold winters, distinct seasons)
-- Subtropical: Zones 8-9 (mild winters, hot summers)  
-- Tropical: Zones 10-11 (warm year-round)

-- US region ID is 1

-- LEGUMES - Warm season crops, plant after last frost
-- Bush Beans (Quick season)
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'bush_bean_heavyweight'), 1, 'temperate', '[4, 5, 6, 7]'),
((SELECT id FROM plants WHERE plant_key = 'bush_bean_heavyweight'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'bush_bean_kentucky_wonder'), 1, 'temperate', '[4, 5, 6, 7]'),
((SELECT id FROM plants WHERE plant_key = 'bush_bean_kentucky_wonder'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'bush_bean_royal_burgundy'), 1, 'temperate', '[4, 5, 6, 7]'),
((SELECT id FROM plants WHERE plant_key = 'bush_bean_royal_burgundy'), 1, 'subtropical', '[3, 4, 5, 8, 9]');

-- Pole Beans (Longer season)
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'pole_bean_blue_lake'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_blue_lake'), 1, 'subtropical', '[3, 4, 5, 8]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_kentucky_wonder'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_kentucky_wonder'), 1, 'subtropical', '[3, 4, 5, 8]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_romano'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_romano'), 1, 'subtropical', '[3, 4, 5, 8]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_rattlesnake'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_rattlesnake'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]');

-- Fava Beans (Cool season only)
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'fava_bean'), 1, 'temperate', '[3, 4, 8, 9]');

-- NIGHTSHADES - Warm season, frost-sensitive
-- Cold Hardy Tomatoes
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'tomato_sub_arctic'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_siberian'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_oregon_spring'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_oregon_spring'), 1, 'subtropical', '[3, 4, 5]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_siletz'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_siletz'), 1, 'subtropical', '[3, 4, 5, 8]');

-- Mid-Season Tomatoes
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'tomato_cherokee_purple'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_cherokee_purple'), 1, 'subtropical', '[3, 4, 5, 8]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_early_girl'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_early_girl'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_better_boy'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_better_boy'), 1, 'subtropical', '[3, 4, 5, 8, 9]');

-- Heat Tolerant Tomatoes
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'tomato_heatmaster'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_heatmaster'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_phoenix'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_phoenix'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_sun_gold'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_sun_gold'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_sun_gold'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]');

-- CUCURBITS - Warm season, frost-sensitive
-- Summer Squash (Quick harvest)
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'zucchini_black_beauty'), 1, 'temperate', '[4, 5, 6, 7]'),
((SELECT id FROM plants WHERE plant_key = 'zucchini_black_beauty'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'zucchini_black_beauty'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_crookneck'), 1, 'temperate', '[4, 5, 6, 7]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_crookneck'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_crookneck'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_pattypan'), 1, 'temperate', '[4, 5, 6, 7]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_pattypan'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_pattypan'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]');

-- Winter Squash (Long season)
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'winter_squash_butternut'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_butternut'), 1, 'subtropical', '[3, 4, 5]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_butternut'), 1, 'tropical', '[11, 12, 1]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_honeynut'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_honeynut'), 1, 'subtropical', '[3, 4, 5]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_honeynut'), 1, 'tropical', '[11, 12, 1]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_delicata'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_delicata'), 1, 'subtropical', '[3, 4, 5]');

-- Cucumbers
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'cucumber_slicing'), 1, 'temperate', '[4, 5, 6, 7]'),
((SELECT id FROM plants WHERE plant_key = 'cucumber_slicing'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'cucumber_slicing'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]'),
((SELECT id FROM plants WHERE plant_key = 'cucumber_pickling'), 1, 'temperate', '[4, 5, 6, 7]'),
((SELECT id FROM plants WHERE plant_key = 'cucumber_pickling'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'cucumber_pickling'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]');

-- Melons (Heat lovers)
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'cantaloupe'), 1, 'temperate', '[5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'cantaloupe'), 1, 'subtropical', '[3, 4, 5]'),
((SELECT id FROM plants WHERE plant_key = 'cantaloupe'), 1, 'tropical', '[11, 12, 1, 2]'),
((SELECT id FROM plants WHERE plant_key = 'watermelon'), 1, 'temperate', '[5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'watermelon'), 1, 'subtropical', '[3, 4, 5]'),
((SELECT id FROM plants WHERE plant_key = 'watermelon'), 1, 'tropical', '[11, 12, 1, 2]');

-- BRASSICAS - Cool season crops, prefer 60-65°F
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'broccoli_everest'), 1, 'temperate', '[3, 4, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'broccoli_everest'), 1, 'subtropical', '[2, 3, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'broccoli_everest'), 1, 'tropical', '[11, 12, 1]'),
((SELECT id FROM plants WHERE plant_key = 'broccoli_gypsy'), 1, 'temperate', '[3, 4, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'broccoli_gypsy'), 1, 'subtropical', '[2, 3, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'broccoli_gypsy'), 1, 'tropical', '[11, 12, 1]'),
((SELECT id FROM plants WHERE plant_key = 'brussels_sprouts'), 1, 'temperate', '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'brussels_sprouts'), 1, 'subtropical', '[8, 9, 10]'),
((SELECT id FROM plants WHERE plant_key = 'cauliflower_white'), 1, 'temperate', '[3, 4, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'cauliflower_white'), 1, 'subtropical', '[2, 3, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'cauliflower_white'), 1, 'tropical', '[11, 12, 1]'),
((SELECT id FROM plants WHERE plant_key = 'cabbage_consul'), 1, 'temperate', '[3, 4, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'cabbage_consul'), 1, 'subtropical', '[2, 3, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'cabbage_consul'), 1, 'tropical', '[11, 12, 1]');

-- ROOT VEGETABLES - Cool season, cold hardy
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'beet_detroit_dark_red'), 1, 'temperate', '[3, 4, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'beet_detroit_dark_red'), 1, 'subtropical', '[2, 3, 4, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'beet_detroit_dark_red'), 1, 'tropical', '[10, 11, 12, 1, 2]'),
((SELECT id FROM plants WHERE plant_key = 'beet_early_wonder'), 1, 'temperate', '[3, 4, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'beet_early_wonder'), 1, 'subtropical', '[2, 3, 4, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'beet_early_wonder'), 1, 'tropical', '[10, 11, 12, 1, 2]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_purple_top'), 1, 'temperate', '[3, 4, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_purple_top'), 1, 'subtropical', '[2, 3, 4, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_purple_top'), 1, 'tropical', '[10, 11, 12, 1, 2]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_tokyo_market'), 1, 'temperate', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_tokyo_market'), 1, 'subtropical', '[2, 3, 4, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_tokyo_market'), 1, 'tropical', '[10, 11, 12, 1, 2]'),
((SELECT id FROM plants WHERE plant_key = 'parsnip_hollow_crown'), 1, 'temperate', '[3, 4]'),
((SELECT id FROM plants WHERE plant_key = 'parsnip_hollow_crown'), 1, 'subtropical', '[2, 3, 11]'),
((SELECT id FROM plants WHERE plant_key = 'radish_french_breakfast'), 1, 'temperate', '[3, 4, 5, 8, 9, 10]'),
((SELECT id FROM plants WHERE plant_key = 'radish_french_breakfast'), 1, 'subtropical', '[2, 3, 4, 10, 11, 12]'),
((SELECT id FROM plants WHERE plant_key = 'radish_french_breakfast'), 1, 'tropical', '[10, 11, 12, 1, 2, 3]'),
((SELECT id FROM plants WHERE plant_key = 'radish_daikon'), 1, 'temperate', '[8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'radish_daikon'), 1, 'subtropical', '[9, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'radish_daikon'), 1, 'tropical', '[10, 11, 12]');

-- GRAINS (Corn) - Warm season, need long frost-free period
INSERT INTO regional_planting_months (plant_id, region_id, climate_type, planting_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'corn_golden_bantam'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'corn_golden_bantam'), 1, 'subtropical', '[3, 4, 5, 8]'),
((SELECT id FROM plants WHERE plant_key = 'corn_early_sunglow'), 1, 'temperate', '[4, 5, 6, 7]'),
((SELECT id FROM plants WHERE plant_key = 'corn_early_sunglow'), 1, 'subtropical', '[3, 4, 5, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'corn_peaches_cream'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'corn_peaches_cream'), 1, 'subtropical', '[3, 4, 5, 8]'),
((SELECT id FROM plants WHERE plant_key = 'corn_painted_mountain'), 1, 'temperate', '[4, 5, 6]'),
((SELECT id FROM plants WHERE plant_key = 'corn_bloody_butcher'), 1, 'temperate', '[4, 5]'),
((SELECT id FROM plants WHERE plant_key = 'corn_bloody_butcher'), 1, 'subtropical', '[3, 4, 5]'),
((SELECT id FROM plants WHERE plant_key = 'popcorn_strawberry'), 1, 'temperate', '[4, 5]'),
((SELECT id FROM plants WHERE plant_key = 'popcorn_strawberry'), 1, 'subtropical', '[3, 4, 5]');