-- Forecasting Schema Extensions for Durham Garden Planner
-- Adds comprehensive forecasting capabilities to the existing database

-- Weather forecasting and historical data
CREATE TABLE weather_forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NOT NULL,
    forecast_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Temperature forecasts (Fahrenheit)
    temp_high_forecast REAL,
    temp_low_forecast REAL,
    temp_avg_forecast REAL,
    soil_temp_forecast REAL,
    
    -- Precipitation and humidity
    precipitation_forecast REAL, -- inches
    precipitation_probability INTEGER, -- 0-100%
    humidity_forecast INTEGER, -- 0-100%
    
    -- Risk factors
    frost_probability INTEGER, -- 0-100%
    heat_stress_probability INTEGER, -- 0-100%
    drought_risk_level INTEGER, -- 1-5 scale
    
    -- Confidence intervals
    confidence_level REAL DEFAULT 0.7, -- 70% confidence
    temp_uncertainty REAL, -- +/- degrees
    precip_uncertainty REAL, -- +/- inches
    
    -- Forecast range type
    forecast_type VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly, seasonal
    forecast_horizon INTEGER, -- days ahead
    
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Historical weather data for model training
CREATE TABLE weather_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NOT NULL,
    observation_date DATE NOT NULL,
    
    -- Actual weather conditions
    temp_high REAL,
    temp_low REAL,
    temp_avg REAL,
    soil_temp REAL,
    precipitation REAL,
    humidity INTEGER,
    
    -- Growing degree days
    gdd_base_50 REAL, -- Base 50°F
    gdd_base_32 REAL, -- Base 32°F
    
    -- Extreme events
    frost_occurred BOOLEAN DEFAULT FALSE,
    heat_wave_day BOOLEAN DEFAULT FALSE,
    severe_weather BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Plant growth and development models
CREATE TABLE plant_growth_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    region_id INTEGER NOT NULL,
    
    -- Development stages (days from planting)
    germination_days_min INTEGER,
    germination_days_max INTEGER,
    seedling_days INTEGER,
    vegetative_days INTEGER,
    flowering_days INTEGER,
    harvest_ready_days INTEGER,
    
    -- Temperature requirements
    min_germination_temp REAL,
    optimal_growing_temp_min REAL,
    optimal_growing_temp_max REAL,
    max_tolerance_temp REAL,
    frost_tolerance INTEGER, -- 1-5 scale (1=no tolerance, 5=very hardy)
    
    -- Environmental factors
    sunlight_hours_required INTEGER, -- hours per day
    water_requirement INTEGER, -- 1-5 scale (1=drought tolerant, 5=high water needs)
    soil_ph_min REAL,
    soil_ph_max REAL,
    
    -- Yield predictions
    expected_yield_per_sqft REAL,
    yield_quality_factors TEXT, -- JSON: weather impact on quality
    
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Growth stage forecasts for specific plantings
CREATE TABLE growth_forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    garden_bed_id INTEGER,
    planting_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Predicted development timeline
    forecast_germination_date DATE,
    forecast_seedling_date DATE,
    forecast_flowering_date DATE,
    forecast_harvest_start DATE,
    forecast_harvest_end DATE,
    
    -- Yield predictions
    predicted_yield REAL,
    predicted_quality INTEGER, -- 1-5 scale
    
    -- Risk assessments
    success_probability REAL, -- 0.0-1.0
    frost_risk_level INTEGER, -- 1-5 scale
    heat_stress_risk INTEGER, -- 1-5 scale
    disease_pressure_risk INTEGER, -- 1-5 scale
    
    -- Confidence intervals
    confidence_level REAL DEFAULT 0.7,
    harvest_date_uncertainty INTEGER, -- +/- days
    yield_uncertainty_percent REAL, -- +/- percentage
    
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (garden_bed_id) REFERENCES garden_beds(id)
);

-- Economic forecasting data
CREATE TABLE economic_forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NOT NULL,
    forecast_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Seed and supply costs
    seed_cost_index REAL DEFAULT 1.0, -- 1.0 = current baseline
    amendment_cost_index REAL DEFAULT 1.0,
    tool_cost_index REAL DEFAULT 1.0,
    
    -- Market values for common crops
    leafy_greens_value_per_lb REAL,
    herbs_value_per_oz REAL,
    tomatoes_value_per_lb REAL,
    peppers_value_per_lb REAL,
    root_vegetables_value_per_lb REAL,
    
    -- Economic indicators
    inflation_adjustment REAL DEFAULT 1.0,
    seasonal_multiplier REAL DEFAULT 1.0, -- price seasonality
    supply_chain_risk INTEGER, -- 1-5 scale
    
    -- Confidence intervals
    price_volatility REAL, -- standard deviation
    cost_uncertainty REAL, -- +/- percentage
    
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Risk assessment factors
CREATE TABLE risk_factors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NOT NULL,
    plant_id INTEGER,
    risk_type VARCHAR(50) NOT NULL, -- weather, pest, disease, economic
    risk_name VARCHAR(100) NOT NULL,
    
    -- Risk characteristics
    seasonal_pattern TEXT, -- JSON: monthly probability patterns
    weather_triggers TEXT, -- JSON: conditions that increase risk
    impact_severity INTEGER, -- 1-5 scale (1=minor, 5=catastrophic)
    
    -- Historical occurrence data
    historical_frequency REAL, -- events per year
    last_occurrence_date DATE,
    trend_direction INTEGER, -- -1=decreasing, 0=stable, 1=increasing
    
    -- Mitigation strategies
    prevention_strategies TEXT, -- JSON array of prevention methods
    treatment_options TEXT, -- JSON array of treatment options
    
    FOREIGN KEY (region_id) REFERENCES regions(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);

