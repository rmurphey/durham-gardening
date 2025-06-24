#!/bin/bash

# Climate Garden Simulation - Database Builder
# Creates comprehensive SQLite database for plant varieties in US and CA regions

DB_NAME="plant_varieties.db"
DB_DIR="."

echo "Building Climate Garden Simulation Plant Database..."

# Remove existing database if it exists
if [ -f "$DB_DIR/$DB_NAME" ]; then
    echo "Removing existing database..."
    rm "$DB_DIR/$DB_NAME"
fi

# Create database and tables
echo "Creating database schema..."
sqlite3 "$DB_DIR/$DB_NAME" < create_plant_database.sql

if [ $? -ne 0 ]; then
    echo "Error: Failed to create database schema"
    exit 1
fi

# Populate base data
echo "Populating base data..."
sqlite3 "$DB_DIR/$DB_NAME" < populate_data.sql

if [ $? -ne 0 ]; then
    echo "Error: Failed to populate base data"
    exit 1
fi

# Add growing tips
echo "Adding growing tips and regional adaptations..."
sqlite3 "$DB_DIR/$DB_NAME" < add_growing_tips.sql

if [ $? -ne 0 ]; then
    echo "Error: Failed to add growing tips"
    exit 1
fi

# Add companion planting data
echo "Adding companion planting relationships..."
sqlite3 "$DB_DIR/$DB_NAME" < add_companion_plants.sql

if [ $? -ne 0 ]; then
    echo "Error: Failed to add companion planting data"
    exit 1
fi

# Apply data updates for current information
echo "Applying current data updates..."
sqlite3 "$DB_DIR/$DB_NAME" < update_data.sql

if [ $? -ne 0 ]; then
    echo "Error: Failed to apply data updates"
    exit 1
fi

# Verify database integrity
echo "Verifying database integrity..."
sqlite3 "$DB_DIR/$DB_NAME" "PRAGMA integrity_check;"

if [ $? -ne 0 ]; then
    echo "Error: Database integrity check failed"
    exit 1
fi

# Show database statistics
echo ""
echo "Database Statistics:"
echo "==================="
sqlite3 "$DB_DIR/$DB_NAME" "
SELECT 'Regions: ' || COUNT(*) FROM regions
UNION ALL
SELECT 'Climate Zones: ' || COUNT(*) FROM climate_zones  
UNION ALL
SELECT 'Plant Categories: ' || COUNT(*) FROM plant_categories
UNION ALL
SELECT 'Plant Varieties: ' || COUNT(*) FROM plants
UNION ALL
SELECT 'Plant Names: ' || COUNT(*) FROM plant_names
UNION ALL
SELECT 'Regional Planting Data: ' || COUNT(*) FROM regional_planting_months
UNION ALL
SELECT 'Market Prices: ' || COUNT(*) FROM market_prices
UNION ALL
SELECT 'Growing Tips: ' || COUNT(*) FROM growing_tips
UNION ALL
SELECT 'Companion Relationships: ' || COUNT(*) FROM companion_plants;"

echo ""
echo "Sample Queries:"
echo "==============="

echo ""
echo "1. Plants suitable for Zone 7b:"
sqlite3 "$DB_DIR/$DB_NAME" "
SELECT pd.common_name, pd.category_name, pd.hardiness_zones, pd.heat_tolerance, pd.drought_tolerance
FROM plant_details pd 
WHERE pd.id IN (
    SELECT p.id FROM plants p 
    WHERE '7b' BETWEEN p.min_zone AND p.max_zone
) AND pd.language = 'en'
ORDER BY pd.category_name, pd.common_name;"

echo ""
echo "2. Heat-tolerant crops for summer planting:"
sqlite3 "$DB_DIR/$DB_NAME" "
SELECT pd.common_name, pd.heat_tolerance, pd.drought_tolerance, pd.optimal_temp_min_f || '-' || pd.optimal_temp_max_f || '°F' as optimal_temp
FROM plant_details pd 
WHERE pd.category_key = 'heat_tolerant' AND pd.language = 'en'
ORDER BY pd.common_name;"

echo ""
echo "3. Market prices for herbs in US:"
sqlite3 "$DB_DIR/$DB_NAME" "
SELECT pmd.common_name, 
       '$' || pmd.price_per_lb || '/lb' as price_per_lb,
       '$' || pmd.price_per_unit || '/' || pmd.unit_type as price_per_unit,
       pmd.price_premium || 'x premium' as premium_multiplier
FROM plant_market_data pmd 
WHERE pmd.category_name = 'Perennial Herbs' AND pmd.region_code = 'US'
ORDER BY pmd.price_per_lb DESC;"

echo ""
# Run comprehensive tests
echo ""
echo "Running database tests..."
./test_database.sh

if [ $? -ne 0 ]; then
    echo "Error: Database tests failed"
    exit 1
fi

echo ""
echo "Database successfully created at: $DB_DIR/$DB_NAME"
echo "Size: $(du -h "$DB_DIR/$DB_NAME" | cut -f1)"
echo ""
echo "To explore the database interactively:"
echo "sqlite3 $DB_DIR/$DB_NAME"