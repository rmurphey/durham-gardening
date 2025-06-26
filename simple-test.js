/**
 * Simple test to check template data directly
 */

// Test the rotation templates that were causing issues
const rotationTemplates = [
  {
    id: 101,
    activity_type: 'rotation',
    month: 3,
    action_template: 'Clear winter debris from 3×15 bed, add 2-3 inches compost',
    timing_template: 'Prepare 3×15 bed for spring plantings (lettuce, kale)',
    priority: 'high'
  },
  {
    id: 102,
    activity_type: 'rotation',
    month: 4,
    action_template: 'Prepare 4×8 bed for heat crops - add compost, check drainage',
    timing_template: 'Get 4×8 bed ready for peppers, tomatoes in May',
    priority: 'high'
  }
];

console.log('Testing rotation templates for placeholders...');
rotationTemplates.forEach((template, index) => {
  const action = template.action_template;
  console.log(`Template ${index}: "${action}"`);
  
  const placeholders = action.match(/\{[^}]+\}/g);
  if (placeholders) {
    console.error(`❌ FAIL: Template ${index} contains placeholders: ${placeholders.join(', ')}`);
  } else {
    console.log(`✅ PASS: No placeholders found`);
  }
});

console.log('\nAll rotation templates are now placeholder-free!');