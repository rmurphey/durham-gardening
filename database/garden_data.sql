-- Garden Setup and Activity Templates  
-- Populates database with Zone 7b temperate garden data

-- Insert activity types
INSERT INTO activity_types (type_key, name, description, default_priority, color_hex) VALUES
('shopping', 'Shopping', 'Seed and supply purchases', 'medium', '#f39c12'),
('direct-sow', 'Direct Sowing', 'Plant seeds directly in garden', 'medium', '#27ae60'),
('transplant', 'Transplanting', 'Move seedlings to garden', 'high', '#2ecc71'),
('succession', 'Succession Planting', 'Sequential plantings for continuous harvest', 'medium', '#3498db'),
('care', 'Plant Care', 'Watering, pruning, support', 'medium', '#16a085'),
('harvest', 'Harvest', 'Picking crops', 'high', '#e74c3c'),
('rotation', 'Bed Rotation', 'Seasonal bed transitions', 'high', '#9b59b6'),
('infrastructure', 'Infrastructure', 'Bed prep, irrigation, structures', 'high', '#34495e'),
('planning', 'Planning', 'Garden planning and preparation', 'low', '#95a5a6'),
('cleanup', 'Cleanup', 'Remove spent plants, prepare beds', 'medium', '#e67e22');

-- Create Durham garden (example setup)
INSERT INTO gardens (name, location, climate_zone, region_id) VALUES
('Durham Garden', 'Durham, NC', '7b', 1); -- US region ID

-- Durham garden beds
INSERT INTO garden_beds (garden_id, name, length_feet, width_feet, soil_type, sun_exposure, notes) VALUES
(1, '3×15 Bed', 15.0, 3.0, 'clay_amended', 'full_sun', 'Long bed for succession crops'),
(1, '4×8 Bed', 8.0, 4.0, 'clay_amended', 'full_sun', 'Main heat crop bed'),
(1, '4×5 Bed', 5.0, 4.0, 'clay_amended', 'full_sun', 'Smaller bed for rotation'),
(1, 'Containers', 2.0, 2.0, 'potting_mix', 'mobile', 'Individual pots and planters');

-- Durham-specific activity templates for hot peppers
INSERT INTO activity_templates (
    region_id, plant_id, activity_type_id, month, 
    action_template, timing_template, priority,
    variety_suggestions, supplier_preferences, 
    estimated_cost_min, estimated_cost_max,
    bed_size_requirements
) VALUES
(1, 
 (SELECT id FROM plants WHERE plant_key = 'hot_peppers'), 
 (SELECT id FROM activity_types WHERE type_key = 'shopping'), 
 2,
 'Order pepper seeds: {varieties} from {supplier}',
 'Start indoors March 1st, need 8-10 weeks before transplant',
 'medium',
 '["Habanero", "Jalapeño", "Thai Chili", "Carolina Reaper"]',
 '["True Leaf Market", "Southern Exposure", "Baker Creek"]',
 12.00, 18.00,
 '{"min_spacing_inches": 18, "plants_per_sqft": 0.25}'
),

-- Sweet potato activity template
(1, 
 (SELECT id FROM plants WHERE plant_key = 'sweet_potato'), 
 (SELECT id FROM activity_types WHERE type_key = 'shopping'), 
 4,
 'Order {quantity} {variety} sweet potato slips from {supplier}',
 'Plant in {bed} after soil reaches 65°F (mid-May)',
 'medium',
 '["Beauregard", "Georgia Jet", "Centennial"]',
 '["Local nursery", "Southern Exposure", "Johnny Seeds"]',
 18.00, 24.00,
 '{"min_spacing_inches": 12, "plants_per_sqft": 1.0, "recommended_bed": "4×8 Bed"}'
),

-- Kale spring shopping
(1, 
 (SELECT id FROM plants WHERE plant_key = 'kale'), 
 (SELECT id FROM activity_types WHERE type_key = 'shopping'), 
 2,
 'Buy kale seeds: {varieties} from {supplier}',
 'Direct sow in {bed} mid-February, 18-inch spacing',
 'medium',
 '["Red Russian", "Winterbor", "Lacinato"]',
 '["True Leaf Market", "Southern Exposure"]',
 8.00, 12.00,
 '{"min_spacing_inches": 18, "plants_per_sqft": 0.25, "recommended_bed": "3×15 Bed"}'
),

