// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:8000',
    screenshot: 'off',
    trace: 'off',
  },

  projects: [
    {
      name: 'desktop',
      grep: /Desktop/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile',
      grep: /Mobile/,
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
      },
    },
  ],

  webServer: {
    command: 'python -m http.server 8000',
    port: 8000,
    reuseExistingServer: true,
    timeout: 10000,
  },
});
