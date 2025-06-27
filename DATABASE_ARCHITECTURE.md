# Database Architecture & WebAssembly Integration

*Last Updated: 2025-06-24*

## Overview

The Durham Garden Planner uses a SQLite database with WebAssembly (WASM) to run real SQL queries in the browser, replacing hard-coded calendar logic with a flexible, database-driven system.

## Architecture Components

### 1. SQLite Database (`database/plant_varieties.db`)
- **Purpose**: Central data store for garden activities, plant information, and regional templates
- **Location**: Static file served alongside the application
- **Schema**: Defined in `database/activity_schema.sql`
- **Data**: Populated with zone 7b temperate climate templates in `database/garden_data.sql`

### 2. sql.js Library
- **What it is**: SQLite compiled to WebAssembly for browser execution
- **Why needed**: Enables full SQL capabilities in the browser without server dependency
- **Package**: `sql.js` npm package providing the JavaScript interface

### 3. WebAssembly (WASM) Runtime
- **File**: `sql-wasm.wasm` (compiled SQLite engine)
- **Size**: ~1.6MB binary containing the complete SQLite implementation
- **Purpose**: Provides native-speed database operations in the browser

## How WebAssembly Works in Our System

### Browser Compatibility
WebAssembly is a binary instruction format that runs at near-native speed in modern browsers:
- **Chrome/Edge**: Full support since v57 (2017)
- **Firefox**: Full support since v52 (2017) 
- **Safari**: Full support since v11 (2017)
- **Mobile**: Supported on iOS Safari 11+ and Android Chrome 57+

### Loading Process
1. **WASM Initialization**: Browser downloads and compiles `sql-wasm.wasm`
2. **Database Loading**: Application fetches `plant_varieties.db` as binary data
3. **Memory Creation**: sql.js creates an in-memory database from the binary data
4. **Query Execution**: SQL queries run directly in browser memory

### Performance Characteristics
- **Initial Load**: ~2-3 seconds for WASM + database loading
- **Query Speed**: Near-native SQLite performance (sub-millisecond for our queries)
- **Memory Usage**: ~5-10MB for our database size
- **Offline Capability**: Fully functional without internet after initial load

## File Configuration

### Webpack Configuration (`craco.config.js`)
```javascript
// Copy WASM file to build output
new CopyPlugin({
  patterns: [
    {
      from: path.resolve(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm'),
      to: 'sql-wasm.wasm',
    },
  ],
}),

// Enable WebAssembly support
webpackConfig.experiments = {
  syncWebAssembly: true,
  asyncWebAssembly: true,
};
```

### Node.js Polyfills
Since sql.js was originally designed for Node.js, we need browser polyfills:
```javascript
webpackConfig.resolve.fallback = {
  "crypto": require.resolve("crypto-browserify"),
  "path": require.resolve("path-browserify"),
  "stream": require.resolve("stream-browserify"),
  "util": require.resolve("util"),
  "buffer": require.resolve("buffer"),
  "vm": require.resolve("vm-browserify"),
  "fs": false, // Cannot be polyfilled
};
```

## Database Service Implementation

### Initialization (`src/services/databaseService.js`)
```javascript
async initializeDatabase() {
  // Initialize sql.js with WASM file location
  const SQL = await initSqlJs({
    locateFile: file => `/sql-wasm.wasm`
  });

  // Load database file as binary data
  const response = await fetch('/database/plant_varieties.db');
  const buffer = await response.arrayBuffer();
  
  // Create in-memory database
  this.db = new SQL.Database(new Uint8Array(buffer));
}
```

### Query Execution
```javascript
async getActivityTemplates(regionId = 1, month) {
  const stmt = `
    SELECT at.id, p.plant_key, aty.type_key as activity_type,
           at.action_template, at.timing_template, at.variety_suggestions
    FROM activity_templates at
    JOIN activity_types aty ON at.activity_type_id = aty.id
    LEFT JOIN plants p ON at.plant_id = p.id
    WHERE at.region_id = ? AND at.month = ?
  `;
  
  const result = this.db.exec(stmt, [regionId, month]);
  // Process results...
}
```

## Benefits of This Architecture

### 1. **True SQL Capability**
- Complex queries with JOINs, WHERE clauses, and aggregations
- Familiar SQL syntax for data manipulation
- ACID compliance for data integrity

### 2. **No Server Dependency**
- Runs entirely in the browser
- Works offline after initial load
- No backend database required

### 3. **Performance**
- WebAssembly provides near-native speed
- Efficient binary format for data storage
- Local execution eliminates network latency

### 4. **Maintainability**
- Structured data schema
- Easy to add new regions, plants, or activity types
- Clear separation between data and business logic

### 5. **Flexibility**
- Can handle complex garden scenarios
- Easy to extend with new features
- Supports dynamic filtering and customization

## Data Flow

```
User Action → React Component → Database Service → sql.js → WASM → SQLite
                                                                     ↓
Calendar Display ← Component State ← Service Response ← Query Results ↵
```

## Development Workflow

### Adding New Data
1. Update schema in `database/activity_schema.sql` if needed
2. Add data to `database/garden_data.sql`
3. Rebuild database with `npm run db:build`
4. Test queries in `src/services/databaseService.js`

### Database Management
- **Build**: `npm run db:build` - Creates/updates the SQLite file
- **Verify**: `npm run db:verify` - Validates schema and data integrity
- **Test**: `npm run db:test` - Runs database tests

## Browser DevTools Debugging

### Checking WASM Loading
```javascript
// In browser console
console.log('WebAssembly supported:', typeof WebAssembly !== 'undefined');
```

### Monitoring Database Queries
```javascript
// Enable SQL.js debug mode
const SQL = await initSqlJs({
  locateFile: file => `/sql-wasm.wasm`,
  debug: true
});
```

### Performance Monitoring
```javascript
// Time database operations
console.time('Database Query');
const result = db.exec(query);
console.timeEnd('Database Query');
```

## Production Considerations

### Build Size Impact
- **sql.js**: ~370KB gzipped
- **WASM file**: ~1.6MB (served separately)
- **Database**: ~50KB for our current data

### Loading Strategy
- WASM file loads in parallel with main app bundle
- Database initializes asynchronously on first use
- Fallback data available if database loading fails

### Error Handling
```javascript
try {
  await databaseService.initializeDatabase();
} catch (error) {
  console.error('Database failed to load, using fallback data');
  this.loadFallbackData();
}
```

## Security Considerations

### Data Safety
- Database runs in browser sandbox
- No server-side SQL injection risks
- Read-only database (no user data persistence)

### WASM Security
- WASM runs in browser security context
- Memory-safe execution environment
- No access to filesystem or network beyond fetch API

## Future Enhancements

### Potential Improvements
- **Database Compression**: Use gzip compression for database file
- **Lazy Loading**: Load database only when calendar is accessed
- **Caching**: Cache compiled WASM module in browser storage
- **Data Updates**: Implement incremental data updates
- **Multi-Region**: Support multiple regional databases

### Scalability
- Current architecture supports databases up to ~10MB efficiently
- For larger datasets, consider pagination or data partitioning
- WebAssembly memory limit is 2GB (far beyond our needs)

This architecture provides a robust foundation for garden planning with the flexibility to grow as our data and feature requirements expand.