module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
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
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  verbose: true,
  // transformIgnorePatterns: ['node_modules/'], // 모든 node_modules 변환 무시
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
      },
    }
  ]
}; 