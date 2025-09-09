
## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. Docker를 사용한 로컬 실행 (Lambda 환경 시뮬레이션)

#### Docker 이미지 빌드
```bash
docker build -t playwright-lambda -f Dockerfile.chrominum .
```

#### Docker 컨테이너 실행
```bash
docker run -p 9000:8080 playwright-lambda
```

# 핸들러 테스트
```bash
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```