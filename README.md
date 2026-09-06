![PetRadar Logo](frontend/public/gitImg.png)
</br>

<h3 align="center">"실종 동물을 가장 빠르게 찾는 위치 기반 플랫폼"</h3>
<p align="center">위치 기반 신고 · 실시간 알림 · 보호소 연계</p>

</br>

## 🐾 프로젝트 개요

- **프로젝트명:** 반려동물 위치 기반 실종 신고 플랫폼  
- **개발기간:** 2025.06.16 ~ 2025.06.26  

</br>

## 🐾 프로젝트 배경 및 목적

### - 배경
매년 수많은 반려동물이 실종되지만, 여전히 전단지 부착이나 SNS 공유에 의존하는 방식이 대부분입니다.  

- 기존 방식은 **정보 전달 범위와 속도에 한계** 존재  
- 실종 직후 빠른 대응이 어려워 구조 가능성 저하  
- 보호소와의 정보 공유 체계 부족  

### - 목적
- 위치 기반 등록 및 알림 제공을 통한 **빠른 정보 전달**  
- 보호소와 사용자 간 연결로 **구조 효율성 강화**  
- 실종 동물의 **발견 및 구조 성공률 향상**

</br>

## 🐾 주요 사용자 및 환경

| 구분 | 설명 |
|------|------|
| 주요 사용자 | 반려동물을 잃어버린 보호자, 주변 목격자 |
| 행동 특성 | 실시간 알림 필요, 간편한 제보 기능 선호 |
| 사용 동기 | 실종 직후 빠른 신고와 주변 네트워크 활용 |
| 사용 환경 | PC, 모바일 웹 |
| 협력 기관 | 지역 동물 보호소, 지자체 |

</br>

## 🐾 문제 상황 및 필요성

| 문제점 | 해결 방향 |
|--------|------------|
| 전단지·SNS 중심 → 전달 범위 한정 | 위치 기반 알림 제공 |
| 실시간 제보 부재 | 주변 사용자에게 즉각 알림 발송 |
| 보호소와 연계 부족 | 공공데이터 API 연동 통한 협력 체계 마련 |

</br>

## 🐾 주요 기능

### - 위치 기반 신고 및 알림
- 실종 동물 등록 시 전체 사용자에게 알림, 목격 제보 시 작성자에게 알림  
- WebSocket(STOMP) 기반 실시간 전달  
- Kakao 지도 API 기반 위치 시각화 및 현재 위치 표시  

### - 검색
- Elasticsearch 전문 검색 (제목, 내용, 이름, 품종, 실종장소)  
- 품종·실종장소에 가중치를 두어 목격자의 검색 패턴을 반영  
- 오타 및 표기 흔들림 보정 (말티즈 ↔ 몰티즈)  

### - 정보 공유
- 공공데이터 API를 통한 보호소 정보 제공  
- 실종 동물 현황 DB 저장 및 관리  

### - 사용자 관리
- 회원가입 및 로그인  
- JWT 인증 (Access Token 10분 / Refresh Token 24시간)  
- Refresh Token을 서버에 보관해 로그아웃 시 즉시 무효화  

### - 게시판 기능
- 실종 신고 및 목격 제보 (CRUD)  
- 이미지 업로드 및 첨부  

</br>

## 🐾 사용 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | React, React Router, Vite |
| **Backend** | Spring Boot 3.5, Spring Security, Spring Data JPA |
| **Database** | MySQL 8 |
| **Search** | Elasticsearch 8.15 |
| **Auth** | JWT (jjwt) |
| **Realtime** | WebSocket (STOMP) + SockJS |
| **API** | Kakao 지도 API, 경기데이터드림 유기동물 API |
| **Infra** | Docker Compose, nginx |
| **CI/CD** | GitHub Actions → GHCR |
| **Deployment** | AWS EC2 |

</br>

## 🐾 로컬 실행 방법

Docker Compose로 전체 스택(MySQL, Elasticsearch, 백엔드, nginx)을 함께 띄웁니다.

```bash
cp .env.example .env    # 시크릿 값 입력 (JWT 키는 openssl rand -base64 48)
docker compose build    # 소스에서 이미지 빌드
docker compose up -d
```

