// playwright.config.js
const { defineConfig, chromium } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  timeout: 30_000,
  workers: 1,
  fullyParallel: false,
  outputDir: '/tmp/test-results',
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    launchOptions: {
      executablePath: chromium.executablePath(), // 번들 Chromium 강제
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--password-store=basic',
        '--use-mock-keychain',
        '--disable-web-security',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors-spki-list',
        '--ignore-certificate-error-log',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-background-networking',
        '--disable-background-mode',
        '--disable-device-discovery-notifications',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--no-zygote',
        '--single-process',
        '--disable-logging',
        '--disable-gl-drawing-for-tests',
      ],
    },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});