# Build Stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 80/443 양쪽에서 include 하는 공통 라우팅 규칙
COPY nginx-routes.conf /etc/nginx/nginx-routes.conf
EXPOSE 80
