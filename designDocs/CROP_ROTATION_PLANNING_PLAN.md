# Crop Rotation Planning System Design

## 💰 Cost Summary
**Total Estimated Cost: $7-11 across 3 phases**
- Phase 1: Rotation Rules Engine ($3-4)
- Phase 2: Multi-Year Planning Interface ($3-4)
- Phase 3: Soil Health Tracking ($1-3)

## Overview & Goals

**Feature Purpose**: Provide multi-year crop rotation planning with location-specific rotation schedules to optimize soil health, prevent pest/disease buildup, and maximize garden productivity.

**User Value**: 
- Prevent soil depletion through systematic crop rotation
- Reduce pest and disease pressure with strategic plant family rotation
- Maximize nitrogen fixation and soil improvement
- Plan garden productivity across multiple growing seasons

**Current State**: No multi-year planning features. Users plan season-by-season without considering rotation benefits or requirements.

## Technical Architecture

### **Crop Rotation Database Schema**

#### **Plant Family Classification**
```sql
-- Extend existing SQLite database
CREATE TABLE plant_families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_name VARCHAR(100) NOT NULL, -- 'Brassicaceae', 'Solanaceae', 'Leguminosae'
    common_name VARCHAR(100), -- 'Brassicas', 'Nightshades', 'Legumes'
    nitrogen_effect VARCHAR(20), -- 'fixes', 'heavy_feeder', 'light_feeder', 'neutral'
    soil_nutrients_used TEXT, -- JSON array of primary nutrients consumed
    soil_nutrients_added TEXT, -- JSON array of nutrients contributed
    common_pests TEXT, -- JSON array of pest/disease problems
    rotation_break_years INTEGER, -- minimum years before replanting same family
    soil_improvement_rating INTEGER, -- 1-5 scale of soil building capacity
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plant_family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER REFERENCES plants(id),
    family_id INTEGER REFERENCES plant_families(id),
    nitrogen_fixing BOOLEAN DEFAULT FALSE,
    soil_compaction_effect VARCHAR(20), -- 'breaks', 'increases', 'neutral'
    root_depth VARCHAR(20), -- 'shallow', 'medium', 'deep'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rotation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_before_id INTEGER REFERENCES plant_families(id),
    family_after_id INTEGER REFERENCES plant_families(id),
    relationship_type VARCHAR(30), -- 'beneficial', 'neutral', 'avoid', 'prohibited'
    years_between INTEGER, -- minimum years between these families
    reasoning TEXT, -- explanation of the rotation rule
    regional_variations TEXT, -- JSON: climate-specific adjustments
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **Garden Rotation History**
```sql
CREATE TABLE garden_rotation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garden_id VARCHAR(100) NOT NULL,
    bed_location VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    season VARCHAR(20), -- 'spring', 'summer', 'fall', 'winter'
    family_id INTEGER REFERENCES plant_families(id),
    plant_id INTEGER REFERENCES plants(id),
    planted_date DATE,
    harvested_date DATE,
    yield_rating INTEGER, -- 1-5 user rating of productivity
    soil_condition_after VARCHAR(50), -- user assessment of soil after harvest
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rotation_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    garden_id VARCHAR(100) NOT NULL,
    plan_name VARCHAR(100),
    start_year INTEGER,
    end_year INTEGER,
    plan_type VARCHAR(30), -- '3_year', '4_year', 'custom'
    plan_configuration TEXT, -- JSON: detailed yearly plan for each bed
    soil_improvement_goals TEXT, -- JSON: target improvements
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Rotation Planning Service**

#### **Rotation Rules Engine**
```javascript
// New service: cropRotationService.js
class CropRotationService {
  generateRotationPlan(gardenConfig, plantPreferences, years = 4) {
    const beds = gardenConfig.beds;
    const rotationCycle = this.createOptimalRotationCycle(plantPreferences);
    
    return beds.map(bed => ({
      bedId: bed.id,
      yearlyPlan: this.generateBedRotation(bed, rotationCycle, years),
      soilImprovementPlan: this.planSoilImprovement(bed, rotationCycle),
      expectedBenefits: this.calculateRotationBenefits(rotationCycle)
    }));
  }
  
  createOptimalRotationCycle(plantPreferences) {
    // Classic 4-year rotation: Legumes → Brassicas → Root crops → Solanaceae
    const families = this.groupPlantsByFamily(plantPreferences);
    return this.optimizeRotationOrder(families);
  }
  
  validateRotationPlan(proposedPlan, gardenHistory) {
    const violations = [];
    
    proposedPlan.forEach(bedPlan => {
      bedPlan.yearlyPlan.forEach((year, index) => {
        const conflicts = this.checkRotationConflicts(
          year.plantFamily,
          bedPlan.yearlyPlan.slice(Math.max(0, index - 3), index),
          gardenHistory[bedPlan.bedId]
        );
        violations.push(...conflicts);
      });
    });
    
    return {
      isValid: violations.length === 0,
      violations,
      suggestions: this.generateImprovementSuggestions(violations)
    };
  }
}
```

