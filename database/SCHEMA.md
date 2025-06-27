# Garden Planning Database Schema

Comprehensive SQLite database for plant varieties, regional recommendations, and vendor integration. Supports location-aware garden planning across continental US.

## Overview

**Current Scale:** 22 plant varieties, 79 growing tips, 56 companion relationships  
**Coverage:** 3 categories (heat-tolerant, cool-season, herbs)  
**Regional Support:** Continental US hardiness zones with vendor recommendations  

## Core Entity Structure

```
regions ──┐
          ├── plants ──┐
categories ┘           ├── growing_tips
                       ├── companion_plants  
                       ├── plant_names
                       ├── plant_market_data
                       ├── variety_performance
                       └── regional_vendor_recommendations ──┐
                                                              ├── seed_products
vendors ──────────────────────────────────────────────────────┘
climate_zones
purchase_windows
```

## Table Definitions

### Core Plant Data

#### `plants` - Central plant registry
Primary entity containing botanical and growing information.

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | INTEGER | Primary key | AUTO_INCREMENT |
| plant_key | VARCHAR(100) | Unique identifier (e.g., 'okra', 'kale') | UNIQUE, NOT NULL |
| category_id | INTEGER | Plant category reference | FK to plant_categories |
| scientific_name | VARCHAR(200) | Botanical name | Optional |
| min_zone | VARCHAR(4) | Minimum hardiness zone | FK to climate_zones |
| max_zone | VARCHAR(4) | Maximum hardiness zone | FK to climate_zones |
| min_temp_f | INTEGER | Cold tolerance (°F) | NOT NULL |
| max_temp_f | INTEGER | Heat tolerance (°F) | NOT NULL |
| optimal_temp_min_f | INTEGER | Optimal range minimum (°F) | NOT NULL |
| optimal_temp_max_f | INTEGER | Optimal range maximum (°F) | NOT NULL |
| harvest_start_months | REAL | Months from planting to harvest | NOT NULL |
| harvest_duration_months | REAL | Harvest window duration | NOT NULL |
| transplant_weeks | INTEGER | Weeks for indoor seed starting | DEFAULT 0 |
| drought_tolerance | VARCHAR(20) | Water needs rating | CHECK: poor/fair/good/excellent |
| heat_tolerance | VARCHAR(20) | Heat stress resistance | CHECK: poor/fair/good/excellent |
| humidity_tolerance | VARCHAR(20) | Humidity adaptation | CHECK: poor/fair/good/excellent |
| is_perennial | BOOLEAN | Perennial vs annual | DEFAULT FALSE |
| spacing_inches | INTEGER | Plant spacing requirement | Optional |
| mature_height_inches | INTEGER | Expected mature height | Optional |
| days_to_maturity | INTEGER | Days from planting to harvest | Optional |

**Key Design Decisions:**
- `plant_key` serves as human-readable identifier for API integration
- Temperature ranges enable climate matching algorithms
- Tolerance ratings support location suitability scoring
- Harvest timing supports seasonal planning automation

#### `plant_categories` - Grouping system
Organizes plants by growing characteristics and seasons.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| category_key | VARCHAR(50) | Unique identifier (e.g., 'heat_tolerant') |
| name | VARCHAR(100) | Display name |
| description | TEXT | Category details |

**Current Categories:**
1. Heat-tolerant (category_id: 1) - 8 varieties
2. Cool-season (category_id: 2) - 7 varieties  
3. Herbs (category_id: 3) - 7 varieties

#### `plant_names` - Multilingual naming
Supports localization and alternative names.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| plant_id | INTEGER | Reference to plants table |
| language | VARCHAR(2) | ISO language code |
| common_name | VARCHAR(200) | Primary display name |
| alternate_names | TEXT | Comma-separated alternatives |

### Geographic & Climate Data

#### `regions` - Geographic organization
Supports multi-region vendor and growing recommendations.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| code | VARCHAR(2) | Region identifier (e.g., 'US') |
| name | VARCHAR(100) | Display name |
| currency | VARCHAR(3) | ISO currency code |
| language | VARCHAR(2) | Default language |

