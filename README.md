![PetRadar Logo](frontend/public/gitImg.png)
</br>

<h3 align="center">"실종 동물을 가장 빠르게 찾는 위치 기반 플랫폼"</h3>
<p align="center">위치 기반 신고 · 실시간 알림 · 보호소 연계</p>

</br>

## 🐾 프로젝트 개요

- **프로젝트명:** 반려동물 위치 기반 실종 신고 플랫폼  
- **개발기간:** 2025.06.17 ~ 2025.06.26 (초기 구현) · 이후 배포·검색·보호소 연동 개편  

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
| 데이터 출처 | 공공데이터포털 — 국가동물보호정보시스템 (전국 보호소·구조동물) |

</br>

## 🐾 문제 상황 및 필요성

| 문제점 | 해결 방향 |
|--------|------------|
| 전단지·SNS 중심 → 전달 범위 한정 | 지도에 모아 보여주는 위치 기반 목록 |
| 실시간 제보 부재 | 목격 제보가 달리면 작성자에게 즉각 알림 |
| 보호소 정보가 흩어져 있음 | 전국 구조동물 공공데이터를 같은 화면에 함께, 비슷한 아이가 들어오면 알림 |

</br>

## 🐾 주요 기능

### - 위치 기반 신고 및 알림
- 목격 제보가 달리거나 보호소에 비슷한 아이가 들어오면 글 작성자에게 알림  
- SSE(Server-Sent Events) 기반 실시간 전달  
- Kakao 지도 API 기반 위치 시각화 및 현재 위치 표시  

> 알림은 **SSE**로 보냅니다. WebSocket(STOMP)을 쓰다가 바꿨습니다 — 받는 핸들러가
> 하나도 없어(`@MessageMapping` 0개) 트래픽이 서버→클라이언트 한 방향뿐인데,
> 브로커의 destination·구독 모델과 SockJS 폴백이 하는 일이 없었습니다.
> 바꾸면서 얻은 것은 **자동 재연결**(`EventSource` 내장)과 **토큰이 URL에서 사라진 것**
> 입니다. 치른 비용은 하트비트를 직접 보내는 것과 nginx에 버퍼링·타임아웃을
> 알려주는 것입니다 — SSE는 끝나지 않는 평범한 HTTP 응답이라 "오래 갈 연결"이라고
> 선언할 수단이 없습니다.

### - 검색
- MySQL FULLTEXT 전문 검색 (제목, 내용, 이름, 품종, 실종장소)  
- ngram 파서로 한국어 부분 일치 — 조사가 붙어 있어도 찾습니다 (`구로` → `서울 구로구`)  
- 칼럼별 가중치 — 품종(×3) > 제목·실종장소(×2) > 전체(×1). 목격자는 품종과 장소로 찾습니다  
- 오타·약칭 보정 (`몰티즈` → `말티즈`, `포메` → `포메라니안`)  
- 표기가 둘 다 쓰이는 품종은 함께 검색 (`진도견` ↔ `진돗개`, `한국 고양이` ↔ `코리안숏헤어`)  

> 검색용 FULLTEXT 인덱스는 기동 시 `FullTextIndexInitializer`가 없으면 만듭니다.
> `ddl-auto=update`가 파서를 지정한 인덱스를 만들어 주지 못하기 때문입니다.
> 손으로 다시 만들어야 할 때는 `backend/src/main/resources/db/fulltext-index.sql`을 쓰세요.

