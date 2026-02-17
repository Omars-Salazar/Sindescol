export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/config/db.js' // Excluir config de BD
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  moduleFileExtensions: ['js', 'json'],
  testTimeout: 10000,
  verbose: true,
  bail: false,
  coverage: {
    reporter: ['text', 'lcov', 'html'],
    threshold: {
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50
    }
  }
};