#### `climate_zones` - USDA hardiness zones
Maps temperature ranges to zone classifications.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| zone_code | VARCHAR(4) | Zone identifier (e.g., '7b') |
| min_temp_f | INTEGER | Minimum winter temperature |
| max_temp_f | INTEGER | Maximum winter temperature |
| description | TEXT | Zone characteristics |

### Knowledge Base

#### `growing_tips` - Location-aware guidance
Climate-specific growing advice tied to plant and zone combinations.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| plant_id | INTEGER | Reference to plants table |
| category | VARCHAR(50) | Tip type (e.g., 'watering', 'soil') |
| tip_text | TEXT | Growing advice content |
| climate_zones | VARCHAR(100) | Applicable zones (comma-separated) |
| priority | INTEGER | Display ordering |

**Current Coverage:** 79 growing tips across plant varieties

#### `companion_plants` - Planting relationships
Maps beneficial, neutral, and antagonistic plant combinations.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| plant_a_id | INTEGER | Primary plant reference |
| plant_b_id | INTEGER | Companion plant reference |
| relationship_type | VARCHAR(20) | beneficial/neutral/antagonistic |
| notes | TEXT | Relationship explanation |

**Current Coverage:** 56 companion relationships

### Commercial Integration

#### `vendors` - Seed supplier registry
Tracks commercial sources for plant varieties.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| vendor_key | VARCHAR(50) | Unique identifier |
| name | VARCHAR(100) | Company name |
| website_url | VARCHAR(255) | Primary website |
| shipping_threshold | DECIMAL(5,2) | Free shipping minimum |
| is_active | BOOLEAN | Current availability |

#### `seed_products` - Commercial offerings
Specific products available from vendors.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| plant_id | INTEGER | Reference to plants table |
| vendor_id | INTEGER | Reference to vendors table |
| sku | VARCHAR(100) | Product identifier |
| variety_name | VARCHAR(100) | Specific cultivar |
| packet_size | VARCHAR(50) | Package size description |
| seed_count | INTEGER | Seeds per packet |
| price | DECIMAL(5,2) | Current price |
| product_url | VARCHAR(255) | Direct product link |
| is_organic | BOOLEAN | Organic certification |
| is_heirloom | BOOLEAN | Heirloom variety |
| heat_tolerance_rating | INTEGER | Vendor heat rating |
| packet_plants_sqft | DECIMAL(4,1) | Coverage per packet |
| is_available | BOOLEAN | Current stock status |

#### `regional_vendor_recommendations` - Location-specific sourcing
Combines plants, regions, and vendors with growing guidance.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| plant_id | INTEGER | Reference to plants table |
| region_id | INTEGER | Reference to regions table |
| vendor_id | INTEGER | Reference to vendors table |
| seed_product_id | INTEGER | Specific product recommendation |
| preference_rank | INTEGER | Vendor ranking for this plant/region |
| order_timing | VARCHAR(100) | When to purchase |
| planting_instructions | TEXT | Region-specific guidance |
| succession_plantings | INTEGER | Recommended plantings per season |
| packets_needed_per_100sqft | INTEGER | Quantity guidance |
| special_notes | TEXT | Regional considerations |

### Temporal Planning

#### `purchase_windows` - Seasonal buying guidance
Defines optimal purchasing periods for different plant categories.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| window_key | VARCHAR(50) | Unique identifier |
| name | VARCHAR(100) | Display name |
| timing | VARCHAR(100) | Human-readable timing |
| description | TEXT | Window details |
| start_month | INTEGER | Window start (1-12) |
| end_month | INTEGER | Window end (1-12) |
| priority | INTEGER | 1=critical, 2=recommended, 3=optional |
| applies_to_categories | TEXT | JSON array of category_keys |

## Views & Aggregations

### `seed_ordering_details`
Comprehensive view combining plant data, vendor information, and regional recommendations for purchase planning.

**Purpose:** Simplifies complex joins for shopping recommendation generation  
**Key Fields:** plant_key, common_name, vendor_name, price, order_timing, planting_instructions  

### `purchase_window_planning`  
Temporal view organizing products by optimal purchase timing.