### - 보호소 연계
- 공공데이터포털(국가동물보호정보시스템)로 **전국** 보호소·보호동물 조회  
- 인증키는 서버에만 두고 백엔드가 대신 호출합니다 — 보호가 끝난 개체(입양·반환·폐사)도 서버에서 걸러집니다  
- 전국 7천여 건을 받는 데 17초가 걸려, 스케줄러가 캐시를 미리 데워 둡니다 (TTL 60분)  
- 실종 신고와 품종·지역이 맞아 보이는 보호동물이 새로 들어오면 작성자에게 알림  

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
| **Frontend** | React 19, React Router 7, Vite 6, Tailwind CSS 4 |
| **Backend** | Spring Boot 3.5, Spring Security, Spring Data JPA |
| **Database** | MySQL 8 |
| **Search** | MySQL FULLTEXT (ngram) |
| **Auth** | JWT (jjwt) |
| **Realtime** | SSE (Server-Sent Events) |
| **API** | Kakao 지도 SDK, 공공데이터포털 국가동물보호정보시스템 |
| **Infra** | Docker Compose, nginx, Let's Encrypt(certbot) |
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
  shelter/       공공데이터 API 클라이언트·캐시, 보호동물 매칭 감시
  notification/  알림 저장 + STOMP 발송
  search/        전문검색 (질의 전처리·오타 교정·인덱스 생성)
  image/         업로드 파일 저장, URL 조립
  security/      SecurityConfig, JWT 필터·프로바이더
  websocket/     STOMP 엔드포인트 설정
  global/        전역 예외 처리
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

보호소·유기동물 화면은 `.env` 의 `DATA_GO_KR_SERVICE_KEY` 로 동작합니다. 비워 두면
그 화면만 비어 보이고 실종·제보·알림은 그대로 됩니다 (발급 방법은 `.env.example` 에
적어 뒀습니다).

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
| mysql | 회원·실종신고·제보 데이터 + 전문검색 인덱스 |

</br>

## 🐾 배포

main 브랜치에 push하면 GitHub Actions가 이미지를 빌드해 GHCR에 올립니다.
서버에서는 소스를 빌드하지 않고 이미지를 받아 띄웁니다.

### 서버 최초 설정 (1회)

