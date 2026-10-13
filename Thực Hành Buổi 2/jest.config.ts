import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  // Chỉ đo coverage thư mục features/; kiểu Config bắt buộc có khoá global nên để trống
  collectCoverageFrom: ['src/features/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}'],
  coverageThreshold: {
    global: {},
    './src/features/': { statements: 70 },
  },
};

export default config;
