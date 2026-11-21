import { defineConfig } from '@playwright/test';

// `npm run perf`: times set scenes and rewrites PERF.md. A report, not a test: see perf/perf.spec.ts.
export default defineConfig({
  testDir: 'perf',
  timeout: 300_000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:5181', trace: 'off' },
  webServer: { command: 'npx vite --port 5181 --strictPort', url: 'http://localhost:5181', reuseExistingServer: true },
  projects: [{ name: 'phone-portrait', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } }],
});