`init.sh` 가 Docker 설치부터 인증서 발급·갱신 cron 등록까지 한 번에 합니다.
서버 안에서 할 수 있는 일만 하므로, 콘솔에서 사람이 해야 하는 준비가 먼저입니다
(전체 목록은 아래 ["서버에서 손으로 해야 하는 일"](#-서버에서-손으로-해야-하는-일)).

| 준비 | 이유 |
|------|------|
| x86(amd64) 인스턴스 | 이미지를 `linux/amd64` 하나로만 빌드합니다. ARM 인스턴스에서는 뜨지 않습니다 |
| 도메인 A 레코드가 서버 IP를 가리킴 (`@`·`www` 둘 다) | Let's Encrypt가 80 포트로 접속해 도메인 소유를 확인합니다 |
| 보안 그룹 80·443 인바운드 개방 | 80이 막혀 있으면 인증서를 받을 수 없습니다 |
| 공공데이터포털 인증키 | 보호소·유기동물 화면이 이 키로 동작합니다 (일반 인증키 **Decoding** 쪽) |
| 카카오 개발자 콘솔에 도메인 등록 | 등록하지 않으면 사이트는 떠도 지도만 안 나옵니다 |
| (선택) IAM 역할 | 로그를 CloudWatch로 보낼 때만. 아래 "로그" 참고 |
| (GHCR 패키지가 비공개일 때) `docker login ghcr.io` | 이미지를 받지 못해 6단계에서 멈춥니다 |

```bash
curl -sSL https://raw.githubusercontent.com/xorwns56/PetRadar/main/init.sh -o init.sh
sudo bash init.sh
```

물어보는 값은 도메인·이메일·Swap 크기·공공데이터 인증키, 그리고 로그를 CloudWatch로
보낼지(보낸다면 AWS 리전)뿐입니다. DB 비밀번호와 JWT 서명 키는 `openssl` 로 만들어
`.env` 에 넣으므로 따로 정할 필요가 없습니다.
HTTPS 없이 IP로만 띄워볼 때는 도메인에 `none` 을 입력합니다 — 나중에 다시 실행하면
그때 인증서까지 처리합니다.
`.env` 가 이미 있으면 그대로 두고 덮어쓸지 한 번 더 묻습니다. 데이터가 있는 서버에서는
반드시 `N` 입니다 — DB 비밀번호를 새로 만들면 이미 초기화된 mysql 볼륨에 붙지 못합니다.

스크립트가 하는 일

1. 패키지 업데이트, Docker 설치, `docker` 그룹에 사용자 추가
2. Swap 생성 — 1GB 메모리에서 MySQL과 JVM을 함께 돌리면 OOM으로 죽습니다
3. (선택) 로그 전송 설정 — 컨테이너가 뜨기 전에 끝냅니다
4. 저장소 clone — https 오버라이드가 `frontend/nginx-https.conf` 를 호스트 경로로 마운트하므로 파일이 서버에 있어야 합니다
5. `.env` 생성 (권한 600). 이미 있으면 그대로 둡니다 — DB 비밀번호를 새로 만들면 이미 초기화된 mysql 볼륨에 붙지 못합니다
6. HTTP 로 기동 — 인증서가 없으면 nginx가 443 설정을 읽다 실패하므로 순서가 중요합니다
7. A 레코드 확인 → 챌린지 경로를 외부에서 직접 가져와 선검증 → 인증서 발급(webroot, nginx를 멈추지 않음) → `COOKIE_SECURE=true` → HTTPS 로 재기동
8. 갱신 cron 등록 (매일 03:00)

> **`-f` 를 빠뜨려 HTTPS가 끊기는 사고를 막기 위해**, 스크립트가 `.env` 에
> `COMPOSE_FILE=docker-compose.yml:docker-compose.https.yml` 을 적어 둡니다.
> 서버에서는 그냥 `docker compose up -d` 라고 써도 HTTPS 설정이 함께 적용됩니다.
> 반대로 HTTPS 없이 띄우려면 `-f docker-compose.yml` 을 명시해야 합니다.

### 이후 배포

저장소 Actions 탭에서 빌드가 끝난 것을 확인하고 서버에서 실행합니다.

```bash
cd ~/PetRadar && ./deploy.sh
```

`git pull`(compose·nginx 설정) → `docker compose pull`(새 이미지) → `up -d` →
API가 200을 주는지 확인까지 합니다. `latest` 태그는 이름이 그대로라 `pull` 없이
`up -d` 만 하면 기존 이미지를 재사용합니다.

`up -d` 는 컨테이너를 만든 것까지만 보장하므로, 백엔드가 기동에 실패해 재시작을
반복해도 성공처럼 보입니다. 그래서 `/api/missing/points` (인증 없이 nginx→백엔드→DB를
모두 거치는 경로)가 200을 줄 때까지 최대 90초 기다린 뒤 결과를 알려줍니다.

`.env` 는 저장소에 포함되지 않으므로 한 번 만들어두면 이후 배포에도 유지됩니다.
서버를 재부팅하면 `restart: unless-stopped` 로 컨테이너가 자동으로 다시 뜹니다
(직접 `stop` 한 경우는 켜지지 않습니다).

### 인증서 갱신

`init.sh` 가 등록한 cron이 매일 03:00에 실행합니다.

```
0 3 * * * { cd ~/PetRadar && docker compose run --rm certbot renew --webroot -w /var/www/certbot --quiet && docker compose restart frontend; } >> /var/log/petradar-certbot-renew.log 2>&1
```

`certbot renew` 는 만료가 임박하지 않으면 아무 것도 하지 않으므로 매일 실행해도
됩니다. nginx는 기동 시 읽은 인증서를 계속 쓰므로, 갱신에 성공했을 때만(`&&`)
frontend를 재시작해 새 인증서를 읽게 합니다.

출력은 `/var/log/petradar-certbot-renew.log` 에 모읍니다. certbot 컨테이너는 `--rm` 이고
자기 로그(`/var/log/letsencrypt`)가 볼륨에 없어서, 갱신이 **왜** 실패했는지 볼 수 있는
유일한 창구입니다. Let's Encrypt가 보내는 만료 임박 메일은 "임박했다"만 말합니다.
`--quiet` 라 문제가 없으면 아무것도 쓰지 않으므로 **빈 파일이 정상**입니다.
체인 전체를 `{ }` 로 묶는 이유는, 묶지 않으면 리다이렉션이 마지막 명령에만 붙어
정작 보고 싶은 certbot 출력이 빠지기 때문입니다.

### 로그

기본은 도커의 `json-file` 입니다. 애플리케이션이 로그 파일을 쓰지 않으므로
(Spring·nginx·MySQL 모두 stdout/stderr로 내보냅니다) 로그는 전부 도커를 거칩니다.

```bash
docker compose logs -f backend
```

이 방식은 **배포할 때마다 초기화됩니다.** `up -d` 가 컨테이너를 교체하면 옛
컨테이너의 로그 파일도 함께 지워집니다. 지난주에 무슨 일이 있었는지 보려면
밖으로 내보내야 합니다.

`init.sh` 에서 "CloudWatch로 보낼까요?"에 `y` 라고 답하면 `/etc/docker/daemon.json`
을 만들어 호스트 전체의 로그 드라이버를 `awslogs` 로 바꿉니다. compose가 아니라
호스트 설정에 두는 이유는, 로그를 어디로 보내는지가 애플리케이션의 성질이 아니라
서버의 사정이기 때문입니다 — 그래서 로컬 개발은 AWS 자격증명 없이 그대로 돕니다.

**IAM 역할을 먼저 붙여야 합니다.** 드라이버는 컨테이너를 만들 때 로그 스트림부터
생성하므로, 권한이 없으면 컨테이너가 아예 뜨지 않습니다. `init.sh` 가 작은
컨테이너로 먼저 시험해보고 실패하면 설정을 되돌립니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "logs:CreateLogGroup", "logs:CreateLogStream",
      "logs:PutLogEvents", "logs:DescribeLogStreams"
    ],
    "Resource": "arn:aws:logs:ap-northeast-2:*:log-group:/petradar*"
  }]
}
```

로그 그룹은 `/petradar` 하나이고, 컨테이너 이름이 스트림이 됩니다
(`petradar-backend`, `petradar-frontend`, `petradar-mysql`).

```bash
aws logs tail /petradar --follow
aws logs tail /petradar --since 1h --filter ERROR
```

| 옵션 | 왜 |
|------|------|
| `mode: non-blocking` | 전송이 막혔을 때 애플리케이션의 stdout 쓰기까지 멈추지 않게 합니다. 버퍼가 차면 로그를 버립니다 — 로그를 잃는 쪽이 사이트가 서는 것보다 낫습니다 |
| `awslogs-create-group` | 그룹이 없으면 컨테이너가 기동에 실패하므로 직접 만들게 합니다 |
| 보존기간 14일 | 기본값이 무기한 보관이라 그대로 두면 계속 쌓이고 계속 과금됩니다. `init.sh` 가 aws CLI로 설정을 시도하고, 실패하면 알려줍니다 |
| `awslogs-datetime-format` | 날짜로 시작하는 줄만 새 이벤트로 봅니다. 없으면 자바 스택트레이스가 줄마다 쪼개져, `ERROR` 로 걸러도 첫 줄만 보입니다 |

위 마지막 옵션을 호스트 전체에 걸 수 있도록 **세 컨테이너의 로그가 모두
ISO8601로 시작하게 맞춰 두었습니다.** Spring과 MySQL은 원래 그렇고, nginx만
기본 포맷이 IP로 시작해서 `nginx.conf` 에 포맷을 따로 정의했습니다.

```
2026-10-02T10:14:55+00:00 1.2.3.4 200 0.012 "GET /api/missing HTTP/1.1" 896 "-"
                                      ↑ $request_time — 기본 포맷에는 없습니다
