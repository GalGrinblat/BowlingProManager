// Jest configuration for TypeScript and React
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testMatch: [
    '**/?(*.)+(test).[jt]s?(x)'
  ],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{js,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './src/utils/matchUtils.ts': { branches: 90, functions: 90, lines: 90, statements: 90 },
    './src/utils/standingsUtils.ts': { branches: 90, functions: 90, lines: 90, statements: 90 },
    './src/utils/scheduleUtils.ts': { branches: 90, functions: 90, lines: 90, statements: 90 },
  },
};
