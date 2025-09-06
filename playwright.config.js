// playwright.config.js
const { defineConfig } = require('@playwright/test');
const path = require('path');

// Lambda 환경에서 브라우저 실행 파일 경로 설정
function getExecutablePath() {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // 환경 변수에서 설정된 경로 사용 (handler.js에서 설정)
    if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
      return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
    }
    
    // 대안으로 직접 경로 탐색
    const fs = require('fs');
    if (fs.existsSync('/opt/ms-playwright')) {
      const items = fs.readdirSync('/opt/ms-playwright');
      const chromiumDirs = items.filter(d => d.startsWith('chromium-'));
      
      if (chromiumDirs.length > 0) {
        return `/opt/ms-playwright/${chromiumDirs[0]}/chrome-linux/chrome`;
      }
    }
  }
  // 로컬 환경에서는 기본 Playwright 브라우저 사용
  return undefined;
}

module.exports = defineConfig({
  testDir: './',
  timeout: 60_000, // Lambda 환경에서 더 긴 타임아웃
  workers: 1,
  fullyParallel: false,
  outputDir: '/tmp/test-results', // Lambda 환경에서 /tmp 디렉터리 사용
  globalTeardown: undefined,
  globalSetup: undefined,
  reporter: [['list']], // 간단한 리포터 사용
  use: {
    headless: true,
    ignoreHTTPSErrors: true ,
    launchOptions: {
      executablePath: getExecutablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-zygote',
        '--single-process',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-plugins',
        '--disable-logging',
        '--no-first-run',
        '--password-store=basic',
        '--use-mock-keychain',
        ...(process.env.AWS_LAMBDA_FUNCTION_NAME ? [
          '--disable-background-networking',
          '--disable-background-mode',
          '--disable-device-discovery-notifications',
          '--disable-gl-drawing-for-tests',
          '--disable-images',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--ignore-certificate-errors-spki-list',
          '--ignore-certificate-error-log'
        ] : [])
      ],
    },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});