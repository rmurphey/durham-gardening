-- Garden Calendar Activity System
-- Extends existing plant_varieties.db with activity and garden management

-- Garden/bed management
CREATE TABLE gardens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    climate_zone VARCHAR(4),
    region_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

CREATE TABLE garden_beds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garden_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    length_feet DECIMAL(4,1) NOT NULL,
    width_feet DECIMAL(4,1) NOT NULL,
    soil_type VARCHAR(50), -- 'clay', 'sandy', 'loam', etc.
    sun_exposure VARCHAR(20), -- 'full_sun', 'partial_shade', 'shade'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (garden_id) REFERENCES gardens(id)
);

-- Activity types and templates
CREATE TABLE activity_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_priority VARCHAR(10) DEFAULT 'medium',
    color_hex VARCHAR(7), -- for UI display
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Template activities for different climates/regions
CREATE TABLE activity_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NOT NULL,
    plant_id INTEGER,
    activity_type_id INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    action_template TEXT NOT NULL,
    timing_template TEXT,
    priority VARCHAR(10) DEFAULT 'medium',
    conditions TEXT, -- JSON for conditions like temperature, soil state
    variety_suggestions TEXT, -- JSON array of recommended varieties
    supplier_preferences TEXT, -- JSON array of preferred suppliers
    estimated_cost_min DECIMAL(6,2),
    estimated_cost_max DECIMAL(6,2),
    bed_size_requirements TEXT, -- JSON for minimum bed size, spacing
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (activity_type_id) REFERENCES activity_types(id)
);

-- User's actual garden plans and activities
CREATE TABLE garden_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garden_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    plant_id INTEGER NOT NULL,
    bed_id INTEGER,
    variety_name VARCHAR(100),
    planned_date DATE,
    planned_quantity INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (garden_id) REFERENCES gardens(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (bed_id) REFERENCES garden_beds(id),
    UNIQUE(garden_id, year, plant_id, bed_id) -- Prevent duplicate plantings
);

CREATE TABLE garden_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garden_id INTEGER NOT NULL,
    plan_id INTEGER, -- links to garden_plans if related to specific planting
    activity_type_id INTEGER NOT NULL,
    plant_id INTEGER, -- NULL for general activities like bed prep
    bed_id INTEGER, -- NULL for general garden activities
    scheduled_date DATE NOT NULL,
    action_text TEXT NOT NULL,
    timing_text TEXT,
    priority VARCHAR(10) DEFAULT 'medium',
    estimated_cost DECIMAL(6,2),
    completed_date DATE,
    actual_cost DECIMAL(6,2),
    success_rating INTEGER CHECK (success_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (garden_id) REFERENCES gardens(id),
    FOREIGN KEY (plan_id) REFERENCES garden_plans(id),
    FOREIGN KEY (activity_type_id) REFERENCES activity_types(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (bed_id) REFERENCES garden_beds(id)
);

-- Track varieties actually used and their performance
CREATE TABLE variety_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garden_id INTEGER NOT NULL,
    plant_id INTEGER NOT NULL,
    variety_name VARCHAR(100) NOT NULL,
    supplier VARCHAR(100),
    year INTEGER NOT NULL,
    germination_rate DECIMAL(3,2), -- 0.0 to 1.0
    harvest_satisfaction INTEGER CHECK (harvest_satisfaction BETWEEN 1 AND 5),
    disease_resistance INTEGER CHECK (disease_resistance BETWEEN 1 AND 5),
    heat_performance INTEGER CHECK (heat_performance BETWEEN 1 AND 5),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (garden_id) REFERENCES gardens(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);

-- Succession planting sequences
CREATE TABLE succession_sequences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    region_id INTEGER NOT NULL,
    interval_weeks INTEGER NOT NULL,
    start_month INTEGER NOT NULL,
    end_month INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

CREATE TABLE succession_sequence_plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sequence_id INTEGER NOT NULL,
    plant_id INTEGER NOT NULL,
    sequence_order INTEGER NOT NULL,
    FOREIGN KEY (sequence_id) REFERENCES succession_sequences(id),
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    UNIQUE(sequence_id, plant_id)
);

