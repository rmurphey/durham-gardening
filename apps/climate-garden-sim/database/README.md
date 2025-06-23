# Climate Garden Simulation Plant Database

A comprehensive SQLite database containing detailed information about plant varieties suitable for US and Canadian regions, with climate adaptations, growing tips, and market data.

## Database Overview

The database contains **18 plant varieties** across **6 categories** with comprehensive data for **2 regions** (US and Canada) covering **21 USDA hardiness zones**.

### Key Statistics
- **132KB** database size
- **18** plant varieties with full botanical and growing information
- **79** growing tips and regional adaptations
- **56** companion planting relationships
- **33** market price entries for regional economics
- **51** regional planting schedules
- **21** USDA/Canadian hardiness zones

## Database Schema

### Core Tables

#### `plants`
Primary plant data with botanical names, climate tolerances, and growing characteristics.
- Temperature ranges (min/max/optimal)
- Hardiness zones (min/max compatible)
- Harvest timing and duration
- Drought, heat, and humidity tolerance ratings
- Physical characteristics (spacing, height, maturity days)

#### `plant_names`
Multi-language common names with alternate names.
- Currently supports English (en)
- Includes alternate names as JSON arrays

#### `regional_planting_months`
Climate-specific planting schedules by region and climate type.
- Temperate, subtropical, and tropical adaptations
- Month arrays stored as JSON for flexible queries

#### `market_prices`
Regional market pricing with seasonal variations.
- Price per pound and per unit
- Premium multipliers for specialty varieties
- Peak pricing months for market timing

#### `growing_tips`
Detailed cultivation advice categorized by type.
- Climate adaptation strategies
- Planting, care, and harvest guidance
- Pest management recommendations
- Regional specializations

#### `companion_plants`
Beneficial, neutral, and antagonistic plant relationships.
- Scientific companion planting data
- Detailed explanations for each relationship
- Helps optimize garden layout and plant health

## Plant Categories

### Heat-Tolerant Crops (5 varieties)
Perfect for climate change adaptation and hot summers:
- **Okra** - Zones 6-11, excellent heat/drought tolerance
- **Hot Peppers** - Zones 5-11, excellent heat tolerance
- **Amaranth Greens** - Zones 4-11, excellent all-around tolerance
- **Sweet Potato** - Zones 6-11, excellent heat/drought tolerance
- **Malabar Spinach** - Zones 7-11, excellent heat/humidity tolerance

### Cool-Season Crops (7 varieties)
Ideal for spring, fall, and winter growing:
- **Kale** - Zones 2-9, poor heat tolerance, good cold hardiness
- **Cabbage** - Zones 1-9, poor heat tolerance, excellent storage
- **Lettuce** - Zones 2-9, poor heat/drought tolerance, quick growth
- **Spinach** - Zones 2-9, poor heat tolerance, very cold hardy
- **Carrots** - Zones 3-10, fair heat tolerance, long storage
- **Arugula** - Zones 2-9, fair heat tolerance, peppery flavor
- **Radishes** - Zones 2-10, fair heat tolerance, fastest crop

### Perennial Herbs (6 varieties)
Long-term investments with high market value:
- **Rosemary** - Zones 6-10, excellent drought/heat tolerance
- **Thyme** - Zones 4-9, excellent drought tolerance
- **Oregano** - Zones 4-10, good drought/heat tolerance
- **Mint** - Zones 3-9, poor drought tolerance, loves moisture
- **Sage** - Zones 4-8, excellent drought tolerance
- **Lavender** - Zones 5-9, excellent drought tolerance, premium pricing

## Regional Adaptations

### United States Coverage
- **Temperate zones** (5-7): Traditional growing patterns with heat adaptations
- **Subtropical zones** (8-9): Extended seasons, heat-stressed cool crops
- **Market pricing**: Regional multipliers 1.0-1.3x based on urban density

### Canadian Coverage  
- **Temperate zones** (3-6): Short seasons, cold-hardy varieties emphasized
- **Limited heat-tolerant crops**: Focus on greenhouse/protected growing
- **Market pricing**: Generally 10-20% higher due to shorter seasons
- **Winter survival**: Emphasis on cold protection and season extension

