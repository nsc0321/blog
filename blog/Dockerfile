# 1단계: 빌드 환경 설정
FROM node:20-alpine AS build

WORKDIR /app

# 패키지 설치를 위한 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 전체 복사 및 빌드 진행
COPY . .
RUN npm run build

# 2단계: 프로덕션 Nginx 실행 환경 설정
FROM nginx:stable-alpine

# 커스텀 nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 1단계에서 빌드된 정적 리소스를 Nginx html 하위의 blog 경로로 복사
COPY --from=build /app/dist /usr/share/nginx/html/blog

# 대시보드 HTML 파일을 루트 index.html로 복사
COPY dashboard.html /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