#### **Soil Health Integration**
```javascript
// Soil improvement tracking
const soilHealthService = {
  calculateSoilImpact(plantFamily, soilCondition) {
    const familyEffects = {
      legumes: {
        nitrogen: +2,
        organic_matter: +1,
        soil_structure: +1,
        pest_pressure: 0
      },
      brassicas: {
        nitrogen: -1,
        organic_matter: 0,
        soil_structure: 0,
        pest_pressure: +1 // if grown repeatedly
      },
      solanaceae: {
        nitrogen: -2,
        organic_matter: -1,
        soil_structure: -1,
        pest_pressure: +2 // if grown repeatedly
      },
      root_crops: {
        nitrogen: -1,
        organic_matter: 0,
        soil_structure: +1, // break compaction
        pest_pressure: 0
      }
    };
    
    return familyEffects[plantFamily] || {};
  },
  
  projectSoilHealth(rotationPlan, currentSoilCondition) {
    let soilProjection = { ...currentSoilCondition };
    
    rotationPlan.forEach(year => {
      const impact = this.calculateSoilImpact(year.plantFamily, soilProjection);
      Object.keys(impact).forEach(nutrient => {
        soilProjection[nutrient] = Math.max(1, Math.min(5, soilProjection[nutrient] + impact[nutrient]));
      });
    });
    
    return soilProjection;
  }
};
```

### **User Interface Components**

#### **RotationPlanner Component**
```javascript
// New component: RotationPlanner.js
const RotationPlanner = () => {
  const { gardenConfig } = useGardenState();
  const [rotationPlan, setRotationPlan] = useState(null);
  const [planningYears, setPlanningYears] = useState(4);
  
  const handleGeneratePlan = () => {
    const plan = cropRotationService.generateRotationPlan(
      gardenConfig, 
      userPlantPreferences, 
      planningYears
    );
    setRotationPlan(plan);
  };
  
  return (
    <div className="rotation-planner">
      <PlannerControls 
        years={planningYears}
        onYearsChange={setPlanningYears}
        onGenerate={handleGeneratePlan}
      />
      {rotationPlan && (
        <>
          <RotationMatrix plan={rotationPlan} />
          <SoilHealthProjection plan={rotationPlan} />
          <RotationBenefits plan={rotationPlan} />
        </>
      )}
    </div>
  );
};
```

#### **RotationMatrix Component**
```javascript
// Visual rotation planning matrix
const RotationMatrix = ({ plan }) => (
  <div className="rotation-matrix">
    <div className="matrix-header">
      <div className="bed-column">Bed</div>
      {Array.from({length: plan[0]?.yearlyPlan.length || 0}, (_, i) => (
        <div key={i} className="year-column">Year {i + 1}</div>
      ))}
    </div>
    {plan.map(bedPlan => (
      <RotationRow 
        key={bedPlan.bedId}
        bedId={bedPlan.bedId}
        yearlyPlan={bedPlan.yearlyPlan}
        soilImprovementPlan={bedPlan.soilImprovementPlan}
      />
    ))}
  </div>
);

const RotationRow = ({ bedId, yearlyPlan, soilImprovementPlan }) => (
  <div className="rotation-row">
    <div className="bed-label">{bedId}</div>
    {yearlyPlan.map((year, index) => (
      <RotationCell 
        key={index}
        year={year}
        soilImpact={soilImprovementPlan[index]}
        onClick={() => handleCellEdit(bedId, index)}
      />
    ))}
  </div>
);
```

