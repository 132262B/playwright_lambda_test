const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Lambda 환경에서 Playwright 브라우저 설정
function setupPlaywrightEnvironment() {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // Lambda 환경 설정
    process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/ms-playwright';
    process.env.HOME = '/tmp';
    process.env.XDG_CONFIG_HOME = '/tmp';
    process.env.XDG_CACHE_HOME = '/tmp';
    process.env.XDG_DATA_HOME = '/tmp';
    process.env.XDG_STATE_HOME = '/tmp';
    process.env.FONTCONFIG_PATH = '/tmp';
    
    // 브라우저 실행 파일 경로 확인 및 설정
    try {
      if (fs.existsSync('/opt/ms-playwright')) {
        const items = fs.readdirSync('/opt/ms-playwright');
        const chromiumDirs = items.filter(d => d.startsWith('chromium-'));
        
        if (chromiumDirs.length > 0) {
          const chromiumPath = `/opt/ms-playwright/${chromiumDirs[0]}/chrome-linux/chrome`;
          if (fs.existsSync(chromiumPath)) {
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = chromiumPath;
            console.log('Chromium executable found:', chromiumPath);
          }
        }
      }
    } catch (error) {
      console.warn('Could not locate chromium executable:', error.message);
    }
  }
}

exports.runTest = async (event) => {
  console.log('Starting offercent-login.test execution...');
  
  // Playwright 환경 설정
  setupPlaywrightEnvironment();
  
  // Lambda 환경에서 필요한 디렉터리 생성
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      if (!fs.existsSync('/tmp/test-results')) {
        fs.mkdirSync('/tmp/test-results', { recursive: true });
      }
    } catch (error) {
      console.warn('Could not create test-results directory:', error.message);
    }
  }
  
  console.log('Environment variables:');
  console.log('PLAYWRIGHT_BROWSERS_PATH:', process.env.PLAYWRIGHT_BROWSERS_PATH);
  console.log('PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH:', process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH);
  console.log('HOME:', process.env.HOME);
  
  // Debug: 브라우저 디렉터리 내용 확인
  if (fs.existsSync('/opt/ms-playwright')) {
    console.log('/opt/ms-playwright contents:', fs.readdirSync('/opt/ms-playwright'));
    
    // chromium 디렉터리 확인
    const chromiumDirs = fs.readdirSync('/opt/ms-playwright').filter(d => d.startsWith('chromium-'));
    if (chromiumDirs.length > 0) {
      const chromiumPath = `/opt/ms-playwright/${chromiumDirs[0]}`;
      if (fs.existsSync(chromiumPath)) {
        console.log(`${chromiumPath} contents:`, fs.readdirSync(chromiumPath));
        
        const chromeLinuxPath = `${chromiumPath}/chrome-linux`;
        if (fs.existsSync(chromeLinuxPath)) {
          console.log(`${chromeLinuxPath} contents:`, fs.readdirSync(chromeLinuxPath));
        }
      }
    }
  }

  return new Promise((resolve) => {
    const testProcess = spawn('npx', ['playwright', 'test', 'offercent-login.test.js'], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    testProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(data.toString());
    });

    testProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(data.toString());
    });

    testProcess.on('close', (code) => {
      console.log(`Test process exited with code ${code}`);
      
      const success = code === 0;
      const testPassed = stdout.includes('passed') && !stdout.includes('failed');
      
      resolve({
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: success ? 'Offercent login test executed successfully' : 'Test execution completed with errors',
          timestamp: new Date().toISOString(),
          testResults: {
            exitCode: code,
            stdout: stdout,
            stderr: stderr,
            passed: testPassed,
            failed: !testPassed,
          },
          success: success,
        }),
      });
    });

    testProcess.on('error', (error) => {
      console.error('Failed to start test process:', error);
      resolve({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Failed to start test process',
          timestamp: new Date().toISOString(),
          error: error.message,
          success: false,
        }),
      });
    });
  });
};