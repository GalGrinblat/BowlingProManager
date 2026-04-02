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
      branches: 15,
      functions: 25,
      lines: 35,
      statements: 35,
    },
    './src/utils/matchUtils.ts': { branches: 80, functions: 95, lines: 90, statements: 90 },
    './src/utils/standingsUtils.ts': { branches: 65, functions: 95, lines: 90, statements: 90 },
    './src/utils/scheduleUtils.ts': { branches: 75, functions: 95, lines: 90, statements: 90 },
  },
};
