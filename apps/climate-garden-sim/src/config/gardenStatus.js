/**
 * GARDEN STATUS CONFIGURATION
 * =========================== 
 * 
 * UPDATE THIS FILE when your garden changes!
 * 
 * This controls which activities appear in your garden calendar:
 * - Only shows harvest/care activities for crops you actually have
 * - Only shows planting suggestions for crops you want but don't have
 * - Hides everything for crops you don't want to grow
 * 
 * HOW TO UPDATE:
 * 1. Change the 'lastUpdated' date
 * 2. Move crops between the arrays as your garden changes
 * 3. Save the file - changes appear immediately
 */

export const CURRENT_GARDEN_STATUS = {
  // Date this status was last updated (YYYY-MM-DD format)
  lastUpdated: '2025-06-23',
  
  /**
   * GROWING: Crops currently planted and healthy in your garden
   * 
   * Effect: Shows harvest, care, and maintenance activities
   * 
   * Available crop names:
   * - Heat lovers: 'hotPeppers', 'sweetPotato', 'cantaloupe', 'cucumber', 'tomatillo', 'okra'
   * - Cool season: 'kale', 'lettuce', 'spinach', 'cabbage'  
   * - Perennials: 'herbs', 'asparagus'
   * - Others: 'squash', 'tomato', 'basil'
   */
  growing: [
    'hotPeppers',    // Shows: harvest reminders, support needs, heat care
    'sweetPotato',   // Shows: vine management, fall harvest timing
    'cantaloupe',    // Shows: ripeness checking, fruit support
    'cucumber',      // Shows: daily harvest, vine support
    'tomatillo',     // Shows: harvest timing, plant support
    'herbs'          // Shows: harvesting, pruning, maintenance
  ],
  
  /**
   * DYING: Crops that are failing and need cleanup
   * 
   * Effect: Shows cleanup and replacement activities
   */
  dying: [
    'squash'         // Shows: removal instructions, succession planting
  ],
  
  /**
   * NOT WANTED: Crops you don't want to see recommendations for
   * 
   * Effect: Completely hides all activities (shopping, planting, care, harvest)
   * Use this for crops you never want to grow
   */
  notWanted: [
    'okra',          // Hide: all okra activities (you said no okra!)
    'asparagus',     // Hide: asparagus planting/care (perennial commitment)
    'kale',          // Hide: cool season planting suggestions  
    'lettuce'        // Hide: lettuce succession planting
  ],
  
  /**
   * NOTES: Your garden preferences (for reference only)
   * This doesn't affect the calendar, just documents your setup
   */
  notes: {
    gardenType: 'above-ground beds and planters',
    climate: 'Durham, NC - Zone 7b',
    focus: 'Heat-tolerant summer crops, no cool season currently',
    lastMajorChange: 'June 2025 - removed failing squash, focus on successful heat crops'
  }
};

/**
 * EXAMPLES OF COMMON CHANGES:
 * 
 * When you plant something new:
 *   1. Remove it from 'notWanted' (if it was there)
 *   2. Add it to 'growing'
 *   3. Update 'lastUpdated'
 * 
 * When a crop fails:
 *   1. Move it from 'growing' to 'dying' 
 *   2. Calendar will show cleanup activities
 *   3. After cleanup, move to 'notWanted' if you don't want to try again
 * 
 * When you decide you don't want a crop:
 *   1. Remove from 'growing' (if it was there)
 *   2. Add to 'notWanted'
 *   3. All activities for that crop disappear from calendar
 */

/**
 * Helper function to check if a crop should have activities shown
 * @param {string} cropKey - The crop identifier
 * @param {string} activityType - Type of activity (harvest, care, shopping, etc.)
 * @returns {boolean} Whether to show this activity
 */
export const shouldShowCropActivity = (cropKey, activityType) => {
  const status = CURRENT_GARDEN_STATUS;
  const normalizedKey = cropKey.toLowerCase();
  
  // Never show activities for crops we don't want
  if (status.notWanted.some(crop => 
    normalizedKey.includes(crop.toLowerCase()) || 
    crop.toLowerCase().includes(normalizedKey)
  )) {
    return false;
  }
  
  // Show cleanup activities for dying crops
  if (activityType === 'cleanup' && status.dying.some(crop => 
    normalizedKey.includes(crop.toLowerCase())
  )) {
    return true;
  }
  
  // Show care/harvest activities only for growing crops
  if (['harvest', 'care'].includes(activityType)) {
    return status.growing.some(crop => 
      normalizedKey.includes(crop.toLowerCase()) || 
      crop.toLowerCase().includes(normalizedKey)
    );
  }
  
  // Show planting/shopping activities only for crops we want but don't have
  if (['shopping', 'direct-sow', 'transplant', 'indoor-starting'].includes(activityType)) {
    const isGrowing = status.growing.some(crop => 
      normalizedKey.includes(crop.toLowerCase())
    );
    const isNotWanted = status.notWanted.some(crop => 
      normalizedKey.includes(crop.toLowerCase())
    );
    return !isGrowing && !isNotWanted;
  }
  
  return true; // Default to showing rotation/general activities
};