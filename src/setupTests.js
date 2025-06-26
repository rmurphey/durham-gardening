// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock fetch for testing
global.fetch = jest.fn();

// Mock sql.js to prevent WASM loading issues in tests
jest.mock('sql.js', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    Database: jest.fn(() => ({
      exec: jest.fn(() => []),
      close: jest.fn()
    }))
  }))
}));