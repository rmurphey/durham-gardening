-- Market Pricing Data for New US Varieties
-- Prices based on typical US grocery store and farmers market values
-- Premium pricing applied to heirloom and specialty varieties

-- US region ID is 1

-- LEGUMES - Generally premium pricing for fresh beans
INSERT INTO market_prices (plant_id, region_id, price_per_lb, price_per_unit, unit_type, price_premium, seasonal_peak_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'bush_bean_heavyweight'), 1, 4.50, NULL, 'pound', 1.0, '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'bush_bean_kentucky_wonder'), 1, 5.00, NULL, 'pound', 1.1, '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'bush_bean_royal_burgundy'), 1, 6.00, NULL, 'pound', 1.3, '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_blue_lake'), 1, 4.50, NULL, 'pound', 1.0, '[6, 7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_kentucky_wonder'), 1, 5.50, NULL, 'pound', 1.2, '[6, 7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_romano'), 1, 6.50, NULL, 'pound', 1.4, '[6, 7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'pole_bean_rattlesnake'), 1, 7.00, NULL, 'pound', 1.5, '[6, 7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'fava_bean'), 1, 8.00, NULL, 'pound', 1.8, '[5, 6, 10]');

-- NIGHTSHADES - Tomatoes have wide price range by variety and season
INSERT INTO market_prices (plant_id, region_id, price_per_lb, price_per_unit, unit_type, price_premium, seasonal_peak_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'tomato_sub_arctic'), 1, 5.00, NULL, 'pound', 1.1, '[7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_siberian'), 1, 5.00, NULL, 'pound', 1.1, '[7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_oregon_spring'), 1, 4.50, NULL, 'pound', 1.0, '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_siletz'), 1, 4.50, NULL, 'pound', 1.0, '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_cherokee_purple'), 1, 7.00, NULL, 'pound', 1.6, '[7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_early_girl'), 1, 4.00, NULL, 'pound', 0.9, '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_better_boy'), 1, 4.00, NULL, 'pound', 0.9, '[7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_heatmaster'), 1, 5.50, NULL, 'pound', 1.2, '[7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_phoenix'), 1, 5.50, NULL, 'pound', 1.2, '[7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'tomato_sun_gold'), 1, 8.00, 6.00, 'pint', 1.8, '[6, 7, 8, 9]');

-- CUCURBITS - Variable pricing by type and season
INSERT INTO market_prices (plant_id, region_id, price_per_lb, price_per_unit, unit_type, price_premium, seasonal_peak_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'zucchini_black_beauty'), 1, 2.50, NULL, 'pound', 0.6, '[6, 7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_crookneck'), 1, 2.50, NULL, 'pound', 0.6, '[6, 7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'summer_squash_pattypan'), 1, 3.00, NULL, 'pound', 0.7, '[6, 7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_butternut'), 1, 1.50, NULL, 'pound', 0.3, '[10, 11, 12]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_honeynut'), 1, 4.00, 3.00, 'each', 0.9, '[10, 11, 12]'),
((SELECT id FROM plants WHERE plant_key = 'winter_squash_delicata'), 1, 2.50, NULL, 'pound', 0.6, '[9, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'cucumber_slicing'), 1, 2.00, 1.50, 'each', 0.4, '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'cucumber_pickling'), 1, 2.50, NULL, 'pound', 0.6, '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'cantaloupe'), 1, 1.50, 4.00, 'each', 0.3, '[7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'watermelon'), 1, 0.75, 6.00, 'each', 0.2, '[7, 8, 9]');

-- BRASSICAS - Premium pricing for fresh, quality produce
INSERT INTO market_prices (plant_id, region_id, price_per_lb, price_per_unit, unit_type, price_premium, seasonal_peak_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'broccoli_everest'), 1, 4.00, 3.00, 'head', 0.9, '[4, 5, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'broccoli_gypsy'), 1, 4.00, 3.00, 'head', 0.9, '[4, 5, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'brussels_sprouts'), 1, 6.00, NULL, 'pound', 1.3, '[10, 11, 12]'),
((SELECT id FROM plants WHERE plant_key = 'cauliflower_white'), 1, 3.50, 4.00, 'head', 0.8, '[4, 5, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'cabbage_consul'), 1, 1.50, 2.50, 'head', 0.3, '[4, 5, 10, 11]');

-- ROOT VEGETABLES - Generally affordable staples
INSERT INTO market_prices (plant_id, region_id, price_per_lb, price_per_unit, unit_type, price_premium, seasonal_peak_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'beet_detroit_dark_red'), 1, 3.00, 2.50, 'bunch', 0.7, '[6, 7, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'beet_early_wonder'), 1, 3.50, 3.00, 'bunch', 0.8, '[5, 6, 9, 10]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_purple_top'), 1, 2.50, NULL, 'pound', 0.6, '[10, 11, 12]'),
((SELECT id FROM plants WHERE plant_key = 'turnip_tokyo_market'), 1, 4.00, 3.00, 'bunch', 0.9, '[4, 5, 10, 11]'),
((SELECT id FROM plants WHERE plant_key = 'parsnip_hollow_crown'), 1, 3.50, NULL, 'pound', 0.8, '[10, 11, 12, 1]'),
((SELECT id FROM plants WHERE plant_key = 'radish_french_breakfast'), 1, 3.00, 2.00, 'bunch', 0.7, '[4, 5, 9, 10]'),
((SELECT id FROM plants WHERE plant_key = 'radish_daikon'), 1, 2.50, 3.00, 'each', 0.6, '[10, 11, 12]');

-- GRAINS (Corn) - Sweet corn premium, field corn commodity pricing
INSERT INTO market_prices (plant_id, region_id, price_per_lb, price_per_unit, unit_type, price_premium, seasonal_peak_months) VALUES
((SELECT id FROM plants WHERE plant_key = 'corn_golden_bantam'), 1, 4.00, 1.50, 'ear', 0.9, '[7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'corn_early_sunglow'), 1, 3.50, 1.25, 'ear', 0.8, '[6, 7, 8]'),
((SELECT id FROM plants WHERE plant_key = 'corn_peaches_cream'), 1, 4.50, 1.75, 'ear', 1.0, '[7, 8, 9]'),
((SELECT id FROM plants WHERE plant_key = 'corn_painted_mountain'), 1, 8.00, NULL, 'pound', 1.8, '[9, 10]'),
((SELECT id FROM plants WHERE plant_key = 'corn_bloody_butcher'), 1, 6.00, NULL, 'pound', 1.3, '[9, 10]'),
((SELECT id FROM plants WHERE plant_key = 'popcorn_strawberry'), 1, 12.00, NULL, 'pound', 2.7, '[10, 11]');