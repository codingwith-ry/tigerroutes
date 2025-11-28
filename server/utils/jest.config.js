module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  verbose: true,
  // Ensure Jest searches from the `server` directory so server/__tests__ is found
  rootDir: '..'
};
