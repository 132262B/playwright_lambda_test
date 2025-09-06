const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Set Playwright browser path for Lambda environment
if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/ms-playwright';
}

exports.runTest = async (event) => {
  console.log('Starting offercent-login.test execution...');
  console.log('PLAYWRIGHT_BROWSERS_PATH:', process.env.PLAYWRIGHT_BROWSERS_PATH);
  
  // Debug: List browser directories
  if (fs.existsSync('/opt/ms-playwright')) {
    console.log('/opt/ms-playwright contents:', fs.readdirSync('/opt/ms-playwright'));
  }
  if (fs.existsSync('/tmp/.cache/ms-playwright')) {
    console.log('/tmp/.cache/ms-playwright contents:', fs.readdirSync('/tmp/.cache/ms-playwright'));
  }

  try {
    // Find Chromium executable path in Lambda environment
    let executablePath;
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // Lambda environment - use /opt path
      executablePath = '/opt/ms-playwright/chromium-1187/chrome-linux/chrome';
    }

    // Playwright API를 직접 사용 - Lambda 최적화된 설정
    const browser = await chromium.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-default-apps',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-web-security',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
        '--disable-logging',
        '--disable-gl-drawing-for-tests',
        '--password-store=basic',
        '--use-mock-keychain',
        '--enable-automation',
        '--disable-blink-features=AutomationControlled'
      ],
    });

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
    });
    
    const page = await context.newPage();

    // 테스트 로직 실행
    await page.goto('https://offercent.co.kr/company-list?jobCategories=0010001');
    await page.waitForLoadState('networkidle');

    const loginButton = page.locator('text=로그인').or(
      page.locator('[data-testid*="login"]')
    ).or(
      page.locator('button:has-text("로그인")')
    ).or(
      page.locator('a:has-text("로그인")')
    ).first();

    await loginButton.waitFor({ state: 'visible' });
    await loginButton.click();
    await page.waitForTimeout(1000);

    const growthText = page.locator('text=성장하는 기업들의 채용 소식');
    await growthText.waitFor({ state: 'visible' });

    const kakaoLoginButton = page.locator('text=카카오 로그인').or(
      page.locator('button:has-text("카카오 로그인")')
    ).or(
      page.locator('[data-testid*="kakao"]')
    ).or(
      page.locator('button:has-text("카카오")')
    );
    
    await kakaoLoginButton.waitFor({ state: 'visible' });

    await context.close();
    await browser.close();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Offercent login test executed successfully',
        timestamp: new Date().toISOString(),
        testResults: {
          output: '✅ 로그인 모달창에서 모든 요소가 정상적으로 확인되었습니다.',
          passed: true,
          failed: false,
        },
        success: true,
      }),
    };
  } catch (error) {
    console.error('Test execution failed:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test execution failed',
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        success: false,
      }),
    };
  }
};
exports.version = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'v2.0.1-playwright-lambda-test',
      timestamp: new Date().toISOString(),
      message: 'Playwright Lambda Test Service'
    }),
  };
};