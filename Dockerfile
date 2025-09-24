# 1단계: Build
FROM node:18-alpine AS builder

WORKDIR /app

# 필요한 패키지 설치
COPY package*.json ./
RUN npm install

# 프로젝트 복사
COPY . .

# 타입스크립트 사용하니까 빌드 전에 필요
RUN npm install typescript -D

# 앱 빌드
RUN npm run build

# 2단계: nginx로 serve
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]