#### **SoilHealthTracker Component**
```javascript
// Soil health progression tracking
const SoilHealthTracker = ({ rotationPlan, currentSoilCondition }) => {
  const soilProjection = soilHealthService.projectSoilHealth(rotationPlan, currentSoilCondition);
  
  return (
    <div className="soil-health-tracker">
      <div className="current-condition">
        <h3>Current Soil Health</h3>
        <SoilHealthIndicators condition={currentSoilCondition} />
      </div>
      <div className="projected-condition">
        <h3>Projected After Rotation</h3>
        <SoilHealthIndicators condition={soilProjection} />
        <ImprovementSummary 
          current={currentSoilCondition} 
          projected={soilProjection} 
        />
      </div>
    </div>
  );
};
```

### **Integration with Calendar System**

#### **Multi-Year Calendar Extension**
```javascript
// Extend existing calendar with rotation planning
const rotationCalendarIntegration = {
  generateRotationEvents(rotationPlan, startYear) {
    const events = [];
    
    rotationPlan.forEach(bedPlan => {
      bedPlan.yearlyPlan.forEach((year, yearIndex) => {
        const plantingDate = new Date(startYear + yearIndex, 2, 15); // Mid-March
        const harvestDate = new Date(startYear + yearIndex, 8, 15); // Mid-September
        
        events.push({
          type: 'rotation_planting',
          title: `Plant ${year.plantFamily} in ${bedPlan.bedId}`,
          date: plantingDate,
          bedId: bedPlan.bedId,
          plantFamily: year.plantFamily,
          rotationYear: yearIndex + 1,
          soilPrep: year.soilPrepNeeded
        });
        
        events.push({
          type: 'rotation_harvest',
          title: `Harvest ${year.plantFamily} from ${bedPlan.bedId}`,
          date: harvestDate,
          bedId: bedPlan.bedId,
          plantFamily: year.plantFamily,
          soilAssessment: true
        });
      });
    });
    
    return events;
  }
};
```

## Security & Privacy

### **Data Protection**
- **Garden Privacy**: Rotation plans stored locally and in user-specific cloud storage
- **Historical Data**: User controls retention of garden history and soil assessments
- **Sharing Controls**: Users can share rotation plans without exposing location data
- **Data Portability**: Export rotation plans for use in other garden planning tools

### **Accuracy & Safety**
- **Scientific Basis**: Rotation rules based on established agricultural and horticultural research
- **Regional Adaptation**: Rotation recommendations adapted for different climate zones
- **Organic Focus**: Prioritize organic soil improvement and pest management methods
- **Disclaimer**: Clear guidance that rotation is one tool among many for garden health

## Content Moderation Standards

### **Scientific Accuracy**
- **Rotation Rules**: All family rotation rules validated against agricultural extension sources
- **Soil Science**: Soil improvement claims based on peer-reviewed research
- **Regional Validation**: Rotation cycles appropriate for different growing regions
- **Update Frequency**: Annual review of rotation recommendations and timing

### **User Data Quality**
- **Historical Accuracy**: Validation of user-entered garden history data
- **Realistic Planning**: Ensure rotation plans are practical for garden size and user commitment
- **Soil Assessment**: Guide users toward realistic soil condition evaluations
- **Plan Feasibility**: Alert users to overly ambitious or impractical rotation schemes

## Implementation Phases

### **Phase 1: Rotation Rules Engine ($3-4)**
**Timeline**: 1-2 sessions
**Dependencies**: Plant family database, rotation rule system

**Deliverables**:
- Plant family classification system with rotation rules
- Basic rotation plan generation engine
- Rotation validation and conflict detection
- Simple rotation visualization

**Technical Approach**:
- Research and implement standard crop rotation families and rules
- Create rotation planning algorithms based on agricultural best practices
- Build basic rotation plan generator with conflict detection
- Design simple matrix visualization for rotation plans

### **Phase 2: Multi-Year Planning Interface ($3-4)**
**Timeline**: 1-2 sessions
**Dependencies**: Phase 1, user interface for plan management

**Deliverables**:
- Interactive rotation planning matrix
- Multi-year garden calendar integration
- Rotation plan saving and modification
- Garden history tracking system

**Technical Approach**:
- Build interactive rotation planning interface
- Integrate rotation events with existing garden calendar
- Implement rotation plan persistence and modification
- Create garden history logging for rotation tracking

### **Phase 3: Soil Health Tracking ($1-3)**
**Timeline**: 1 session
**Dependencies**: Phase 2, soil health assessment system

