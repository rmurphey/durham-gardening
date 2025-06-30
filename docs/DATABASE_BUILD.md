# Database Build Process

## Overview
The database build process ensures the frontend always has access to the latest database without requiring manual synchronization between source and deployment directories.

## Architecture

### Source Files
- `database/` - Version-controlled source directory
  - Contains all SQL schema and data files
  - `plant_varieties.db` - Built database file
  - All SQL source files (create_plant_database.sql, etc.)

### Build Process
1. **Development**: Database served from `database/` directory via craco devServer static config
2. **Build**: `npm run build` automatically:
   - Runs `npm run db:build` to rebuild database from source
   - Copies entire `database/` directory to `build/database/` via webpack CopyPlugin
   - Frontend loads from `/database/plant_varieties.db` (resolves to build output)

### Key Files
- `scripts/database-manager.js` - Database build logic
- `craco.config.js` - Webpack configuration for database copying
- `package.json` - Build scripts that include database preparation

## Commands

```bash
# Rebuild database from source SQL files
npm run db:build

# Full build (includes database rebuild + React build)
npm run build

# Development server (serves database from source directory)
npm run start
```

## Important Notes

1. **No Manual Copying**: The `public/database/` directory is NOT used - files are copied during build
2. **Source of Truth**: The `database/` directory is the authoritative source
3. **Build Integration**: Database is automatically rebuilt on every production build
4. **Development Workflow**: Changes to SQL files require `npm run db:build` to take effect

## File Access Patterns

```javascript
// Frontend always loads from this path:
fetch('/database/plant_varieties.db')

// Which resolves to:
// - Development: database/plant_varieties.db (via devServer static)
// - Production: build/database/plant_varieties.db (via CopyPlugin)
```

This ensures consistent database access across environments without manual file management.