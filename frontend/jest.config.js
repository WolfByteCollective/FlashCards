// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",              // Transforms TypeScript files
    "^.+\\.(js|jsx|mjs)$": "babel-jest",       // Transforms JavaScript files, including ES modules
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(axios|other-esm-dependency)/)", // Ensures axios is transformed
  ],
  setupFilesAfterEnv: ["frontend/jest.setup.js"],     // Ensures Jest setup file is loaded
};