```

응답 시간이 함께 남으므로 "어떤 요청이 느렸나"를 로그로 되짚을 수 있습니다.
포맷 정의는 `nginx.conf`(http 컨텍스트)에 한 번, 사용은 `nginx-routes.conf` 에서
합니다 — 이 파일을 80·443 양쪽 server 블록이 include 하므로 한 번 써 두면 둘 다
적용됩니다. `access_log` 는 아래 레벨에서 다시 쓰면 교체되므로 server 안에서 지정해야
요청이 두 번 기록되지 않습니다.

`nginx-https.conf` 의 HTTP→HTTPS 리다이렉트 블록만 `access_log off` 입니다. 이 파일은
호스트에서 마운트되는데 포맷 정의는 이미지 안에 있어서, `git pull` 로 이 파일만 새것이
되고 이미지가 아직 구버전이면 nginx가 "unknown log format" 으로 기동에 실패합니다 —
사이트가 내려가는 쪽이 더 비쌉니다. 리다이렉트된 요청은 HTTPS로 다시 들어와 그쪽에
기록되므로 잃는 정보도 없습니다.
개발용 `nginx-dev.conf` 는 이 파일들을 쓰지 않아 영향받지 않습니다.

용량의 대부분은 nginx 액세스 로그입니다(요청 하나가 한 줄). 데모 트래픽이면 월
수십 MB로 무료 한도(월 5GB) 안이지만, 줄이려면 업로드 이미지 경로(`location /images/`
— `nginx-api-routes.conf`)와 SPA 정적 파일 경로(`location /` — `nginx-routes.conf`)에
`access_log off` 를 걸면 됩니다. 액세스 로그에는 방문자 IP가 남으므로 보존기간을
짧게 두는 편이 좋습니다.

> `down -v` 는 볼륨까지 지웁니다. DB, 업로드 이미지, 인증서가 모두 삭제되므로
> 서버에서는 사용하지 마세요.

</br>

## 🐾 서버에서 손으로 해야 하는 일

`init.sh` 와 `deploy.sh` 는 **서버 안에서 할 수 있는 일만** 합니다. AWS·DNS·외부 서비스
콘솔에서 사람이 해야 하는 작업은 아래가 전부입니다.

### 최초 1회 — `init.sh` 보다 먼저

| 할 일 | 안 하면 |
|------|------|
| EC2 인스턴스 생성 (Ubuntu, **x86/amd64**) | 이미지를 `linux/amd64` 하나로만 빌드하므로 ARM 인스턴스에서는 컨테이너가 뜨지 않습니다 |
| 보안 그룹 인바운드 22·80·443 개방 | 80이 막히면 Let's Encrypt가 도메인 소유를 확인하지 못해 인증서 발급이 실패합니다 |
| 도메인 A 레코드를 서버 공인 IP로 — `@` 와 `www` 둘 다 | 같은 이유로 발급이 실패합니다. `init.sh` 가 미리 확인하고 멈춰 줍니다 |
| 공공데이터포털에서 인증키 발급 — 아래 두 API에 활용신청(자동승인) 후 **일반 인증키(Decoding)** 복사 | 보호소·유기동물 화면만 비어 보입니다. 나머지 기능은 그대로 동작합니다 |
| 카카오 개발자 콘솔 > 앱 설정 > 플랫폼 > Web 사이트 도메인에 `https://<도메인>` 등록 | 사이트는 떠도 **지도만** 안 나옵니다. 원인을 찾기 어려운 증상입니다 |
| (CloudWatch로 로그를 보낼 때만) IAM 역할을 인스턴스에 연결 | 드라이버가 컨테이너 생성 시점에 로그 스트림부터 만들기 때문에, 권한이 없으면 컨테이너가 **기동조차** 못 합니다 |
| (GHCR 패키지를 비공개로 뒀을 때만) `sudo docker login ghcr.io -u <사용자>` 로 PAT 로그인 | `docker compose pull` 이 실패해 `init.sh` 가 6단계에서 멈춥니다 |

