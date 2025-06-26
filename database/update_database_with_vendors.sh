#!/bin/bash

# Update database with vendor and seed ordering information
# Run this script from the database directory

DB_FILE="plant_varieties.db"
BACKUP_FILE="plant_varieties_backup_$(date +%Y%m%d_%H%M%S).db"

echo "🔄 Updating plant database with vendor information..."

# Create backup
if [ -f "$DB_FILE" ]; then
    echo "📁 Creating backup: $BACKUP_FILE"
    cp "$DB_FILE" "$BACKUP_FILE"
fi

# Apply vendor table schema
echo "📊 Adding vendor tables..."
sqlite3 "$DB_FILE" < add_vendor_tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Vendor tables created successfully"
else
    echo "❌ Error creating vendor tables"
    exit 1
fi

# Populate vendor data
echo "📦 Populating vendor data..."
sqlite3 "$DB_FILE" < populate_vendor_data.sql

if [ $? -eq 0 ]; then
    echo "✅ Vendor data populated successfully"
else
    echo "❌ Error populating vendor data"
    exit 1
fi

# Test the new views
echo "🧪 Testing new database views..."
VENDOR_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM vendors;")
PRODUCT_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM seed_products;")
RECOMMENDATION_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM regional_vendor_recommendations;")

echo "📈 Database updated successfully:"
echo "   - $VENDOR_COUNT vendors"
echo "   - $PRODUCT_COUNT seed products"
echo "   - $RECOMMENDATION_COUNT regional recommendations"

# Test a sample query
echo "🔍 Sample seed ordering query:"
sqlite3 "$DB_FILE" -header -column "
SELECT 
    common_name,
    variety_name,
    vendor_name,
    sku,
    price,
    order_timing
FROM seed_ordering_details 
WHERE region_code = 'US' 
LIMIT 5;"

echo "✅ Database update complete!"
echo "💾 Backup saved as: $BACKUP_FILE"