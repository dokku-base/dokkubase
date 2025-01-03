import { vi, afterEach } from 'vitest';

// Mock env variables
process.env.ADMIN_TOKEN = 'test-token-123';

// Mock console methods
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

// Clean up after each test
afterEach(() => {
    vi.clearAllMocks();
});
