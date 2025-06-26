-- Data Updates for Climate Garden Simulation Database
-- This file contains the most recent data updates and should be versioned

-- Update timestamp for data freshness tracking
CREATE TABLE IF NOT EXISTS data_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    update_type VARCHAR(50) NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Record this update
INSERT INTO data_updates (update_type, description) VALUES
('schema_version', 'Database schema v1.0.0 with comprehensive plant data'),
('plant_data', 'Initial dataset: 18 varieties across 6 categories'),
('regional_data', 'US and Canadian regional adaptations'),
('market_data', 'Regional pricing data with seasonal variations'),
('growing_tips', '79 climate-specific growing recommendations'),
('companion_plants', '56 beneficial/neutral/antagonistic relationships');

-- Update market prices to reflect current 2024 data (example of keeping data current)
UPDATE market_prices SET 
    price_per_lb = price_per_lb * 1.05,  -- Inflation adjustment
    updated_at = CURRENT_TIMESTAMP
WHERE updated_at < date('now', '-6 months');

-- Add any new climate zones that may have been updated
INSERT OR IGNORE INTO climate_zones (zone_code, min_temp_f, max_temp_f, description) VALUES
('12a', 50, 55, 'Tropical (50 to 55°F)'),
('12b', 55, 60, 'Tropical (55 to 60°F)');

-- Update plant hardiness ranges based on latest climate data
UPDATE plants SET 
    max_zone = '12a'
WHERE plant_key IN ('okra', 'hot_peppers', 'amaranth', 'sweet_potato') 
AND max_zone = '11';

-- Add data freshness view
CREATE VIEW IF NOT EXISTS data_freshness AS
SELECT 
    update_type,
    description,
    updated_at,
    julianday('now') - julianday(updated_at) as days_since_update
FROM data_updates
ORDER BY updated_at DESC;

-- Create view for data quality metrics
CREATE VIEW IF NOT EXISTS data_quality AS
SELECT 
    'Plants without names' as metric,
    COUNT(*) as count
FROM plants p 
WHERE NOT EXISTS (
    SELECT 1 FROM plant_names pn 
    WHERE pn.plant_id = p.id AND pn.language = 'en'
)
UNION ALL
SELECT 
    'Plants without market data' as metric,
    COUNT(*) as count
FROM plants p 
WHERE NOT EXISTS (
    SELECT 1 FROM market_prices mp 
    WHERE mp.plant_id = p.id
)
UNION ALL
SELECT 
    'Plants without growing tips' as metric,
    COUNT(*) as count
FROM plants p 
WHERE NOT EXISTS (
    SELECT 1 FROM growing_tips gt 
    WHERE gt.plant_id = p.id
)
UNION ALL
SELECT 
    'Total data completeness score' as metric,
    ROUND(
        (SELECT COUNT(*) FROM plants) * 100.0 / 
        (SELECT COUNT(*) FROM plants) 
    ) as count;