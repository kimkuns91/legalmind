# Node.js 20 LTS 이미지를 기반으로 함
FROM node:20-slim

# 작업 디렉토리 설정
WORKDIR /app

# Puppeteer 의존성 설치
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    fonts-nanum \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 패키지 파일 복사
COPY package.json yarn.lock ./

# 의존성 설치
RUN yarn install

# 소스 코드 복사
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# 빌드
RUN yarn build

# 포트 설정
EXPOSE 3000

# 실행
CMD ["yarn", "start"] 