**Deliverables**:
- Soil health projection based on rotation plans
- Soil improvement recommendations
- Rotation benefit calculations
- Integration with existing garden assessment tools

**Technical Approach**:
- Implement soil health impact calculations
- Create soil health projection visualizations
- Add soil improvement recommendations to rotation plans
- Integrate with existing garden health assessment features

## Integration Points

### **Existing System Enhancement**
- **Garden Calendar**: Extend with multi-year rotation planning events
- **Plant Database**: Add family classification and rotation characteristics
- **Garden Configuration**: Include soil health assessment and bed tracking
- **Plant Recommendations**: Consider rotation requirements in plant suggestions

### **Component Integration**
- **GardenCalendar**: Multi-year view with rotation milestones
- **PlantRecommendations**: Show rotation considerations for plant selection
- **DashboardView**: Add rotation status and upcoming rotation tasks
- **GardenStateProvider**: Include rotation planning in garden state management

### **Data Flow Integration**
```
Garden History → Family Classification → Rotation Rules → Plan Generation
     ↓                    ↓                    ↓
Plant Selection → Rotation Validation → Calendar Integration → Soil Health Tracking
```

## Risk Mitigation

### **Complexity Risks**
- **User Overwhelm**: Start with simple 3-4 year rotations, add complexity gradually
- **Planning Overhead**: Balance detailed planning with practical usability
- **Long-term Commitment**: Make rotation plans adaptable to changing preferences
- **Learning Curve**: Provide educational content about rotation benefits

### **Accuracy Risks**
- **Regional Variation**: Provide climate-specific rotation recommendations
- **Garden Size Limits**: Adapt rotation plans for small gardens and containers
- **Plant Variety Differences**: Account for variety-specific rotation needs
- **Soil Type Impact**: Adjust rotation benefits for different soil conditions

### **User Experience Risks**
- **Plan Flexibility**: Allow easy modification of rotation plans
- **Mobile Experience**: Ensure rotation planning works on mobile devices
- **Visual Clarity**: Make multi-year plans easy to understand and follow
- **Integration Smoothness**: Seamless integration with existing garden planning workflow

## Success Metrics

### **Planning Adoption Metrics**
- **Plan Creation**: >40% of users create multi-year rotation plans
- **Plan Following**: Users follow rotation recommendations >60% of the time
- **Plan Modification**: Users adapt and modify plans based on experience
- **Educational Engagement**: Users explore rotation educational content

### **Garden Health Metrics**
- **Soil Improvement**: Users report improved soil health after following rotations
- **Pest Reduction**: Reduced pest/disease problems in gardens with planned rotations
- **Productivity**: Maintained or improved yields with systematic rotation
- **Sustainability**: Increased adoption of organic soil improvement practices

### **System Performance Metrics**
- **Plan Generation**: Rotation plans generated in <5 seconds
- **Validation Accuracy**: Rotation rule violations accurately detected >95% of the time
- **Calendar Integration**: Seamless rotation event display in calendar
- **Data Persistence**: Reliable saving and loading of multi-year plans

## Cost Analysis

### **Implementation Costs**
- **Phase 1 (Rules Engine)**: $3-4
- **Phase 2 (Planning Interface)**: $3-4
- **Phase 3 (Soil Health Tracking)**: $1-3
- **Total Implementation**: $7-11

### **Operational Costs**
- **Data Storage**: Minimal increase for rotation plans and garden history
- **Maintenance**: Annual updates to rotation rules and recommendations
- **Educational Content**: Periodic updates to rotation guidance and best practices
- **Integration Maintenance**: Ongoing compatibility with calendar and plant systems

### **Value Proposition**
- **Soil Health**: Long-term soil improvement reduces need for external inputs
- **Pest Management**: Reduced pest pressure decreases need for treatments
- **Garden Productivity**: Optimized rotations improve long-term yields
- **Sustainability**: Promotes regenerative gardening practices

### **User Retention Impact**
- **Long-term Engagement**: Multi-year planning encourages continued app usage
- **Educational Value**: Users learn advanced gardening techniques
- **Community Building**: Rotation plans can be shared and compared with other users
- **Expert Positioning**: Advanced features establish app as serious gardening tool

**Recommendation**: Moderate-cost feature that provides significant long-term value by promoting sustainable gardening practices and creating multi-year user engagement with the platform.