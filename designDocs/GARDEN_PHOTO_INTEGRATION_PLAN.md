# Garden Photo Integration Plan

## Overview
Add photo upload and tracking capabilities to allow gardeners to document their garden progress over time, providing visual context for planting decisions and tracking growth outcomes.

## Core Features

### 1. Photo Upload System
- **Storage**: Vercel Blob storage for photo files
- **Metadata**: SQLite database for photo metadata and relationships
- **Upload UI**: Drag-and-drop photo upload component
- **Mobile optimization**: Camera integration for mobile gardeners

### 2. Photo Organization
- **Timeline view**: Chronological photo gallery by garden/bed
- **Planting associations**: Link photos to specific plantings/beds
- **Seasonal grouping**: Organize by growing seasons
- **Tag system**: Custom tags for categorization (harvest, pest damage, growth milestone)

### 3. Progress Tracking
- **Before/after comparisons**: Side-by-side photo comparisons
- **Growth timelines**: Visual progression of individual plants/beds
- **Harvest documentation**: Photo evidence of yields for recommendation refinement
- **Problem tracking**: Document pest/disease issues with photos

## Technical Architecture

### Database Schema Extensions
```sql
-- Photo metadata table
CREATE TABLE garden_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garden_id VARCHAR(50) NOT NULL,
    bed_id VARCHAR(50),
    planting_id VARCHAR(50),
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    tags TEXT, -- JSON array
    photo_date DATE NOT NULL,
    weather_conditions TEXT, -- JSON object
    growth_stage VARCHAR(50), -- seedling, vegetative, flowering, fruiting, harvest
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Photo analysis table (future AI integration)
CREATE TABLE photo_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER REFERENCES garden_photos(id),
    analysis_type VARCHAR(50), -- health, growth_rate, pest_detection
    confidence_score DECIMAL(3,2),
    analysis_data TEXT, -- JSON results
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Vercel Blob Integration
- **Photo storage**: `/garden-photos/{garden-id}/{year}/{month}/`
- **Thumbnail generation**: Auto-generate thumbnails for performance
- **Compression**: Optimize photo sizes for web display
- **CDN delivery**: Leverage Vercel's CDN for fast photo loading

### Service Layer
```
src/services/
├── photoUploadService.js     # Handle photo uploads to Vercel Blob
├── photoMetadataService.js   # SQLite operations for photo data
├── photoModerationService.js # Content validation and safety checks
├── photoAnalysisService.js   # Future AI analysis integration
└── photoTimelineService.js   # Generate photo timelines and comparisons
```

### Component Architecture
```
src/components/
├── PhotoUpload/
│   ├── PhotoUploadWidget.js    # Drag-drop upload interface
│   ├── PhotoPreview.js         # Photo preview with metadata form
│   └── CameraCapture.js        # Mobile camera integration
├── PhotoGallery/
│   ├── PhotoTimeline.js        # Chronological photo display
│   ├── PhotoComparison.js      # Before/after view
│   └── PhotoGrid.js            # Grid layout for browsing
└── PhotoIntegration/
    ├── PlantingPhotoLink.js    # Associate photos with plantings
    └── PhotoTag.js             # Tagging interface
```

## Implementation Phases

### Phase 1: Basic Photo Upload (~$4-5)
- PhotoUploadWidget component with drag-drop
- Vercel Blob integration for storage
- Content validation and safety checks
- Basic metadata capture (date, caption, garden/bed association)
- Simple photo gallery display

### Phase 2: Photo Organization (~$2-3)
- Timeline view by garden/bed
- Tagging system implementation
- Photo-to-planting associations
- Search and filter capabilities

### Phase 3: Progress Tracking (~$2-3)
- Before/after comparison views
- Growth timeline visualization
- Harvest documentation workflow
- Integration with yield tracking

### Phase 4: Advanced Features (~$3-4)
- Weather context integration (link photos to forecast data)
- Mobile camera optimization
- Batch upload capabilities
- Photo analysis preparation (structure for future AI)

## Integration Points

### Existing Systems
- **Garden State**: Extend garden configuration to include photo preferences
- **Planting Records**: Link photos to specific plantings for growth tracking
- **Weather Data**: Correlate photos with weather conditions for context
- **Recommendation Engine**: Use photo-documented outcomes to refine suggestions

### User Experience Flow
1. **Upload**: Gardener takes photo → uploads via widget → adds metadata
2. **Associate**: Links photo to specific bed/planting → adds tags
3. **Browse**: Views photos in timeline → compares progress over time
4. **Learn**: System uses photo outcomes to improve recommendations

## Technical Considerations

### Performance
- **Lazy loading**: Load photos on-demand in gallery views
- **Thumbnail optimization**: Generate multiple sizes for different displays
- **Caching strategy**: Browser caching with Vercel CDN

### Storage Costs
- **Compression**: Auto-compress uploads to balance quality/storage
- **Retention policy**: Optional auto-deletion of older photos
- **Storage limits**: Per-garden photo limits to control costs

### Content Safety & Moderation
- **Client-side validation**: File type restrictions (JPEG, PNG, WebP only)
- **Size limits**: Maximum file size (5MB) and dimension limits
- **Automated screening**: Basic image analysis for inappropriate content detection
- **Reporting mechanism**: User reporting system for inappropriate content
- **Content guidelines**: Clear terms of service for garden-related photos only
- **Rapid removal**: Automated flagging and manual review process

### Privacy
- **Garden-scoped access**: Photos only visible within specific garden context
- **No facial recognition**: Avoid any person identification features
- **Data ownership**: Clear user control over photo deletion
- **Content isolation**: Photos stored separately from user identity data

## Success Metrics
- **Engagement**: Percentage of gardens with uploaded photos
- **Retention**: Photo upload frequency over time
- **Utility**: Photos linked to planting records vs standalone uploads
- **Learning**: Improved recommendation accuracy with photo-documented outcomes

## Future Enhancements
- **AI plant health analysis**: Automated pest/disease detection
- **Growth rate calculations**: Measure plant development from photos
- **Community features**: Optional photo sharing between gardeners
- **Time-lapse generation**: Automatic creation of growth time-lapses

---

This plan provides a comprehensive photo integration system that enhances the garden planning experience while maintaining the application's focus on data-driven gardening decisions.

**Total Estimated Cost: $11-15** (increased from $10-14 to account for content safety implementation)