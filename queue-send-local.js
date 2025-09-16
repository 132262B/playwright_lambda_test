async function sendSQSEventToLocal(testFileName, port = 9002) {
  const sqsEvent = {
    Records: [
      {
        messageId: `msg-${Date.now()}`,
        receiptHandle: `receipt-${Date.now()}`,
        body: JSON.stringify({
          testFileName: testFileName
        }),
        attributes: {
          ApproximateReceiveCount: "1",
          SentTimestamp: Date.now().toString(),
          SenderId: "123456789012",
          ApproximateFirstReceiveTimestamp: Date.now().toString()
        },
        messageAttributes: {},
        md5OfBody: "test-md5-hash",
        eventSource: "aws:sqs",
        eventSourceARN: `arn:aws:sqs:ap-northeast-2:123456789012:test-queue`,
        awsRegion: "ap-northeast-2"
      }
    ]
  };

  const url = `http://localhost:${port}/2015-03-31/functions/function/invocations`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sqsEvent)
    });

    const data = await response.json();
    
    console.log('✅ Lambda 응답 수신:');
    console.log('상태 코드:', response.status);
    console.log('응답 데이터:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ 요청 오류:', error);
    throw error;
  }
}


// CLI에서 실행할 때
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 사용법:');
    console.log('  node queue-send-local.js <테스트파일명> [포트번호]');
    console.log('');
    console.log('📝 예시:');
    console.log('  node queue-send-local.js offercent-login.test.js');
    console.log('  node queue-send-local.js offercent-login.test.js 9002');
    console.log('');
    console.log('💡 기본 포트: 9002');
    process.exit(1);
  }

  let testFileName = args[0];
  let port = 9002;
  
  // 두 번째 인수가 숫자면 포트번호로 처리
  if (args.length >= 2 && !isNaN(args[1])) {
    port = parseInt(args[1]);
  }

  console.log('🎯 로컬 SQS 이벤트 전송 시작');
  console.log(`📂 테스트 파일: ${testFileName}`);
  console.log(`🔌 대상 포트: ${port}`);
  console.log('');

  // 단일 테스트만 실행
  sendSQSEventToLocal(testFileName, port)
    .then(() => {
      console.log('\n✅ 테스트 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 테스트 실패:', error.message);
      process.exit(1);
    });
}

module.exports = {
  sendSQSEventToLocal
};