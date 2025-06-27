/**
 * Default Garden Configuration (Zone 7b Example)
 * Template configuration for temperate climate gardening
 */

// Default garden configuration - Zone 7b temperate climate
export const DEFAULT_CONFIG = {
  name: 'Zone 7b Location',
  zipCode: '27707',
  hardiness: '7b',
  lat: 35.994,
  lon: -78.8986,
  
  // Zone 7b climate characteristics
  lastFrost: 'April 15', // Average last frost date
  firstFrost: 'November 15', // Average first frost date
  growingSeasonDays: 214,
  
  // Typical Zone 7b soil characteristics
  soil: {
    type: 'Clay-heavy, often compacted',
    drainage: 'Poor when wet, hard when dry',
    pH: '6.0-6.8 typical',
    amendments: 'Needs regular compost, avoid working when wet'
  },
  
  // Zone 7b weather patterns
  climate: {
    summerHigh: '95-105°F extreme heat days',
    winterLow: '15-25°F typical lows',
    humidity: 'High summer humidity',
    rainfall: '46 inches annual, summer thunderstorms',
    heatWaves: 'Extended 95°F+ periods common'
  },
  
  // Local suppliers and varieties
  suppliers: {
    seeds: [
      'True Leaf Market (online) - proven varieties',
      'Southern Exposure Seed Exchange - heirloom varieties',
      'Lowes/Home Depot - basic varieties'
    ],
    transplants: [
      'Garden Supply Company (Durham)',
      'Atlantic Avenue Orchid & Garden (Raleigh)',
      'Farmers markets (April-May)'
    ]
  }
};

// Durham-optimized crop database
export const DEFAULT_CROPS = {
  // HEAT CHAMPIONS - thrive in Durham summers
  heatLovers: {
    okra: {
      name: 'Okra',
      varieties: {
        'Clemson Spineless': 'Classic reliable variety, widely available',
        'Red Burgundy': 'Beautiful red pods, excellent performance',
        'Hill Country Heirloom Red': 'Texas variety, handles NC heat perfectly'
      },
      planting: {
        method: 'Direct sow seeds',
        timing: 'May 1-15 (soil 65°F+)',
        spacing: '12-18 inches apart',
        depth: '1/2 to 1 inch',
        germination: '7-14 days'
      },
      harvest: {
        firstHarvest: '60-70 days from seed',
        peakSeason: 'July-September',
        frequency: 'Daily harvest when 3-4 inches long',
        yield: '15-20 lbs per plant'
      },
      shopping: {
        seeds: '1 packet (30 seeds) plants 25 feet',
        cost: '$3-4 per packet',
        where: 'True Leaf Market, local stores'
      }
    },

    hotPeppers: {
      name: 'Hot Peppers',
      varieties: {
        'Carolina Reaper': 'World hottest, NC original variety',
        'Fish Pepper': 'Heirloom, thrives in humidity',
        'Datil': 'Florida variety, excellent for NC',
        'Hungarian Hot Wax': 'Mild heat, very productive'
      },
      planting: {
        method: 'Start transplants indoors',
        timing: 'Start seeds March 1, transplant May 15',
        spacing: '18-24 inches apart',
        depth: 'Transplant at soil level',
        germination: '10-21 days (needs heat mat)'
      },
      harvest: {
        firstHarvest: '75-90 days from transplant',
        peakSeason: 'August-October',
        frequency: 'Pick regularly to encourage production',
        yield: '1-3 lbs per plant'
      },
      shopping: {
        seeds: '1 packet (25 seeds) for 20+ plants',
        transplants: '$3-5 each at garden centers',
        cost: '$3-4 per packet',
        where: 'Specialty suppliers for best varieties'
      }
    },

    sweetPotato: {
      name: 'Sweet Potato',
      varieties: {
        'Beauregard': 'Standard variety, widely available',
        'Centennial': 'Compact vines, good for smaller spaces',
        'Georgia Jet': 'Early variety (90 days), good for zone 7'
      },
      planting: {
        method: 'Plant slips (rooted cuttings)',
        timing: 'May 15-30 (soil consistently warm)',
        spacing: '12-18 inches apart, rows 3 feet',
        depth: 'Bury 2/3 of slip',
        source: 'Buy slips or grow from sweet potato'
      },
      harvest: {
        firstHarvest: '100-120 days from planting',
        timing: 'Before first frost (late September)',
        method: 'Dig carefully, cure in sun',
        yield: '3-5 lbs per plant'
      },
      shopping: {
        slips: '10-15 slips per 100 sq ft',
        cost: '$1-2 per slip',
        where: 'Garden centers (May), online suppliers'
      }
    }
  },

  // COOL SEASON CHAMPIONS - for spring/fall/winter
  coolSeason: {
    kale: {
      name: 'Kale',
      varieties: {
        'Winterbor': 'Very cold hardy, survives Durham winters',
        'Red Russian': 'Beautiful purple stems, mild flavor',
        'Lacinato (Dinosaur)': 'Heat tolerant, good texture',
        'White Russian': 'Tender, good for salads'
      },
      planting: {
        spring: 'February 15 - March 15',
        fall: 'August 1 - September 1',
        method: 'Direct sow or transplants',
        spacing: '8-12 inches apart',
        depth: '1/4 to 1/2 inch'
      },
      harvest: {
        spring: 'April-June (before heat)',
        fall: 'October-March (overwinters)',
        method: 'Cut outer leaves, leave center growing',
        note: 'Sweetest after frost'
      },
      shopping: {
        seeds: '1 packet plants 50+ feet',
        cost: '$3-4 per packet',
        succession: 'Plant every 3-4 weeks'
      }
    },

    lettuce: {
      name: 'Lettuce',
      varieties: {
        'Black Seeded Simpson': 'Heat tolerant for Durham',
        'Red Sails': 'Beautiful color, bolt resistant',
        'Buttercrunch': 'Head lettuce for cool weather',
        'Salad Bowl Mix': 'Cut-and-come-again mix'
      },
      planting: {
        spring: 'February 1 - March 15, September 15 - October 15',
        method: 'Direct sow every 2 weeks',
        spacing: '4-6 inches apart',
        depth: '1/4 inch'
      },
      harvest: {
        baby: '30 days from seed',
        mature: '50-70 days',
        method: 'Cut-and-come-again or whole heads',
        note: 'Bolts quickly in Durham heat'
      },
      shopping: {
        seeds: '1 packet for multiple successions',
        cost: '$2-3 per packet',
        succession: 'Every 2 weeks'
      }
    }
  },

  // PERENNIAL POWERHOUSES - plant once, harvest for years
  perennials: {
    asparagus: {
      name: 'Asparagus',
      varieties: {
        'Jersey Knight': 'All-male hybrid, high yields',
        'Purple Passion': 'Beautiful purple spears',
        'Mary Washington': 'Heirloom variety'
      },
      planting: {
        timing: 'March-April (dormant crowns)',
        spacing: '18 inches apart, rows 4 feet',
        depth: '6-8 inches deep',
        establishment: '2-3 years before full harvest'
      },
      harvest: {
        season: 'April-May in Durham',
        method: 'Cut spears at soil level',
        duration: '6-8 weeks',
        yield: '1-2 lbs per plant when established'
      },
      shopping: {
        crowns: '1-year crowns preferred',
        cost: '$5-8 per crown',
        quantity: '5-10 crowns for family'
      }
    }
  }
};