-- Forecast accuracy tracking
CREATE TABLE forecast_accuracy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    forecast_type VARCHAR(50) NOT NULL, -- weather, growth, economic, risk
    forecast_id INTEGER NOT NULL,
    actual_date DATE NOT NULL,
    
    -- Accuracy metrics
    predicted_value REAL,
    actual_value REAL,
    absolute_error REAL,
    percentage_error REAL,
    
    -- Classification accuracy (for categorical predictions)
    predicted_category VARCHAR(50),
    actual_category VARCHAR(50),
    prediction_correct BOOLEAN,
    
    -- Model improvement data
    model_version VARCHAR(20),
    confidence_level_used REAL,
    notes TEXT
);

-- Adaptive calendar recommendations
CREATE TABLE adaptive_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garden_id INTEGER NOT NULL,
    recommendation_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Recommendation details
    recommendation_type VARCHAR(50) NOT NULL, -- planting, harvesting, care, risk_mitigation
    priority INTEGER, -- 1-5 scale (1=optional, 5=urgent)
    plant_id INTEGER,
    garden_bed_id INTEGER,
    
    -- Action details
    recommended_action TEXT NOT NULL,
    timing_window_start DATE,
    timing_window_end DATE,
    weather_dependency TEXT, -- JSON: weather conditions required
    
    -- Supporting data
    forecast_basis TEXT, -- JSON: which forecasts triggered this recommendation
    risk_mitigation_for INTEGER, -- links to risk_factors.id
    expected_benefit TEXT,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending', -- pending, acknowledged, completed, expired
    user_feedback TEXT,
    actual_outcome TEXT,
    
    FOREIGN KEY (garden_id) REFERENCES gardens(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (garden_bed_id) REFERENCES garden_beds(id)
);

-- Indexes for performance
CREATE INDEX idx_weather_forecasts_date ON weather_forecasts(forecast_date, region_id);
CREATE INDEX idx_weather_history_date ON weather_history(observation_date, region_id);
CREATE INDEX idx_growth_forecasts_plant_date ON growth_forecasts(plant_id, planting_date);
CREATE INDEX idx_economic_forecasts_date ON economic_forecasts(forecast_date, region_id);
CREATE INDEX idx_risk_factors_region_plant ON risk_factors(region_id, plant_id);
CREATE INDEX idx_adaptive_recommendations_date ON adaptive_recommendations(recommendation_date, garden_id);

-- Views for common forecast queries
CREATE VIEW current_weather_outlook AS
SELECT 
    wf.*,
    r.region_name,
    DATE(wf.forecast_date) as forecast_day,
    CASE 
        WHEN wf.frost_probability > 50 THEN 'HIGH_FROST_RISK'
        WHEN wf.heat_stress_probability > 70 THEN 'HIGH_HEAT_RISK'
        WHEN wf.drought_risk_level >= 4 THEN 'DROUGHT_CONCERN'
        ELSE 'NORMAL'
    END as risk_alert
FROM weather_forecasts wf
JOIN regions r ON wf.region_id = r.id
WHERE wf.forecast_date >= DATE('now')
ORDER BY wf.forecast_date;

CREATE VIEW active_growth_forecasts AS
SELECT 
    gf.*,
    p.plant_name,
    p.plant_key,
    gb.name as bed_name,
    CASE 
        WHEN DATE('now') < gf.forecast_germination_date THEN 'AWAITING_GERMINATION'
        WHEN DATE('now') < gf.forecast_seedling_date THEN 'GERMINATING'
        WHEN DATE('now') < gf.forecast_flowering_date THEN 'VEGETATIVE'
        WHEN DATE('now') < gf.forecast_harvest_start THEN 'FLOWERING'
        WHEN DATE('now') <= gf.forecast_harvest_end THEN 'HARVEST_READY'
        ELSE 'SEASON_COMPLETE'
    END as current_stage
FROM growth_forecasts gf
JOIN plants p ON gf.plant_id = p.id
LEFT JOIN garden_beds gb ON gf.garden_bed_id = gb.id
WHERE gf.forecast_harvest_end >= DATE('now', '-30 days')
ORDER BY gf.forecast_harvest_start;

CREATE VIEW urgent_recommendations AS
SELECT 
    ar.*,
    p.plant_name,
    gb.name as bed_name,
    CASE 
        WHEN ar.timing_window_end < DATE('now', '+3 days') THEN 'URGENT'
        WHEN ar.timing_window_end < DATE('now', '+7 days') THEN 'SOON'
        ELSE 'PLANNED'
    END as urgency_level
FROM adaptive_recommendations ar
LEFT JOIN plants p ON ar.plant_id = p.id
LEFT JOIN garden_beds gb ON ar.garden_bed_id = gb.id
WHERE ar.status = 'pending' 
  AND ar.timing_window_end >= DATE('now')
ORDER BY ar.priority DESC, ar.timing_window_start;