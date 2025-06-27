// Additional ESLint rules for function parameter safety
module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    // Require JSDoc comments for exported functions
    'valid-jsdoc': ['error', {
      requireReturn: true,
      requireParamDescription: true,
      requireReturnDescription: true
    }],
    'require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: false,
        ArrowFunctionExpression: false,
        FunctionExpression: false
      }
    }],
    // Prevent parameter reassignment
    'no-param-reassign': ['error', { props: false }],
    // Require default parameters for optional params
    'default-param-last': 'error'
  }
};