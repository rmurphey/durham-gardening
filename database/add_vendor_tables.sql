-- Add vendor and seed ordering tables to plant database
-- Extends the existing schema with specific seed ordering information

-- Seed and garden supply vendors
CREATE TABLE vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    website_url VARCHAR(255),
    shipping_threshold DECIMAL(6,2), -- minimum for free shipping
    shipping_cost DECIMAL(6,2), -- standard shipping cost
    specialty TEXT, -- 'organic', 'heirloom', 'regional', 'bulk', etc.
    region_focus VARCHAR(100), -- geographic focus area
    reliability_rating INTEGER CHECK (reliability_rating BETWEEN 1 AND 5),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Specific seed products available from vendors
CREATE TABLE seed_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    sku VARCHAR(100), -- vendor's product code
    variety_name VARCHAR(200) NOT NULL,
    packet_size VARCHAR(50), -- '100 seeds', '1000 seeds', '1 oz', etc.
    seed_count INTEGER, -- approximate number of seeds if known
    price DECIMAL(6,2) NOT NULL,
    product_url VARCHAR(500),
    is_organic BOOLEAN DEFAULT FALSE,
    is_heirloom BOOLEAN DEFAULT FALSE,
    is_hybrid BOOLEAN DEFAULT FALSE,
    heat_tolerance_rating INTEGER CHECK (heat_tolerance_rating BETWEEN 1 AND 5),
    days_to_maturity INTEGER,
    packet_plants_sqft INTEGER, -- how many square feet one packet can plant
    is_available BOOLEAN DEFAULT TRUE,
    last_price_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    UNIQUE(plant_id, vendor_id, sku)
);

-- Regional recommendations linking plants to preferred vendors
CREATE TABLE regional_vendor_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    region_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    seed_product_id INTEGER, -- specific recommended product
    preference_rank INTEGER DEFAULT 1, -- 1=primary, 2=secondary, etc.
    order_timing VARCHAR(100), -- 'December-January', 'Spring prep', etc.
    planting_instructions TEXT,
    succession_plantings INTEGER DEFAULT 1,
    packets_needed_per_100sqft INTEGER DEFAULT 1,
    special_notes TEXT, -- region-specific growing notes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plant_id) REFERENCES plants(id),
    FOREIGN KEY (region_id) REFERENCES regions(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (seed_product_id) REFERENCES seed_products(id),
    UNIQUE(plant_id, region_id, vendor_id, preference_rank)
);

-- Purchase timing windows for strategic ordering
CREATE TABLE purchase_windows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    window_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    timing VARCHAR(100), -- 'December-February', 'Spring prep', etc.
    description TEXT,
    start_month INTEGER CHECK (start_month BETWEEN 1 AND 12),
    end_month INTEGER CHECK (end_month BETWEEN 1 AND 12),
    priority INTEGER DEFAULT 1, -- 1=critical, 2=recommended, 3=optional
    applies_to_categories TEXT, -- JSON array of category_keys
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Link products to optimal purchase windows
CREATE TABLE product_purchase_windows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seed_product_id INTEGER NOT NULL,
    purchase_window_id INTEGER NOT NULL,
    is_primary_window BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seed_product_id) REFERENCES seed_products(id),
    FOREIGN KEY (purchase_window_id) REFERENCES purchase_windows(id),
    UNIQUE(seed_product_id, purchase_window_id)
);

-- Indexes for performance
CREATE INDEX idx_seed_products_plant ON seed_products(plant_id);
CREATE INDEX idx_seed_products_vendor ON seed_products(vendor_id);
CREATE INDEX idx_seed_products_available ON seed_products(is_available);
CREATE INDEX idx_regional_vendor_recs_region ON regional_vendor_recommendations(region_id);
CREATE INDEX idx_regional_vendor_recs_plant ON regional_vendor_recommendations(plant_id);
CREATE INDEX idx_purchase_windows_timing ON purchase_windows(start_month, end_month);

-- Views for common seed ordering queries
CREATE VIEW seed_ordering_details AS
SELECT 
    p.plant_key,
    pn.common_name,
    pc.category_key,
    v.name as vendor_name,
    v.vendor_key,
    v.website_url,
    v.shipping_threshold,
    sp.sku,
    sp.variety_name,
    sp.packet_size,
    sp.seed_count,
    sp.price,
    sp.product_url,
    sp.is_organic,
    sp.is_heirloom,
    sp.heat_tolerance_rating,
    sp.packet_plants_sqft,
    rvr.order_timing,
    rvr.planting_instructions,
    rvr.succession_plantings,
    rvr.packets_needed_per_100sqft,
    rvr.special_notes,
    r.code as region_code,
    r.name as region_name
FROM plants p
JOIN plant_categories pc ON p.category_id = pc.id
JOIN plant_names pn ON p.id = pn.plant_id AND pn.language = 'en'
JOIN regional_vendor_recommendations rvr ON p.id = rvr.plant_id
JOIN regions r ON rvr.region_id = r.id
JOIN vendors v ON rvr.vendor_id = v.id
LEFT JOIN seed_products sp ON rvr.seed_product_id = sp.id
WHERE v.is_active = TRUE AND (sp.is_available = TRUE OR sp.id IS NULL);

-- View for purchase window planning
CREATE VIEW purchase_window_planning AS
SELECT 
    pw.window_key,
    pw.name as window_name,
    pw.timing,
    pw.description,
    pw.start_month,
    pw.end_month,
    pw.priority,
    p.plant_key,
    pn.common_name,
    sp.variety_name,
    sp.price,
    v.name as vendor_name,
    rvr.order_timing,
    rvr.packets_needed_per_100sqft
FROM purchase_windows pw
JOIN product_purchase_windows ppw ON pw.id = ppw.purchase_window_id
JOIN seed_products sp ON ppw.seed_product_id = sp.id
JOIN plants p ON sp.plant_id = p.id
JOIN plant_names pn ON p.id = pn.plant_id AND pn.language = 'en'
JOIN vendors v ON sp.vendor_id = v.id
JOIN regional_vendor_recommendations rvr ON p.id = rvr.plant_id AND v.id = rvr.vendor_id
WHERE v.is_active = TRUE AND sp.is_available = TRUE;