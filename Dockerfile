FROM public.ecr.aws/lambda/nodejs:18

# Install system dependencies and Playwright requirements
RUN yum update -y && \
    yum install -y \
    alsa-lib atk cairo cups-libs dbus-libs expat fontconfig \
    glib2 gtk3 libdrm libX11 libXcomposite libXdamage libXext \
    libXfixes libXrandr libXss libxcb mesa-libgbm nspr nss \
    pango xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi \
    xorg-x11-fonts-cyrillic xorg-x11-fonts-misc xorg-x11-fonts-Type1

# Copy package.json and package-lock.json
COPY package*.json ${LAMBDA_TASK_ROOT}/

# Install Node.js dependencies
RUN npm ci --production --legacy-peer-deps

# Install Playwright browsers (dependencies already installed above)
RUN npx playwright install chromium

# Copy function code
COPY . ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler
CMD [ "handler.runOffercentTest" ]