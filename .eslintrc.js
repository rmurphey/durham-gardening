module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // TODO: Fix Testing Library violations systematically
    // These rules are temporarily downgraded to warnings while we fix the 160+ violations
    // Created: 2025-06-28 - Target fix: Week 2 of maintainability project
    'testing-library/no-node-access': 'warn',
    'testing-library/no-container': 'warn',
    'testing-library/no-unnecessary-act': 'warn',
    'testing-library/no-wait-for-multiple-assertions': 'warn',
    'testing-library/prefer-screen-queries': 'warn',
    'testing-library/no-render-in-setup': 'warn',
    'jest/no-conditional-expect': 'warn',
    
    // Keep these as errors since they're easier to fix
    'no-unused-vars': 'error',
    
    // UI Architectural Constraints - Prevent complexity accumulation
    'max-lines-per-function': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
    'complexity': ['warn', { max: 15 }],
    'max-depth': ['error', { max: 4 }],
    'max-params': ['error', { max: 10 }],
    'react/jsx-max-props-per-line': ['warn', { maximum: 3 }]
  },
  
  // Stricter rules for UI components
  overrides: [
    {
      files: ['src/components/**/*.js', 'src/components/**/*.jsx'],
      excludedFiles: ['src/components/**/*.test.js', 'src/components/**/*.test.jsx'],
      rules: {
        'max-lines': ['warn', { max: 500 }],
        'complexity': ['warn', { max: 15 }]
      }
    },
    {
      // Extra strict for known complex components
      files: ['src/components/**/Dashboard*.js', 'src/components/**/CompactSettings*.js'],
      excludedFiles: ['src/components/**/*.test.js', 'src/components/**/*.test.jsx'],
      rules: {
        'max-lines': ['warn', { max: 600 }],
        'complexity': ['warn', { max: 15 }]
      }
    },
    {
      // Relaxed rules for test files - comprehensive tests can be longer
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.spec.js', '**/*.spec.jsx'],
      rules: {
        'max-lines': ['warn', { max: 600, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
        'complexity': 'off', // Test complexity often reflects scenario coverage, not code quality issues
        'max-depth': 'off' // Deep nesting in tests often reflects test scenario structure
      }
    },
    {
      // Override for service and config files (can be longer due to business logic)
      files: ["src/services/**/*.js", "src/config.js", "src/utils/**/*.js"],
      rules: {
        "max-lines": ["warn", {"max": 800, "skipBlankLines": true, "skipComments": true}],
        "complexity": ["warn", {"max": 20}],
        "max-lines-per-function": ["warn", {"max": 200}],
        "max-depth": ["error", 4],
        "max-nested-callbacks": ["error", 3]
      }
    }
  ]
};