## Example Queries

### 1. Find plants suitable for your hardiness zone
```sql
SELECT pd.common_name, pd.category_name, pd.hardiness_zones, 
       pd.heat_tolerance, pd.drought_tolerance
FROM plant_details pd 
WHERE pd.id IN (
    SELECT p.id FROM plants p 
    WHERE '7b' BETWEEN p.min_zone AND p.max_zone
) AND pd.language = 'en'
ORDER BY pd.category_name, pd.common_name;
```

### 2. Get planting calendar for your region
```sql
SELECT rpc.plant_key, rpc.common_name, rpc.planting_months,
       rpc.harvest_start_months, rpc.harvest_duration_months
FROM regional_planting_calendar rpc
WHERE rpc.region_code = 'US' AND rpc.climate_type = 'temperate'
ORDER BY rpc.category_name, rpc.common_name;
```

### 3. Find companion planting suggestions
```sql
SELECT p1.common_name as plant, p2.common_name as companion,
       cp.relationship_type, cp.description
FROM companion_plants cp
JOIN plant_details p1 ON cp.plant_id = p1.id
JOIN plant_details p2 ON cp.companion_plant_id = p2.id
WHERE p1.common_name = 'Okra' AND p1.language = 'en' AND p2.language = 'en'
ORDER BY cp.relationship_type, p2.common_name;
```

### 4. Calculate crop economics by region
```sql
SELECT pmd.common_name, pmd.region_name, pmd.currency,
       pmd.price_per_lb, pmd.price_premium,
       (pmd.price_per_lb * pmd.price_premium) as premium_price_per_lb
FROM plant_market_data pmd
WHERE pmd.category_name = 'Heat-Tolerant Crops'
ORDER BY premium_price_per_lb DESC;
```

### 5. Get climate-specific growing tips
```sql
SELECT pd.common_name, gt.tip_category, gt.tip_text, gt.priority
FROM growing_tips gt
JOIN plant_details pd ON gt.plant_id = pd.id
WHERE pd.common_name = 'Kale' AND pd.language = 'en'
ORDER BY gt.priority, gt.tip_category;
```

## Data Quality and Comprehensiveness

### Comprehensive Coverage
✅ **Climate Adaptations**: Temperature ranges, zone compatibility, tolerance ratings  
✅ **Regional Variations**: US and Canada with climate-specific adaptations  
✅ **Sun Requirements**: Full sun, partial shade, and shade tolerance documented  
✅ **Soil Needs**: Drainage, pH, and fertility requirements in growing tips  
✅ **Water Management**: Drought tolerance and irrigation needs  
✅ **Pest Management**: Companion planting and pest deterrent strategies  
✅ **Economic Data**: Regional market pricing and premium calculations  
✅ **Seasonal Planning**: Month-by-month planting and harvest schedules  

### Representative Selection
The database focuses on **practical, climate-resilient varieties** rather than exotic novelties:

- **Heat-tolerant crops** selected for climate change adaptation
- **Cool-season varieties** chosen for extended growing seasons
- **Perennial herbs** with proven market value and low maintenance
- **Regional adaptations** based on USDA and Canadian agricultural data
- **Companion relationships** based on scientific research and traditional knowledge

### Data Sources
- **USDA Plant Hardiness Zone Maps** for climate classifications
- **Regional Extension Services** for growing recommendations
- **Market Price Data** from USDA Agricultural Marketing Service
- **Companion Planting Research** from agricultural universities
- **Climate Adaptation Studies** from IPCC and regional climate assessments

## Using the Database

### Interactive Exploration
```bash
sqlite3 plant_varieties.db
```

### Common Views Available
- `plant_details` - Complete plant information with names
- `regional_planting_calendar` - Planting schedules by region
- `plant_market_data` - Economic data with currency formatting

### Integration Options
- Direct SQLite integration for web applications
- CSV export for spreadsheet analysis
- JSON export for API development
- SQL dumps for database migration

This database provides a solid foundation for climate-aware garden planning applications with comprehensive, scientifically-backed plant data optimized for changing climate conditions.