-- Indexes for performance
CREATE INDEX idx_garden_beds_garden ON garden_beds(garden_id);
CREATE INDEX idx_activity_templates_region_month ON activity_templates(region_id, month);
CREATE INDEX idx_garden_plans_garden_year ON garden_plans(garden_id, year);
CREATE INDEX idx_garden_activities_garden_date ON garden_activities(garden_id, scheduled_date);
CREATE INDEX idx_garden_activities_completed ON garden_activities(completed_date);
CREATE INDEX idx_variety_performance_garden_year ON variety_performance(garden_id, year);

-- Layout templates and standards for garden design
CREATE TABLE layout_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL, -- 'rectangular', 'keyhole', 'raised_beds', 'container', 'square_foot'
    typical_width DECIMAL(5,1),
    typical_height DECIMAL(5,1),
    bed_count INTEGER,
    template_config TEXT, -- JSON configuration for template
    suitable_for TEXT, -- JSON array of garden types/sizes
    difficulty_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bed_standards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bed_type VARCHAR(50) NOT NULL, -- 'raised', 'ground', 'container', 'keyhole'
    typical_width DECIMAL(4,1) NOT NULL,
    typical_length DECIMAL(4,1) NOT NULL,
    typical_height DECIMAL(3,1), -- for raised beds
    min_spacing DECIMAL(3,1) NOT NULL, -- minimum space between beds
    max_reach DECIMAL(3,1), -- maximum comfortable reach for maintenance
    soil_volume DECIMAL(6,2), -- cubic feet of soil needed
    cost_estimate_min DECIMAL(6,2),
    cost_estimate_max DECIMAL(6,2),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE layout_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    min_bed_width DECIMAL(4,1),
    min_bed_length DECIMAL(4,1),
    preferred_bed_type VARCHAR(50),
    spacing_between_plants DECIMAL(3,1),
    spacing_between_rows DECIMAL(3,1),
    companion_distance DECIMAL(3,1), -- ideal distance from companion plants
    antagonist_distance DECIMAL(3,1), -- minimum distance from antagonistic plants
    sun_requirements VARCHAR(50), -- affects bed placement
    drainage_needs VARCHAR(50), -- affects bed type/location
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);

-- Indexes for layout queries
CREATE INDEX idx_layout_templates_type ON layout_templates(template_type);
CREATE INDEX idx_bed_standards_type ON bed_standards(bed_type);
CREATE INDEX idx_layout_recommendations_plant ON layout_recommendations(plant_id);

-- Views for easy querying
CREATE VIEW garden_calendar_view AS
SELECT 
    ga.id,
    g.name as garden_name,
    ga.scheduled_date,
    strftime('%m', ga.scheduled_date) as month,
    at.name as activity_type,
    at.type_key,
    pd.common_name as plant_name,
    pd.plant_key,
    gb.name as bed_name,
    ga.action_text,
    ga.timing_text,
    ga.priority,
    ga.estimated_cost,
    ga.completed_date,
    ga.success_rating
FROM garden_activities ga
JOIN gardens g ON ga.garden_id = g.id
JOIN activity_types at ON ga.activity_type_id = at.id
LEFT JOIN plant_details pd ON ga.plant_id = pd.id AND pd.language = 'en'
LEFT JOIN garden_beds gb ON ga.bed_id = gb.id;

CREATE VIEW monthly_activities AS
SELECT 
    strftime('%m', scheduled_date) as month,
    COUNT(*) as total_activities,
    COUNT(completed_date) as completed_activities,
    AVG(success_rating) as avg_success_rating,
    SUM(estimated_cost) as estimated_monthly_cost,
    SUM(actual_cost) as actual_monthly_cost
FROM garden_activities
WHERE scheduled_date >= date('now', 'start of year')
GROUP BY strftime('%m', scheduled_date);

CREATE VIEW bed_utilization AS
SELECT 
    gb.name as bed_name,
    gb.length_feet * gb.width_feet as area_sqft,
    COUNT(gp.id) as planned_crops,
    GROUP_CONCAT(pd.common_name, ', ') as crops
FROM garden_beds gb
LEFT JOIN garden_plans gp ON gb.id = gp.bed_id 
    AND gp.year = strftime('%Y', 'now')
LEFT JOIN plant_details pd ON gp.plant_id = pd.id AND pd.language = 'en'
GROUP BY gb.id, gb.name;