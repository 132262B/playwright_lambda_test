const { spawn } = require('child_process');

exports.runTest = async (event) => {
  console.log('Starting Playwright test execution...');

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
          message: success ? 'Playwright test executed successfully' : 'Test execution completed with errors',
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