// Durham planting calendar - month by month
export const DEFAULT_CALENDAR = {
  january: {
    planning: 'Order seeds, plan garden layout',
    indoor: 'Start onion seeds indoors',
    outdoor: 'Harvest overwintered kale, prepare beds when dry'
  },
  february: {
    indoor: 'Start peppers and tomatoes with heat mat',
    outdoor: 'Direct sow kale, lettuce, spinach (mid-month)',
    soil: 'Add compost to beds (only when soil not muddy)'
  },
  march: {
    indoor: 'Continue pepper/tomato starts',
    outdoor: 'Plant onion sets, direct sow more cool crops',
    prep: 'Set up irrigation, harden off transplants'
  },
  april: {
    transplant: 'Transplant cool season crops',
    outdoor: 'Direct sow beans after mid-month',
    prep: 'Install shade cloth framework'
  },
  may: {
    transplant: 'Transplant peppers, tomatoes after soil warms',
    outdoor: 'Direct sow okra, plant sweet potato slips',
    care: 'Mulch heavily, set up shade cloth'
  },
  june: {
    harvest: 'Harvest spring crops before they bolt',
    care: 'Deep water heat-loving crops',
    planning: 'Order fall seeds'
  },
  july: {
    harvest: 'Daily okra harvest, regular pepper picking',
    care: 'Maintain shade and mulch',
    survival: 'Keep plants alive in extreme heat'
  },
  august: {
    planting: 'Start fall transplants indoors',
    harvest: 'Peak summer harvest',
    prep: 'Prepare fall beds'
  },
  september: {
    transplant: 'Transplant fall crops',
    harvest: 'Continue summer harvest',
    planning: 'Plan winter garden'
  },
  october: {
    harvest: 'Fall harvest begins, sweet potatoes before frost',
    planting: 'Last chance for quick cool crops',
    prep: 'Prepare for winter'
  },
  november: {
    harvest: 'Kale sweetens after frost',
    cleanup: 'Clean up spent summer crops',
    protection: 'Cover tender plants'
  },
  december: {
    harvest: 'Winter harvest of hardy greens',
    planning: 'Plan next year, order early seeds',
    maintenance: 'Tool maintenance, planning'
  }
};

// Legacy exports for backward compatibility
export const DURHAM_CONFIG = DEFAULT_CONFIG;
export const DURHAM_CROPS = DEFAULT_CROPS; 
export const DURHAM_CALENDAR = DEFAULT_CALENDAR;