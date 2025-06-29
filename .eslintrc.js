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
      rules: {
        'max-lines': ['error', { max: 400 }],
        'complexity': ['warn', { max: 12 }]
      }
    },
    {
      // Extra strict for known complex components
      files: ['src/components/**/Dashboard*.js', 'src/components/**/CompactSettings*.js'],
      rules: {
        'max-lines': ['error', { max: 350 }],
        'complexity': ['error', { max: 10 }]
      }
    }
  ]
};