-- Kale fall shopping
(1, 
 (SELECT id FROM plants WHERE plant_key = 'kale'), 
 (SELECT id FROM activity_types WHERE type_key = 'shopping'), 
 7,
 'Buy kale seeds for fall planting: {varieties}',
 'Direct sow in {bed} in August, harvest through winter',
 'medium',
 '["Red Russian", "Winterbor"]',
 '["True Leaf Market", "Southern Exposure"]',
 8.00, 12.00,
 '{"min_spacing_inches": 18, "plants_per_sqft": 0.25, "recommended_bed": "4×5 Bed"}'
),

-- Pepper care activities
(1, 
 (SELECT id FROM plants WHERE plant_key = 'hot_peppers'), 
 (SELECT id FROM activity_types WHERE type_key = 'care'), 
 7,
 'Support heavy pepper plants, consistent watering in Durham heat',
 'Durham summer care - critical for fruit development',
 'medium',
 NULL, NULL, 5.00, 15.00,
 '{"task_frequency": "weekly", "water_requirements": "deep_twice_weekly"}'
),

-- Pepper harvest
(1, 
 (SELECT id FROM plants WHERE plant_key = 'hot_peppers'), 
 (SELECT id FROM activity_types WHERE type_key = 'harvest'), 
 8,
 'Harvest peppers regularly to encourage continued production',
 'Peak harvest season - check every 2-3 days',
 'high',
 NULL, NULL, 0.00, 0.00,
 '{"harvest_frequency": "every_2_3_days", "maturity_indicators": "color_change_firm_texture"}'
);

-- Durham succession planting sequences
INSERT INTO succession_sequences (name, description, region_id, interval_weeks, start_month, end_month) VALUES
('Durham Fall Greens', 'Fall greens succession for continuous harvest', 1, 2, 8, 10),
('Spring Lettuce Series', 'Spring lettuce for continuous salads', 1, 2, 2, 4);

-- Link plants to succession sequences
INSERT INTO succession_sequence_plants (sequence_id, plant_id, sequence_order) VALUES
(1, (SELECT id FROM plants WHERE plant_key = 'kale'), 1),
(1, (SELECT id FROM plants WHERE plant_key = 'lettuce'), 2),
(1, (SELECT id FROM plants WHERE plant_key = 'spinach'), 3),
(2, (SELECT id FROM plants WHERE plant_key = 'lettuce'), 1);

-- Bed rotation templates (rotation activities)
INSERT INTO activity_templates (
    region_id, plant_id, activity_type_id, month, 
    action_template, timing_template, priority,
    bed_size_requirements
) VALUES
-- March bed prep
(1, NULL, (SELECT id FROM activity_types WHERE type_key = 'rotation'), 3,
 'Clear winter debris from {bed}, add 2-3 inches compost',
 'Prepare {bed} for spring plantings (lettuce, kale)',
 'high',
 '{"target_bed": "3×15 Bed", "compost_cubic_yards": 1.5}'
),

-- April summer prep
(1, NULL, (SELECT id FROM activity_types WHERE type_key = 'rotation'), 4,
 'Prepare {bed} for heat crops - add compost, check drainage',
 'Get {bed} ready for peppers, tomatoes in May',
 'high',
 '{"target_bed": "4×8 Bed", "drainage_check": true}'
),

-- July mid-summer transition
(1, NULL, (SELECT id FROM activity_types WHERE type_key = 'rotation'), 7,
 'Clear bolted lettuce from {bed}, plant heat-tolerant amaranth',
 'Replace failed cool crops with heat specialists',
 'high',
 '{"source_bed": "3×15 Bed", "succession_crop": "amaranth"}'
),

-- August fall prep
(1, NULL, (SELECT id FROM activity_types WHERE type_key = 'rotation'), 8,
 'Clear spent spring crops from {bed}, add compost for fall kale',
 'Rotate {bed} from spring crops to fall greens',
 'high',
 '{"target_bed": "4×5 Bed", "preparation_for": "fall_greens"}'
),

-- October winter transition
(1, NULL, (SELECT id FROM activity_types WHERE type_key = 'rotation'), 10,
 'Harvest final peppers from {bed}, plant garlic cloves',
 'Transition {bed} from summer heat crops to winter garlic',
 'high',
 '{"source_bed": "4×8 Bed", "winter_crop": "garlic"}'
);

-- Durham activity templates loaded successfully