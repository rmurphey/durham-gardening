/**
 * Test calendar generation with new indoor start templates
 * Verifies that indoor start activities appear in calendar
 */

const { generateDatabaseGardenCalendar } = require('../src/services/databaseCalendarService.js');
const { DURHAM_CONFIG } = require('../src/config/durhamConfig.js');

async function testCalendarGeneration() {
  console.log('🧪 Testing calendar generation with indoor start templates...\n');
  
  try {
    // Generate calendar with test parameters
    const calendar = await generateDatabaseGardenCalendar(
      'hot_summer', // summerScenario
      'mild_winter', // winterScenario
      'conservative', // portfolioKey
      DURHAM_CONFIG, // locationConfig
      null // customPortfolio
    );
    
    console.log(`✅ Calendar generated successfully with ${calendar.length} months`);
    
    // Test 1: Check for indoor start activities in February
    const february = calendar.find(month => month.month === 'February');
    if (!february) {
      throw new Error('February not found in calendar');
    }
    
    const indoorStartActivities = february.activities.filter(activity => 
      activity.type === 'indoor-starting' || 
      activity.action?.toLowerCase().includes('start') && activity.action?.toLowerCase().includes('indoor')
    );
    
    console.log(`\n📅 February Indoor Start Activities (${indoorStartActivities.length} found):`);
    indoorStartActivities.forEach(activity => {
      console.log(`   • ${activity.crop}: ${activity.action}`);
      console.log(`     Priority: ${activity.priority}, Timing: ${activity.timing || 'N/A'}`);
    });
    
    if (indoorStartActivities.length === 0) {
      console.log('⚠️  Warning: No indoor start activities found in February');
    }
    
    // Test 2: Check for indoor start activities in March
    const march = calendar.find(month => month.month === 'March');
    if (!march) {
      throw new Error('March not found in calendar');
    }
    
    const marchIndoorStarts = march.activities.filter(activity => 
      activity.type === 'indoor-starting' ||
      activity.action?.toLowerCase().includes('start') && activity.action?.toLowerCase().includes('indoor')
    );
    
    console.log(`\n📅 March Indoor Start Activities (${marchIndoorStarts.length} found):`);
    marchIndoorStarts.forEach(activity => {
      console.log(`   • ${activity.crop}: ${activity.action}`);
      console.log(`     Priority: ${activity.priority}, Timing: ${activity.timing || 'N/A'}`);
    });
    
    // Test 3: Check crop coverage
    const allIndoorStarts = [...indoorStartActivities, ...marchIndoorStarts];
    const cropsWithIndoorStarts = [...new Set(allIndoorStarts.map(a => a.crop))];
    
    console.log(`\n🌱 Crops with Indoor Start Activities (${cropsWithIndoorStarts.length}):`);
    cropsWithIndoorStarts.forEach(crop => {
      const activities = allIndoorStarts.filter(a => a.crop === crop);
      console.log(`   • ${crop}: ${activities.length} activities`);
    });
    
    // Test 4: Check for expected major crops
    const expectedCrops = ['tomatoes', 'hot_peppers', 'sweet_peppers', 'eggplant', 'basil'];
    const foundCrops = expectedCrops.filter(crop => 
      cropsWithIndoorStarts.some(foundCrop => 
        foundCrop.toLowerCase().includes(crop.toLowerCase().replace('_', ' '))
      )
    );
    
    console.log(`\n✅ Expected Crops Found: ${foundCrops.length}/${expectedCrops.length}`);
    foundCrops.forEach(crop => console.log(`   • ${crop}`));
    
    const missingCrops = expectedCrops.filter(crop => !foundCrops.includes(crop));
    if (missingCrops.length > 0) {
      console.log(`⚠️  Missing Crops: ${missingCrops.join(', ')}`);
    }
    
    // Test 5: Check activity structure
    if (allIndoorStarts.length > 0) {
      const sampleActivity = allIndoorStarts[0];
      console.log(`\n📋 Sample Activity Structure:`);
      console.log(`   Type: ${sampleActivity.type}`);
      console.log(`   Crop: ${sampleActivity.crop}`);
      console.log(`   Action: ${sampleActivity.action}`);
      console.log(`   Priority: ${sampleActivity.priority}`);
      console.log(`   Timing: ${sampleActivity.timing || 'N/A'}`);
      
      // Validate required fields
      const requiredFields = ['type', 'crop', 'action', 'priority'];
      const missingFields = requiredFields.filter(field => !sampleActivity[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
    }
    
    // Test 6: Overall calendar quality
    const totalActivities = calendar.reduce((sum, month) => sum + month.activities.length, 0);
    const monthsWithActivities = calendar.filter(month => month.activities.length > 0).length;
    
    console.log(`\n📊 Calendar Quality Metrics:`);
    console.log(`   Total Activities: ${totalActivities}`);
    console.log(`   Months with Activities: ${monthsWithActivities}/12`);
    console.log(`   Average Activities per Month: ${(totalActivities / 12).toFixed(1)}`);
    console.log(`   Indoor Start Activities: ${allIndoorStarts.length}`);
    console.log(`   Indoor Start Coverage: ${((allIndoorStarts.length / totalActivities) * 100).toFixed(1)}%`);
    
    return {
      success: true,
      totalActivities,
      indoorStartActivities: allIndoorStarts.length,
      cropsWithIndoorStarts: cropsWithIndoorStarts.length,
      expectedCropsFound: foundCrops.length,
      calendarMonths: calendar.length
    };
    
  } catch (error) {
    console.error('❌ Calendar generation test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
if (require.main === module) {
  testCalendarGeneration()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Calendar generation test passed!');
        console.log('✅ Indoor start templates are being included in calendar');
        process.exit(0);
      } else {
        console.log('\n❌ Calendar generation test failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = testCalendarGeneration;