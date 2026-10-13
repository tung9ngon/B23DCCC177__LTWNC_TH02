import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  // Chỉ đo coverage thư mục features/ nên ngưỡng global chính là ngưỡng của features/
  collectCoverageFrom: ['src/features/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}'],
  coverageThreshold: {
    global: { statements: 70 },
  },
};

export default config;
