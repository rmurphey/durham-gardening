-- Climate Garden Simulation Plant Database
-- SQLite schema for plant varieties across US and CA regions

CREATE TABLE regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(2) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    language VARCHAR(2) NOT NULL DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE climate_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_code VARCHAR(4) NOT NULL UNIQUE,
    min_temp_f INTEGER NOT NULL,
    max_temp_f INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plant_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_key VARCHAR(100) NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    scientific_name VARCHAR(200),
    min_zone VARCHAR(4) NOT NULL,
    max_zone VARCHAR(4) NOT NULL,
    min_temp_f INTEGER NOT NULL,
    max_temp_f INTEGER NOT NULL,
    optimal_temp_min_f INTEGER NOT NULL,
    optimal_temp_max_f INTEGER NOT NULL,
    harvest_start_months REAL NOT NULL,
    harvest_duration_months REAL NOT NULL,
    transplant_weeks INTEGER DEFAULT 0,
    drought_tolerance VARCHAR(20) CHECK (drought_tolerance IN ('poor', 'fair', 'good', 'excellent')),
    heat_tolerance VARCHAR(20) CHECK (heat_tolerance IN ('poor', 'fair', 'good', 'excellent')),
    humidity_tolerance VARCHAR(20) CHECK (humidity_tolerance IN ('poor', 'fair', 'good', 'excellent')),
    is_perennial BOOLEAN DEFAULT FALSE,
    spacing_inches INTEGER,
    mature_height_inches INTEGER,
    days_to_maturity INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES plant_categories(id),
    FOREIGN KEY (min_zone) REFERENCES climate_zones(zone_code),
    FOREIGN KEY (max_zone) REFERENCES climate_zones(zone_code)
);

CREATE TABLE plant_names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    language VARCHAR(2) NOT NULL DEFAULT 'en',
    common_name VARCHAR(200) NOT NULL,
    alternate_names TEXT, -- JSON array of alternate names
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    UNIQUE(plant_id, language)
);

CREATE TABLE regional_planting_months (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    region_id INTEGER NOT NULL,
    climate_type VARCHAR(20) NOT NULL CHECK (climate_type IN ('temperate', 'subtropical', 'tropical')),
    planting_months TEXT NOT NULL, -- JSON array of month numbers
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (region_id) REFERENCES regions(id),
    UNIQUE(plant_id, region_id, climate_type)
);

CREATE TABLE market_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    region_id INTEGER NOT NULL,
    price_per_lb DECIMAL(8,2),
    price_per_unit DECIMAL(8,2),
    unit_type VARCHAR(50), -- 'bunch', 'head', 'pound', 'ounce'
    price_premium DECIMAL(3,2) DEFAULT 1.0, -- multiplier for specialty varieties
    seasonal_peak_months TEXT, -- JSON array of peak pricing months
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (region_id) REFERENCES regions(id),
    UNIQUE(plant_id, region_id)
);

CREATE TABLE growing_tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    region_id INTEGER,
    tip_category VARCHAR(50), -- 'planting', 'care', 'harvest', 'pest_management', 'climate_adaptation'
    tip_text TEXT NOT NULL,
    priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

CREATE TABLE companion_plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    companion_plant_id INTEGER NOT NULL,
    relationship_type VARCHAR(20) CHECK (relationship_type IN ('beneficial', 'neutral', 'antagonistic')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (companion_plant_id) REFERENCES plants(id),
    UNIQUE(plant_id, companion_plant_id)
);

-- Indexes for performance
CREATE INDEX idx_plants_category ON plants(category_id);
CREATE INDEX idx_plants_zones ON plants(min_zone, max_zone);
CREATE INDEX idx_plant_names_language ON plant_names(language);
CREATE INDEX idx_regional_planting_region ON regional_planting_months(region_id);
CREATE INDEX idx_market_prices_region ON market_prices(region_id);
CREATE INDEX idx_growing_tips_plant_region ON growing_tips(plant_id, region_id);

-- Views for common queries
CREATE VIEW plant_details AS
SELECT 
    p.id,
    p.plant_key,
    pc.category_key,
    pc.name as category_name,
    p.scientific_name,
    pn.common_name,
    pn.language,
    p.min_zone || '-' || p.max_zone as hardiness_zones,
    p.min_temp_f,
    p.max_temp_f,
    p.optimal_temp_min_f,
    p.optimal_temp_max_f,
    p.harvest_start_months,
    p.harvest_duration_months,
    p.transplant_weeks,
    p.drought_tolerance,
    p.heat_tolerance,
    p.humidity_tolerance,
    p.is_perennial,
    p.spacing_inches,
    p.mature_height_inches,
    p.days_to_maturity
FROM plants p
JOIN plant_categories pc ON p.category_id = pc.id
JOIN plant_names pn ON p.id = pn.plant_id;

CREATE VIEW regional_planting_calendar AS
SELECT 
    pd.plant_key,
    pd.common_name,
    pd.category_name,
    r.name as region_name,
    r.code as region_code,
    rpm.climate_type,
    rpm.planting_months,
    pd.harvest_start_months,
    pd.harvest_duration_months
FROM plant_details pd
JOIN regional_planting_months rpm ON pd.id = rpm.plant_id
JOIN regions r ON rpm.region_id = r.id
WHERE pd.language = 'en';

CREATE VIEW plant_market_data AS
SELECT 
    pd.plant_key,
    pd.common_name,
    pd.category_name,
    r.name as region_name,
    r.code as region_code,
    r.currency,
    mp.price_per_lb,
    mp.price_per_unit,
    mp.unit_type,
    mp.price_premium,
    mp.seasonal_peak_months
FROM plant_details pd
JOIN market_prices mp ON pd.id = mp.plant_id
JOIN regions r ON mp.region_id = r.id
WHERE pd.language = 'en';