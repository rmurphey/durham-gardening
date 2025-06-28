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
    'no-unused-vars': 'error'
  }
};