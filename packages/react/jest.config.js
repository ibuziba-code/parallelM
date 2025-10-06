const config = {
  displayName: 'react',
  rootDir: '../..',
  roots: ['packages/react'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/packages/react/node_modules/babel-jest',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/packages/react/jest/fileTransform.js',
  },
}

module.exports = config
