const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

// next-intl y sus dependencias solo se publican como ESM: se transforman en lugar de ignorarse.
const ESM_PACKAGES = ['next-intl', 'use-intl', '@formatjs', 'intl-messageformat', '@schummar'];

module.exports = async () => {
  const config = await createJestConfig(customJestConfig)()
  config.transformIgnorePatterns = [
    `/node_modules/(?!(${ESM_PACKAGES.join('|')})/)`,
    '^.+\.module\.(css|sass|scss)$',
  ]
  return config
}
