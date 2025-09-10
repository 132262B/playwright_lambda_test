# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

항상 개발이 종료된 후 테스트는 docker 이미지를 생성해서 api를 호출하여 테스트를 진행하고 deploy를 시켜서 배포를 진행합니다.

### Docker Local Testing (Lambda Environment)
```bash
docker build -t playwright-lambda -f Dockerfile.chrominum .
```

```bash
docker run -p 9000:8080 playwright-lambda
```

```bash
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```

잘 진행되면 항상 디플로이를 할지 말지 질문 후 아래 명령어를 실행합니다.
```bash
npm run deploy
```

그리고 url을 통해 호출하고, 응답결과와 값을 확인합니다.
### Serverless Logs
```bash
# View Lambda function logs
serverless logs -f runTest -t
```
