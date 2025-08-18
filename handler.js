const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

exports.hello = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Hello from Serverless!',
      timestamp: new Date().toISOString(),
      requestId: event.requestContext?.requestId || 'local',
      path: event.path || '/',
      httpMethod: event.httpMethod || event.requestContext?.http?.method || 'GET'
    }),
  };

  return response;
};

exports.runOffercentTest = async (event) => {
  console.log('Starting offercent-login.test execution...');
  
  try {
    // Lambda 환경에서 node와 playwright 실행
    const command = `npx playwright test offercent-login.test.js --reporter=json`;
    
    const { stdout, stderr } = await execAsync(command, { 
      cwd: __dirname,
      env: { 
        ...process.env,
        NODE_PATH: path.join(__dirname, 'node_modules')
      }
    });
    
    let testResults;
    try {
      testResults = JSON.parse(stdout);
    } catch (parseError) {
      testResults = {
        message: 'Test completed but could not parse JSON output',
        stdout: stdout,
        stderr: stderr
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Offercent login test executed successfully',
        timestamp: new Date().toISOString(),
        testResults: testResults,
        success: true
      }),
    };
  } catch (error) {
    console.error('Test execution failed:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test execution failed',
        timestamp: new Date().toISOString(),
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
        success: false
      }),
    };
  }
};