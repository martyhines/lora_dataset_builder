import '@testing-library/jest-dom';

// Mock Firebase modules for testing
vi.mock('../services/firebase', () => ({
  auth: {},
  db: {},
  storage: {}
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL.createObjectURL for file testing
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();