#!/bin/bash

# Database Testing Script
# Ensures database integrity and validates critical data

DB_NAME="plant_varieties.db"
DB_DIR="."

echo "Testing Climate Garden Simulation Database..."

# Check if database exists
if [ ! -f "$DB_DIR/$DB_NAME" ]; then
    echo "Error: Database file not found. Run 'npm run db:build' first."
    exit 1
fi

# Test database integrity
echo "Running integrity check..."
INTEGRITY_RESULT=$(sqlite3 "$DB_DIR/$DB_NAME" "PRAGMA integrity_check;")
if [ "$INTEGRITY_RESULT" != "ok" ]; then
    echo "Error: Database integrity check failed"
    echo "$INTEGRITY_RESULT"
    exit 1
fi

# Test critical data counts
echo "Validating data counts..."

# Check expected table counts
REGIONS=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM regions;")
PLANTS=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM plants;")
PLANT_NAMES=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM plant_names;")
GROWING_TIPS=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM growing_tips;")
COMPANIONS=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM companion_plants;")
MARKET_PRICES=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM market_prices;")

# Validate minimum expected counts
if [ "$REGIONS" -lt 2 ]; then
    echo "Error: Expected at least 2 regions, found $REGIONS"
    exit 1
fi

if [ "$PLANTS" -lt 15 ]; then
    echo "Error: Expected at least 15 plants, found $PLANTS"
    exit 1
fi

if [ "$PLANT_NAMES" -lt 15 ]; then
    echo "Error: Expected at least 15 plant names, found $PLANT_NAMES"
    exit 1
fi

if [ "$GROWING_TIPS" -lt 50 ]; then
    echo "Error: Expected at least 50 growing tips, found $GROWING_TIPS"
    exit 1
fi

if [ "$COMPANIONS" -lt 40 ]; then
    echo "Error: Expected at least 40 companion relationships, found $COMPANIONS"
    exit 1
fi

if [ "$MARKET_PRICES" -lt 25 ]; then
    echo "Error: Expected at least 25 market prices, found $MARKET_PRICES"
    exit 1
fi

# Test critical queries work
echo "Testing critical queries..."

# Test plant details view
PLANT_DETAILS=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM plant_details WHERE language = 'en';")
if [ "$PLANT_DETAILS" -lt 15 ]; then
    echo "Error: Plant details view returned insufficient data: $PLANT_DETAILS"
    exit 1
fi

# Test regional planting calendar
CALENDAR_DATA=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM regional_planting_calendar;")
if [ "$CALENDAR_DATA" -lt 30 ]; then
    echo "Error: Regional planting calendar insufficient: $CALENDAR_DATA"
    exit 1
fi

# Test market data view
MARKET_DATA=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM plant_market_data;")
if [ "$MARKET_DATA" -lt 25 ]; then
    echo "Error: Market data view insufficient: $MARKET_DATA"
    exit 1
fi

# Test for data completeness
echo "Testing data completeness..."

# Check for plants without names
MISSING_NAMES=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM plants p WHERE NOT EXISTS (SELECT 1 FROM plant_names pn WHERE pn.plant_id = p.id AND pn.language = 'en');")
if [ "$MISSING_NAMES" -gt 0 ]; then
    echo "Error: $MISSING_NAMES plants missing English names"
    exit 1
fi

# Check for heat-tolerant plants
HEAT_TOLERANT=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM plants p JOIN plant_categories pc ON p.category_id = pc.id WHERE pc.category_key = 'heat_tolerant';")
if [ "$HEAT_TOLERANT" -lt 4 ]; then
    echo "Error: Insufficient heat-tolerant plants: $HEAT_TOLERANT"
    exit 1
fi

# Check for cool season plants
COOL_SEASON=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM plants p JOIN plant_categories pc ON p.category_id = pc.id WHERE pc.category_key = 'cool_season';")
if [ "$COOL_SEASON" -lt 5 ]; then
    echo "Error: Insufficient cool-season plants: $COOL_SEASON"
    exit 1
fi

# Check for perennial herbs
PERENNIALS=$(sqlite3 "$DB_DIR/$DB_NAME" "SELECT COUNT(*) FROM plants p JOIN plant_categories pc ON p.category_id = pc.id WHERE pc.category_key = 'perennials';")
if [ "$PERENNIALS" -lt 4 ]; then
    echo "Error: Insufficient perennial herbs: $PERENNIALS"
    exit 1
fi

echo ""
echo "Database Test Results:"
echo "====================="
echo "✓ Database integrity: OK"
echo "✓ Data counts: Regions($REGIONS), Plants($PLANTS), Tips($GROWING_TIPS), Companions($COMPANIONS)"
echo "✓ Views functional: Details($PLANT_DETAILS), Calendar($CALENDAR_DATA), Market($MARKET_DATA)"
echo "✓ Categories: Heat-tolerant($HEAT_TOLERANT), Cool-season($COOL_SEASON), Perennials($PERENNIALS)"
echo "✓ Data completeness: All plants have English names"
echo ""
echo "All tests passed! Database is ready for production use."