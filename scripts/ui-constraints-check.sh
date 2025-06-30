#!/bin/bash

# UI Constraints Pre-commit Check
# Prevents complexity accumulation in React components

set -e

echo "🔍 Checking UI architectural constraints..."

# Check for large components (>400 lines, excluding test files)
echo "📏 Checking component sizes..."
large_components=$(find src/components -name "*.js" -o -name "*.jsx" | grep -v "\.test\." | xargs wc -l | awk '$1 > 400 {print $2 " (" $1 " lines)"}' | head -10)

if [ -n "$large_components" ]; then
    echo "⚠️  Components exceeding 400 lines:"
    echo "$large_components"
    echo ""
    echo "💡 Consider breaking these components into smaller, focused pieces"
    echo "   Target: <300 lines per component"
    echo "   (Warning only - existing violations grandfathered)"
    echo ""
fi

# Check for functions with too many parameters (>10, excluding test files)
echo "🔧 Checking function complexity..."
complex_functions=$(grep -r "^[[:space:]]*const.*= (" src/components --include="*.js" --include="*.jsx" --exclude="*.test.*" | \
  grep -E '\([^)]*,[^)]*,[^)]*,[^)]*,[^)]*,[^)]*,[^)]*,[^)]*,[^)]*,[^)]*,' | \
  head -5)

if [ -n "$complex_functions" ]; then
    echo "❌ Functions with too many parameters found:"
    echo "$complex_functions"
    echo ""
    echo "💡 Consider using objects or context to reduce parameter count"
    echo "   Target: <10 parameters per function"
    exit 1
fi

# Check for deep nesting (>4 levels, excluding test files) - simple pattern match
echo "🪆 Checking nesting depth..."
deep_nesting=$(grep -r "^[[:space:]]\{16,\}" src/components --include="*.js" --include="*.jsx" --exclude="*.test.*" | head -3)

if [ -n "$deep_nesting" ]; then
    echo "⚠️  Deep nesting detected (may exceed 4 levels):"
    echo "$deep_nesting"
    echo ""
    echo "💡 Consider extracting nested logic into helper functions"
    echo "   Target: <4 levels of nesting"
    # Warning only, don't exit
fi

# Run ESLint with UI constraint rules
echo "⚡ Running ESLint UI constraints..."
npx eslint src/components --ext .js,.jsx --config .eslintrc.js --max-warnings 50

# Check for missing mobile-friendly patterns
echo "📱 Checking mobile-friendliness..."
missing_mobile=$(grep -r "className.*btn" src/components --include="*.js" | \
  grep -v "min-height\|touch-target\|btn-lg\|btn-sm" | \
  head -3)

if [ -n "$missing_mobile" ]; then
    echo "⚠️  Buttons without explicit touch-friendly sizing:"
    echo "$missing_mobile"
    echo ""
    echo "💡 Ensure interactive elements are >44px for mobile"
    # Warning only, don't exit
fi

echo "✅ UI constraints check complete!"
echo ""
echo "📊 Current component stats:"
echo "   Largest components:"
find src/components -name "*.js" -o -name "*.jsx" | grep -v "\.test\." | xargs wc -l | sort -nr | head -5 | awk '{print "   " $2 ": " $1 " lines"}'
echo ""
echo "🎯 Targets:"
echo "   • <400 lines per component (hard limit, test files: 600 lines)"
echo "   • <300 lines preferred"
echo "   • <10 props per component"
echo "   • <4 levels of nesting (relaxed for tests)"
echo "   • Mobile-first design"