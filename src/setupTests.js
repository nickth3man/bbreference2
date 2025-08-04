// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock Blob constructor
global.Blob = jest.fn((content, options) => ({
  content,
  options,
  size: content ? content.join('').length : 0,
  type: options ? options.type : ''
}));

// Mock document.createElement for link elements
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: jest.fn(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn()
    };
  }
  return originalCreateElement(tagName);
});
