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
| **Frontend** | React, React Router, Vite, Tailwind CSS |
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

## 🐾 프로젝트 구조

### 백엔드 — 도메인별 패키지

레이어별(`controller/`, `service/`, `repository/`)이 아니라 **도메인별**로 나눕니다.
한 폴더 안에 Entity · DTO · Repository · Service · Controller가 함께 있어,
기능 하나를 고칠 때 폴더 하나만 열면 됩니다.

```
com.example.PetRadar
  auth/          로그인·회원가입·로그아웃·중복확인
  user/          회원 정보 (User가 refreshToken도 보관), OAuthAccount
  missing/       실종 신고 글 (CRUD)
  report/        목격 제보 글 (실종 글에 종속)
  notification/  알림 저장 + STOMP 발송
  search/        Elasticsearch 색인·검색·재색인
  image/         업로드 파일 저장, URL 조립
  security/      SecurityConfig, JWT 필터·프로바이더
  websocket/     STOMP 엔드포인트 설정
```

도메인 폴더 안의 역할 분담 (`missing/` 기준)

| 파일 | 역할 |
|------|------|
| `Missing.java` | JPA 엔티티 — DB 테이블의 모양 |
| `MissingRequest.java` | **들어오는** 요청 본문 — 클라이언트가 정해도 되는 값만 |
| `MissingDTO.java` | **나가는** 응답 — `from(엔티티, imageBaseUrl)`로 만든다 |
| `MissingRepository / Service / Controller` | 조회·업무 규칙·엔드포인트 |

요청과 응답 DTO를 나눈 이유는 **엔티티를 API 경계에 노출하지 않기 위해서**입니다.
엔티티를 그대로 받으면 클라이언트가 `id`·`user`·`createdAt`까지 실어 보낼 수 있습니다.

</br>

### 프론트엔드 — 타입별 구조

```
src/
  api/           서버와 말하는 곳 (URL은 이 폴더 밖에 없다)
  components/
    ui/          업무를 모르는 재사용 부품
    layout/      화면 껍데기와 앱 전역 크롬
    auth/ home/ missing/ notification/ shelter/ mypage/
                 특정 도메인의 데이터 모양을 아는 컴포넌트
  contexts/      앱에 하나만 존재해야 하는 상태 (Provider 있음)
  hooks/         부를 때마다 각자의 상태를 갖는 재사용 로직
  pages/         라우트 1:1
  lib/           외부 세계와 붙는 어댑터 (카카오 지도 SDK 로더)
  utils/         순수 함수·상수
```

폴더를 고르는 기준

| 갈림길 | 기준 |
|------|------|
| `ui/` vs 도메인 폴더 | **업무를 아는가.** `Button`은 '실종'을 모르고, `MissingItem`은 `missingDTO`의 필드명을 안다 |
| `contexts/` vs `hooks/` | **Provider가 있는가.** 전역에 하나뿐인 상태는 context, 부를 때마다 새로 생기는 로직은 hook |
| `lib/` vs `utils/` | **부수효과가 있는가.** `loadKakaoMap()`은 문서에 `<script>`를 붙이고, `cn()`은 문자열만 다룬다 |
| `api/` vs `hooks/` | **React를 아는가.** api는 `Promise<데이터>`를 돌려주는 순수 함수, 상태·로딩은 부르는 쪽 몫 |

스타일은 Tailwind 유틸리티로 작성하고, 색·글꼴·그림자 토큰은 `index.css`의 `@theme`
한 곳에 모읍니다. CSS 파일은 `components/missing/MissingMap.css` 하나만 남아 있는데,
카카오 지도가 JSX 밖에서 문서에 직접 꽂는 마커 DOM이라 유틸리티로 다룰 수 없기 때문입니다.

</br>

## 🐾 로컬 실행 방법

### 개발

소스를 고치면 바로 반영되는 개발용 스택입니다.

```bash
cp .env.example .env                        # 최초 1회
docker compose -f docker-compose.dev.yml up
```

접속: http://localhost

| | 반영 방식 |
|------|------|
| 프론트엔드 | Vite HMR — 저장하면 새로고침 없이 바뀐 부분만 교체 |
| 백엔드 | `gradle classes --continuous` 가 재컴파일하고 DevTools가 재시작 (약 0.5초) |

운영과 다른 점은 `location /` 하나뿐입니다. 운영은 빌드된 정적 파일을 서빙하고,
개발은 Vite dev 서버로 넘깁니다. `/api`·`/images` 라우팅은 같은 파일
(`nginx-api-routes.conf`)을 씁니다.

디버거는 `localhost:5005` 에 Remote JVM Debug 로 붙입니다.
API를 직접 찔러보려면 `localhost:8080`, nginx 없이 프론트만 보려면 `localhost:5173`
(이쪽은 `/images` 가 없어 업로드 이미지가 보이지 않습니다).

카카오 지도를 로컬에서 쓰려면 카카오 개발자 콘솔의 Web 사이트 도메인에
`http://localhost` 를 등록해야 합니다.

### 배포 구성 확인

실제 배포와 같은 이미지로 띄워 확인할 때 씁니다.

```bash
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