공공데이터포털에서 활용신청할 두 API — 계정당 인증키는 하나이고, 둘 다 신청하면 같은
키로 함께 씁니다. `Encoding` 키를 넣으면 이중 인코딩이 되어
`SERVICE_KEY_IS_NOT_REGISTERED_ERROR` 가 납니다.

- [전국동물보호센터정보표준데이터](https://www.data.go.kr/data/15025454/standard.do) — 보호소 좌표
- [국가동물보호정보시스템 구조동물 조회](https://www.data.go.kr/data/15098931/openapi.do) — 보호 중인 동물

> 카카오 AppKey는 `frontend/src/lib/kakaoMap.js` 에 들어 있습니다(브라우저에 노출되는
> 클라이언트 키라 도메인 제한으로 보호합니다). 이 저장소를 다른 도메인에 올리는 경우엔
> 자기 앱의 AppKey로 바꾸고, 그 도메인을 콘솔에 등록해야 합니다.

### `init.sh` 직후

| 할 일 | 안 하면 |
|------|------|
| 한 번 로그아웃하고 다시 접속 | `usermod -aG docker` 는 재로그인 뒤에 적용되므로 `deploy.sh` 가 docker에 붙지 못합니다 (`sudo ./deploy.sh` 로도 됩니다) |
| (CloudWatch를 켠 경우) 로그 그룹 `/petradar` 의 보존기간 확인 | 기본값이 무기한 보관이라 계속 쌓이고 계속 과금됩니다. `init.sh` 가 aws CLI로 14일을 시도하고 실패하면 알려 주는데, EC2에 aws CLI가 없으면 그 경로로 실패합니다 |

### 배포할 때마다

| 할 일 | 안 하면 |
|------|------|
| 저장소 Actions 탭에서 빌드 초록불 확인 후 `./deploy.sh` | 아직 올라가지 않은 이미지를 받아 이전 버전이 그대로 뜹니다. `latest` 태그라 이름만으로는 구분되지 않습니다 |

기본 도메인(`petradar.site`)이 아닌 도메인으로 세팅했다면 `init.sh` 가 `sed` 로
`frontend/nginx-https.conf` 를 고쳐 둡니다. 이 파일이 수정 상태라 이후 `git pull` 이
막히는데, `deploy.sh` 는 pull만 건너뛰고 이미지 갱신은 계속합니다. compose·nginx 설정이
바뀐 배포에서는 직접 해결해야 합니다.

```bash
git stash && git pull --ff-only && git stash pop   # 충돌하면 도메인만 다시 바꿔 넣는다
```

### 백업 — 자동화되어 있지 않음

DB와 업로드 이미지는 도커 볼륨에만 있습니다. 필요하면 손으로 받아 둡니다.

```bash
# DB
docker compose exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" petradar_db' \
  > ~/petradar-$(date +%F).sql

# 업로드 이미지 (볼륨 이름은 docker volume ls 로 확인)
docker run --rm -v petradar_uploads:/data -v ~:/backup alpine \
  tar czf /backup/petradar-uploads-$(date +%F).tgz -C /data .
```

`.env` 에는 DB 비밀번호와 JWT 서명 키가 들어 있고 저장소에 없습니다. 서버를 새로
만들면 로그인 세션이 전부 풀리므로, 유지해야 한다면 이 파일도 함께 보관합니다.

</br>

## 🐾 기대 효과

- 실종 동물 발견 시간 단축  
- 보호소 연계를 통한 구조 성공률 향상  
- 위치 기반 실시간 알림으로 정보 전달 범위 확장  

</br>

📎 본 프로젝트는 반려동물 실종 시 빠른 신고·알림·구조 지원을 목표로 하는 위치 기반 웹 플랫폼입니다.
