/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@agent/(.*)$': '<rootDir>/src/agent/$1',
    '^@voice/(.*)$': '<rootDir>/src/voice/$1',
    '^@tools/(.*)$': '<rootDir>/src/tools/$1',
    '^@prompts/(.*)$': '<rootDir>/src/prompts/$1',
    '^@workflows/(.*)$': '<rootDir>/src/workflows/$1',
    '^@memory/(.*)$': '<rootDir>/src/memory/$1',
    '^@intelligence/(.*)$': '<rootDir>/src/intelligence/$1',
    '^@events/(.*)$': '<rootDir>/src/events/$1',
    '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
  },
};
