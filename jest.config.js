export default {
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
  testPathIgnorePatterns: ['/node_modules/']
};
