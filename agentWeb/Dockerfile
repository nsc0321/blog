# 1단계: 빌드 환경 설정
FROM node:20-alpine AS build

WORKDIR /app

# 패키지 설치를 위한 파일 복사
COPY package.json ./

# 의존성 설치
RUN npm install

# 소스 코드 전체 복사 및 빌드 진행
COPY . .
RUN npm run build

# 2단계: 프로덕션 Nginx 실행 환경 설정
FROM nginx:stable-alpine

# 빌드된 정적 리소스를 Nginx html 하위의 agent 경로로 복사
# (Vite base가 /agent/ 이므로 Nginx 내부에서도 /agent/ 경로에 파일이 존재해야 함)
COPY --from=build /app/dist /usr/share/nginx/html/agent

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
