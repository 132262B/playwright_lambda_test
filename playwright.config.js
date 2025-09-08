const { defineConfig } = require('@playwright/test');
const fs = require('fs');

// Lambda 환경 감지 및 설정
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

// Lambda 환경 설정
if (isLambda) {
  process.env.HOME = '/tmp';
  process.env.XDG_CONFIG_HOME = '/tmp';
  process.env.XDG_CACHE_HOME = '/tmp';
  process.env.XDG_DATA_HOME = '/tmp';
  process.env.XDG_STATE_HOME = '/tmp';
  process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/ms-playwright';
  process.env.FONTCONFIG_PATH = '/tmp';

  // test-results 디렉터리 생성
  if (!fs.existsSync('/tmp/test-results')) {
    fs.mkdirSync('/tmp/test-results', { recursive: true });
  }
}

// 브라우저 실행 파일 경로 찾기
function getExecutablePath() {
  if (!isLambda) return undefined;
  
  try {
    if (fs.existsSync('/opt/ms-playwright')) {
      const items = fs.readdirSync('/opt/ms-playwright');
      const chromiumDir = items.find(d => d.startsWith('chromium-'));
      if (chromiumDir) {
        return `/opt/ms-playwright/${chromiumDir}/chrome-linux/chrome`;
      }
    }
  } catch (error) {
    console.warn('Browser path detection failed:', error.message);
  }
  return undefined;
}

module.exports = defineConfig({
  testDir: './',
  timeout: isLambda ? 60_000 : 30_000,
  workers: 1,
  fullyParallel: false,
  outputDir: isLambda ? '/tmp/test-results' : './test-results',
  reporter: [['list']],
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
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
        ...(isLambda ? [
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