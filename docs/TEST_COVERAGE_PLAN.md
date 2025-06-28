# Test Coverage Improvement & Code Cleanup Plan

## Current Analysis

### Test Infrastructure Status
- **Test Framework**: Jest + React Testing Library
- **Coverage Tool**: Built-in Jest coverage reporting  
- **Current Tests**: 65+ test files found, but many are failing
- **Main Issues**: Missing components (TaskCard, TasksView), import errors, timeout issues

### Major Test Failures Identified
1. **Missing Components**: TaskCard, TasksView, TaskCardList referenced but don't exist
2. **Service Dependencies**: activityShoppingSuggestionService fails due to undefined temporalRecommendations
3. **Router Conflicts**: Multiple Router instances in tests
4. **Database Initialization**: Tests timeout on database loading

## Cleanup Tasks

### 1. Remove Unused Code (High Priority)
- **TaskCard.js**: Referenced in CardDemo.js but doesn't exist - remove import
- **TasksView.js**: Referenced in tests but doesn't exist - remove tests
- **TaskCardList.js**: Referenced in tests but doesn't exist - remove tests
- **Unused imports**: Clean up interface-validation.test.js imports

### 2. Fix Service Dependencies
- **temporalShoppingService**: Fix null/undefined returns in generateTemporalShoppingRecommendations
- **activityShoppingSuggestionService**: Add defensive programming for missing data

### 3. Test Infrastructure Fixes
- **Router Testing**: Fix double Router wrapping in integration tests
- **Database Mocking**: Better mocking for database-dependent tests
- **Timeout Issues**: Reduce test complexity to avoid timeouts

## Test Coverage Priorities

### Core Services Needing Tests
1. **regionalVarietyRecommendations.js** - 0% coverage, critical new service
2. **varietyRecommendationService.js** - 0% coverage, critical new service  
3. **databaseLocationRecommendations.js** - 0% coverage, critical integration service
4. **locationRecommendations.js** - Partial coverage, needs variety-specific tests

### Components Needing Tests
1. **EnhancedPlantRecommendations.js** - 0% coverage, major new component
2. **CompactSettingsPanel.js** - Failing due to undefined properties
3. **LocationSetup.js** - Needs location configuration tests

### Integration Tests Needed
1. **Database + Variety Integration**: Test full pipeline from plant selection to variety recommendations
2. **Location + Database Integration**: Test location-aware recommendations with database fallbacks
3. **Component + Service Integration**: Test EnhancedPlantRecommendations with real data flows

## Implementation Strategy

### Phase 1: Cleanup (Immediate)
- Remove non-existent component references
- Fix service null-safety issues
- Update test imports to match actual components

### Phase 2: Core Service Tests (High Value)
- Test variety recommendation algorithms
- Test database integration graceful fallbacks
- Test location-aware recommendation logic

### Phase 3: Component Tests (Medium Value)  
- Test EnhancedPlantRecommendations rendering
- Test variety display components
- Test location setup workflows

### Phase 4: Integration Tests (Long-term)
- End-to-end recommendation flows
- Database + UI integration scenarios
- Error handling and fallback behaviors

## Success Metrics
- All existing tests pass (currently many failing)
- Core services achieve >80% coverage
- Critical user flows have integration test coverage
- Build/test pipeline runs without timeouts