# AWS Lambda Node.js 18 런타임 이미지 사용
FROM public.ecr.aws/lambda/nodejs:18

# package.json 및 package-lock.json 복사
COPY package*.json ${LAMBDA_TASK_ROOT}/

# 시스템 의존성 설치 (Amazon Linux용)
RUN yum update -y && \
    yum install -y \
    alsa-lib atk cairo cups-libs dbus-libs expat fontconfig \
    glib2 gtk3 libdrm libX11 libXcomposite libXdamage libXext \
    libXfixes libXrandr libXss libxcb mesa-libgbm nspr nss \
    pango xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi \
    xorg-x11-fonts-cyrillic xorg-x11-fonts-misc xorg-x11-fonts-Type1 \
    && yum clean all

# Node.js 의존성 설치
RUN npm ci --production --legacy-peer-deps

# Playwright 브라우저만 설치 (의존성은 위에서 설치함)
RUN npx playwright install chromium

# 함수 코드 복사
COPY . ${LAMBDA_TASK_ROOT}

# Lambda 핸들러 설정
CMD [ "handler.runOffercentTest" ]