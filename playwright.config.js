import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5174',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev -w server',
      url: 'http://localhost:3001/api/ping',
      reuseExistingServer: !process.env.CI,
    },
    {
      // Port 5174 is dedicated to e2e — avoids conflicts with the dev server on 5173
      command: 'npm run dev -w client -- --port 5174',
      url: 'http://localhost:5174',
      reuseExistingServer: false,
    },
  ],
});
