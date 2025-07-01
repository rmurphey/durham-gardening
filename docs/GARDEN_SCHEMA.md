# Garden Data Schema

## Overview

Garden data is stored in Vercel Blob storage as JSON objects. Each garden has a unique ID and contains all user-specific configuration including layout, plantings, and preferences.

## Garden Data Structure

```javascript
{
  // Garden Identity
  "gardenId": "uuid-string",
  "name": "My Garden",
  "description": "Backyard vegetable garden",
  
  // Location & Climate
  "location": {
    "address": "123 Main St, City, State",
    "coordinates": {
      "lat": 35.9940,
      "lng": -78.8986
    },
    "timezone": "America/New_York",
    "climateZone": "7b",
    "region": "southeast"
  },
  
  // Garden Layout Configuration
  "layout": {
    "totalDimensions": {
      "width": 40,  // feet
      "height": 30  // feet
    },
    "layoutType": "rectangular", // "rectangular", "keyhole", "raised_beds", "container", "square_foot"
    "gridSize": 1, // feet - for snapping/alignment
    
    // Individual beds/containers
    "beds": [
      {
        "id": "bed-1",
        "name": "Tomatoes & Peppers",
        "x": 5,      // position from garden origin
        "y": 10,
        "width": 8,  // feet
        "height": 4, // feet
        "rotation": 0, // degrees
        "type": "raised",     // "raised", "ground", "container", "keyhole"
        "shape": "rectangle", // "rectangle", "circle", "polygon"
        "soilType": "loam",   // "clay", "sandy", "loam", "potting_mix"
        "sunExposure": "full_sun", // "full_sun", "partial_shade", "shade"
        "notes": "12-inch raised bed with drip irrigation",
        
        // For raised beds
        "height_inches": 12,
        
        // For square foot gardens
        "gridSize": 1,
        "squares": [
          {
            "id": "square-0-0",
            "x": 0, "y": 0,
            "size": 1,
            "planted": true,
            "crop": "tomato",
            "variety": "Cherokee Purple",
            "plantedDate": "2024-04-15"
          }
        ],
        
        // For container gardens
        "containerType": "barrel", // "barrel", "pot", "raised_bed", "grow_bag"
        "volume": 50 // gallons
      }
    ],
    
    // Paths and walkways
    "paths": [
      {
        "id": "main-path",
        "type": "main_path",
        "width": 3, // feet
        "material": "mulch", // "mulch", "gravel", "concrete", "grass"
        "points": [
          {"x": 0, "y": 15},
          {"x": 40, "y": 15}
        ]
      }
    ],
    
    // Garden structures
    "structures": [
      {
        "id": "greenhouse-1",
        "type": "greenhouse",
        "name": "Small Greenhouse",
        "x": 25,
        "y": 5,
        "width": 8,
        "height": 6,
        "notes": "Unheated greenhouse for season extension"
      },
      {
        "id": "compost-1",
        "type": "compost",
        "name": "Compost Bin",
        "x": 35,
        "y": 25,
        "width": 4,
        "height": 4
      }
    ],
    
    // Metadata
    "templateId": "template-rectangular-basic", // Reference to layout template used
    "createdAt": "2024-01-15T10:30:00Z",
    "lastModified": "2024-01-20T14:45:00Z"
  },
  
  // Planting Records
  "plantings": [
    {
      "id": "planting-1",
      "crop": "tomato",
      "variety": "Cherokee Purple",
      "bedId": "bed-1",
      "bedPosition": {
        "x": 2,    // position within bed
        "y": 1,
        "spacing": 24 // inches between plants
      },
      "plantedDate": "2024-04-15",
      "plannedHarvestDate": "2024-07-15",
      "quantity": 4,
      "status": "growing", // "planned", "seeded", "germinated", "transplanted", "growing", "harvesting", "finished"
      "notes": "Started from seed indoors",
      "supplier": "Johnny's Seeds",
      "cost": 3.50
    }
  ],
  
  // Garden Preferences
  "preferences": {
    "measurementSystem": "imperial", // "imperial", "metric"
    "currency": "USD",
    "showGrid": true,
    "snapToGrid": true,
    "defaultBedType": "raised",
    "defaultSoilType": "loam",
    "gardenStyle": "vegetable", // "vegetable", "flower", "herb", "mixed"
  },
  
  // Sharing & Collaboration
  "sharing": {
    "isPublic": false,
    "allowComments": false,
    "collaborators": []
  },
  
  // System Metadata (added by API)
  "lastModified": "2024-01-20T14:45:00Z",
  "lastAccessed": "2024-01-20T15:00:00Z",
  "version": "1.0"
}
```

## Bed Types

### Rectangular Beds
```javascript
{
  "type": "raised",
  "shape": "rectangle",
  "width": 8,
  "height": 4,
  "height_inches": 12 // for raised beds
}
```

### Square Foot Gardens
```javascript
{
  "type": "raised",
  "shape": "rectangle",
  "gridSize": 1,
  "squares": [/* array of 1x1 squares */]
}
```

### Container Gardens
```javascript
{
  "type": "container",
  "shape": "circle",
  "containerType": "barrel",
  "diameter": 24, // inches
  "volume": 50    // gallons
}
```

### Keyhole Gardens
```javascript
{
  "type": "keyhole",
  "shape": "circle",
  "radius": 6,
  "centerX": 20,
  "centerY": 15,
  "compostBin": {
    "x": 20, "y": 15,
    "radius": 1
  }
}
```

## Migration Strategy

Existing gardens without layout data will be automatically upgraded:

1. **Default Layout**: Single rectangular bed using garden dimensions
2. **Preserve Plantings**: Existing planting records mapped to default bed
3. **Gradual Migration**: Users can customize layout over time

## API Compatibility

The existing Vercel Blob API (`/api/garden/[id]`) handles this schema transparently:
- Accepts any valid JSON structure
- Preserves all fields during GET/POST operations
- No schema validation at API level (handled by client)

## Layout Templates

Layout templates are stored in SQLite database and referenced by `templateId`:
- **Reusable**: Multiple gardens can use the same template
- **Customizable**: Users can modify generated layouts
- **Upgradeable**: Template updates don't affect existing gardens