접속: http://localhost

| 서비스 | 설명 |
|------|------|
| frontend | nginx — 정적 파일 서빙 및 `/api` 프록시 |
| backend | Spring Boot |
| mysql | 회원·실종신고·제보 데이터 |
| elasticsearch | 검색 인덱스 (기동 시 DB에서 자동 색인) |

</br>

## 🐾 배포

main 브랜치에 push하면 GitHub Actions가 이미지를 빌드해 GHCR에 올립니다.
서버에서는 소스를 빌드하지 않고 이미지를 받아 띄웁니다.

> HTTPS 설정은 `docker-compose.https.yml`에 분리되어 있습니다.
> **인증서를 발급한 뒤부터는 모든 명령에 `-f` 로 두 파일을 함께 지정해야 합니다.**
> 빠뜨리면 frontend가 443 포트와 인증서 설정 없이 다시 만들어져 HTTPS가 끊깁니다.

### 서버 최초 설정 (1회)

도메인의 A 레코드가 서버를 가리키고 80 포트가 열려 있어야 합니다.

```bash
# 1. Docker 설치 (Ubuntu 기준, 설치 후 재로그인)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 2. 저장소 clone
git clone https://github.com/xorwns56/petradar.git ~/PetRadar
cd ~/PetRadar

# 3. 시크릿 생성 (JWT 키는 openssl rand -base64 48 로 생성)
cp .env.example .env
vi .env

# 4. HTTP로 먼저 기동
#    인증서가 없으면 nginx가 기동하지 못하므로 https 오버라이드 없이 띄운다
docker compose up -d

# 5. 인증서 발급
docker compose -f docker-compose.yml -f docker-compose.https.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d petradar.site -d www.petradar.site \
  --email <이메일> --agree-tos --no-eff-email

# 6. .env 의 COOKIE_SECURE 를 true 로 바꾼 뒤 HTTPS 적용
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d
```

### 인증서 갱신 (cron 등록, 1회)

Let's Encrypt 인증서는 90일마다 만료됩니다. `certbot renew`는 만료가 임박하지
않으면 아무 것도 하지 않으므로 매일 실행해도 됩니다.

nginx는 기동 시 읽은 인증서를 계속 사용하므로, 갱신에 성공하면(`&&`) 재시작해야
새 인증서가 반영됩니다.

```bash
crontab -e
```
```
0 3 * * * cd ~/PetRadar && docker compose -f docker-compose.yml -f docker-compose.https.yml run --rm certbot renew --webroot -w /var/www/certbot && docker compose -f docker-compose.yml -f docker-compose.https.yml restart frontend
```

### 이후 배포

```bash
cd ~/PetRadar
git pull              # 설정 파일(docker-compose.yml 등) 변경 반영
docker compose -f docker-compose.yml -f docker-compose.https.yml pull   # 새 이미지
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d
```

`latest` 태그는 이름이 그대로라 `pull` 없이 `up -d`만 하면 기존 이미지를 재사용합니다.
`.env`는 저장소에 포함되지 않으므로 한 번 만들어두면 이후 배포에도 유지됩니다.

서버를 재부팅하면 `restart: unless-stopped` 설정으로 컨테이너가 자동으로 다시 뜹니다.
단, 직접 `stop` 한 경우에는 켜지지 않습니다.

> `down -v` 는 볼륨까지 지웁니다. DB, 업로드 이미지, 인증서가 모두 삭제되므로
> 서버에서는 사용하지 마세요.

> `down -v` 는 볼륨까지 지웁니다. DB, 업로드 이미지, 인증서가 모두 삭제되므로
> 서버에서는 사용하지 마세요.

</br>

## 🐾 기대 효과

- 실종 동물 발견 시간 단축  
- 보호소 연계를 통한 구조 성공률 향상  
- 위치 기반 실시간 알림으로 정보 전달 범위 확장  

</br>

📎 본 프로젝트는 반려동물 실종 시 빠른 신고·알림·구조 지원을 목표로 하는 위치 기반 웹 플랫폼입니다.