**Purpose:** Supports seasonal shopping automation  
**Key Fields:** window_name, timing, plant_key, variety_name, price, vendor_name  

## Database Performance

### Indexes
- `idx_seed_products_plant` - Plant-based product lookups
- `idx_seed_products_vendor` - Vendor catalog queries  
- `idx_seed_products_available` - Active product filtering
- `idx_regional_vendor_recs_region` - Regional recommendation queries
- `idx_regional_vendor_recs_plant` - Plant-specific vendor lookups
- `idx_purchase_windows_timing` - Seasonal timing queries

## Data Quality & Constraints

### Referential Integrity
- All plant references validated via foreign keys
- Vendor-product relationships enforced
- Climate zone codes validated against zone registry

### Business Rules
- Tolerance ratings limited to standardized values
- Purchase windows must have valid month ranges
- Temperature ranges logically consistent (min < max)
- Unique constraints prevent duplicate relationships

### Data Validation
- Temperature values in Fahrenheit integers
- Months as 1-12 integers  
- Boolean flags for binary characteristics
- JSON validation for category arrays

## Coverage Gaps & Expansion Needs

### Current Limitations
- **Scale:** 22 varieties insufficient for continental US (need 100+)
- **Categories:** Missing grains, legumes, tree fruits, berries, root vegetables, brassicas
- **Regional Depth:** Limited cultivar diversity for different climate zones  
- **Seasonal Varieties:** Insufficient succession planting options

### Expansion Priorities
1. **Core Vegetables:** Tomatoes, beans, squash, corn, onions, garlic
2. **Regional Specialties:** Desert crops (Southwest), cold-hardy varieties (North), heat-adapted cultivars (Southeast)
3. **Perennial Systems:** Tree fruits, berry bushes, perennial vegetables
4. **Succession Planning:** Multiple varieties per crop for extended harvests

### Schema Extensions Needed
- `plant_breeding_info` - Parentage and breeding details
- `disease_resistance` - Pest and disease tolerance data  
- `nutrition_data` - Nutritional analysis and health benefits
- `harvest_processing` - Post-harvest handling and preservation
- `seed_saving` - Variety-specific seed collection guidance

## Integration Points

### Application Integration
- **Static Data Fallback:** When database unavailable, app uses `GLOBAL_CROP_DATABASE` from config.js
- **Location Suitability:** Database provides detailed tolerance data for climate matching algorithms
- **Recommendation Engine:** Growing tips and companion data enhance location-aware suggestions

### API Patterns
- Primary access via `plant_key` identifiers
- Zone-based filtering for location relevance  
- Category-based grouping for UI organization
- Vendor integration for commercial recommendations

## Usage Examples

```sql
-- Get all plants suitable for zone 7b
SELECT p.plant_key, pn.common_name, p.heat_tolerance, p.drought_tolerance 
FROM plants p
JOIN plant_names pn ON p.id = pn.plant_id 
WHERE CAST(SUBSTR(p.min_zone, 1, 1) AS REAL) <= 7
AND CAST(SUBSTR(p.max_zone, 1, 1) AS REAL) >= 7
AND pn.language = 'en';

-- Get growing tips for okra in hot climates
SELECT gt.tip_text, gt.category, gt.climate_zones
FROM growing_tips gt
JOIN plants p ON gt.plant_id = p.id
WHERE p.plant_key = 'okra'
AND (gt.climate_zones LIKE '%7%' OR gt.climate_zones IS NULL)
ORDER BY gt.priority DESC;

-- Find companion plants for kale
SELECT p2.plant_key, pn2.common_name, cp.relationship_type, cp.notes
FROM companion_plants cp
JOIN plants p1 ON cp.plant_a_id = p1.id
JOIN plants p2 ON cp.plant_b_id = p2.id
JOIN plant_names pn2 ON p2.id = pn2.plant_id
WHERE p1.plant_key = 'kale' AND pn2.language = 'en'
ORDER BY cp.relationship_type, pn2.common_name;
```

---

*Schema reflects database design as of 2025-06-27. Structure designed for comprehensive garden planning but currently limited by data volume rather than architectural constraints.*