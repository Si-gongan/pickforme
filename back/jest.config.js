module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^models$': '<rootDir>/src/models',
    '^models/(.*)$': '<rootDir>/src/models/$1',
    '^utils$': '<rootDir>/src/utils',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^scheduler$': '<rootDir>/src/scheduler',
    '^scheduler/(.*)$': '<rootDir>/src/scheduler/$1',
    '^socket$': '<rootDir>/src/socket.ts',
    '^socket/(.*)$': '<rootDir>/src/socket.ts',
  },
  verbose: true,
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/**/*.unit.test.ts'],
      moduleNameMapper: {
        '^models$': '<rootDir>/src/models',
        '^models/(.*)$': '<rootDir>/src/models/$1',
        '^utils$': '<rootDir>/src/utils',
        '^utils/(.*)$': '<rootDir>/src/utils/$1',
        '^scheduler$': '<rootDir>/src/scheduler',
        '^scheduler/(.*)$': '<rootDir>/src/scheduler/$1',
        '^socket$': '<rootDir>/src/socket.ts',
        '^socket/(.*)$': '<rootDir>/src/socket.ts',
        '^services$': '<rootDir>/src/services',
        '^services/(.*)$': '<rootDir>/src/services/$1',
      },
    },
    {
      displayName: 'integration',
      testMatch: ['**/__tests__/**/*.integration.test.ts'],
      moduleNameMapper: {
        '^models$': '<rootDir>/src/models',
        '^models/(.*)$': '<rootDir>/src/models/$1',
        '^utils$': '<rootDir>/src/utils',
        '^utils/(.*)$': '<rootDir>/src/utils/$1',
        '^scheduler$': '<rootDir>/src/scheduler',
        '^scheduler/(.*)$': '<rootDir>/src/scheduler/$1',
        '^socket$': '<rootDir>/src/socket.ts',
        '^socket/(.*)$': '<rootDir>/src/socket.ts',
        '^services$': '<rootDir>/src/services',
        '^services/(.*)$': '<rootDir>/src/services/$1',
      }
    }
  ]
}; 