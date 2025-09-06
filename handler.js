const { spawn } = require('child_process');
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