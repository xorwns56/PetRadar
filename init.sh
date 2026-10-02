#!/bin/bash

# =============================================================
# PetRadar 서버 최초 세팅 스크립트 (Ubuntu 기준, 서버당 1회)
#
# Docker 설치 → Swap → 저장소 clone → .env 생성 → HTTP 기동 →
# 인증서 발급 → HTTPS 전환 → 갱신 cron 등록 까지 한 번에 한다.
#
# [사전 준비] 이 스크립트를 실행하기 전에 아래를 먼저 확인하세요.
#
# 1. DNS A 레코드
#    - 도메인(petradar.site, www.petradar.site)이 이 서버의 공인 IP를 가리켜야 한다.
#    - Let's Encrypt가 외부에서 80 포트로 접속해 도메인 소유를 확인하므로,
#      전파되기 전에 발급을 시도하면 실패한다. 스크립트가 한 번 더 확인해 준다.
#
# 2. 보안 그룹(방화벽)
#    - 80, 443 인바운드를 열어 둔다. 80이 막혀 있으면 인증서를 받을 수 없다.
#
# 3. 공공데이터포털 인증키
#    - 보호소·유기동물 탭이 이 키로 동작한다. 없으면 그 화면만 비어 보인다.
#    - 반드시 "일반 인증키(Decoding)" 쪽을 넣는다 (.env.example 참고).
#
# 4. (로그를 CloudWatch로 보낼 때만) IAM 역할
#    - EC2 → 작업 → 보안 → IAM 역할 수정에서 아래 권한을 가진 역할을 붙인다.
#      logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents,
#      logs:DescribeLogStreams  (Resource: arn:aws:logs:<리전>:*:log-group:/petradar*)
#    - 권한이 없으면 컨테이너가 기동조차 못 하므로, 이 스크립트가 확인하고
#      안 되면 로그 설정을 되돌린다.
#
# 서버에서 실행:
#   curl -sSL https://raw.githubusercontent.com/xorwns56/PetRadar/main/init.sh -o init.sh
#   sudo bash init.sh
#
# GHCR 패키지를 비공개로 두었다면 이미지를 받기 전에 로그인이 필요하다.
#   echo <GitHub PAT> | sudo docker login ghcr.io -u xorwns56 --password-stdin
# =============================================================

set -e  # 에러가 나면 즉시 중단한다. 반쯤 세팅된 상태로 넘어가면 원인을 찾기 더 어렵다

# apt가 설정 파일 교체나 서비스 재시작을 물어보면 입력을 기다리며 멈춘다.
# 사람이 안 보고 있을 수 있으니 묻지 않게 한다
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a

# 중간에 죽어도 이미 뜬 컨테이너는 살아 있다. 어디까지 됐는지 알려 준다
trap 'echo ""; echo "중단됐습니다. 이미 기동된 컨테이너는 그대로 둡니다 — docker compose ps 로 확인하세요."' ERR

REPO_URL="https://github.com/xorwns56/PetRadar.git"

# sudo로 실행되므로 $HOME은 root를 가리킨다. 실제 로그인 사용자 기준으로 경로를 잡는다
APP_USER="${SUDO_USER:-ubuntu}"
# /home/<이름>으로 단정하지 않는다. AMI에 따라 홈 경로가 다를 수 있다
APP_HOME="$(getent passwd "$APP_USER" | cut -d: -f6)"
APP_DIR="${APP_HOME:-/home/$APP_USER}/PetRadar"
ENV_FILE="${APP_DIR}/.env"

if [ "$(id -u)" -ne 0 ]; then
  echo "sudo bash init.sh 로 실행해주세요 (패키지 설치·swap 설정에 root 권한이 필요합니다)."
  exit 1
fi

# .env의 키를 바꾸거나, 없으면 추가한다
set_env() {
  local key=$1 value=$2
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

# ------------------------------------------
# 입력값 받기
# ------------------------------------------
# 비밀번호·JWT 키는 묻지 않는다. 사람이 고른 값보다 openssl이 만든 값이 안전하고,
# 어차피 다시 볼 일이 없다 (.env에 적혀 있다).
read -p "도메인 (엔터=petradar.site, HTTPS 없이 IP로만 쓰려면 none): " DOMAIN
DOMAIN=${DOMAIN:-petradar.site}

if [ "$DOMAIN" != "none" ]; then
  # 빈 값이면 certbot이 한참 뒤에야 실패한다. 지금 막는다
  while [ -z "${EMAIL:-}" ]; do
    read -p "이메일 (인증서 만료 알림용): " EMAIL
  done
fi

read -p "Swap 크기 (엔터=2G): " SWAP_SIZE
SWAP_SIZE=${SWAP_SIZE:-2G}
# fallocate는 2GB 같은 표기를 받지 않는다. 틀린 채로 진행하면 3단계에서 죽는다
if ! echo "$SWAP_SIZE" | grep -qE '^[0-9]+[KMG]$'; then
  echo "Swap 크기는 2G, 4G, 512M 처럼 적어주세요 (입력: ${SWAP_SIZE})."
  exit 1
fi

# -s: 인증키는 비밀값이다. 터미널과 스크롤백에 남지 않게 가린다
read -s -p "공공데이터포털 인증키 (일반 인증키 Decoding, 없으면 엔터): " DATA_GO_KR_SERVICE_KEY
echo

# 권한이 없으면 컨테이너가 기동조차 못 하므로 기본값은 "안 보냄"이다
read -p "컨테이너 로그를 CloudWatch로 보낼까요? (IAM 역할이 먼저 붙어 있어야 합니다) [y/N]: " USE_CLOUDWATCH
if [ "$USE_CLOUDWATCH" = "y" ] || [ "$USE_CLOUDWATCH" = "Y" ]; then
  read -p "  AWS 리전 (엔터=ap-northeast-2): " AWS_LOG_REGION
  AWS_LOG_REGION=${AWS_LOG_REGION:-ap-northeast-2}
fi

# ------------------------------------------
# 1. 패키지 업데이트
# ------------------------------------------
echo ""
echo "[1/8] 패키지 업데이트..."
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git openssl

# ------------------------------------------
# 2. Docker 설치
# ------------------------------------------
echo "[2/8] Docker 설치..."
if command -v docker >/dev/null 2>&1; then
  echo "  이미 설치돼 있어 건너뜁니다."
else
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable docker
systemctl start docker

# 배포할 때 sudo 없이 docker를 쓰도록 한다 (적용은 다시 로그인한 뒤부터)
usermod -aG docker "$APP_USER"

# ------------------------------------------
# 3. Swap 설정
# ------------------------------------------
echo "[3/8] Swap 설정 (${SWAP_SIZE})..."
# 프리티어 1GB 메모리로 MySQL과 JVM을 함께 돌리면 OOM으로 컨테이너가 죽는다
if [ -f /swapfile ]; then
  echo "  이미 있어 건너뜁니다."
else
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  # 재부팅 후에도 유지
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 기본값 60은 메모리가 남아 있어도 스왑을 쓴다. MySQL이 스왑으로 밀리면
# 쿼리 지연이 눈에 보이게 늘어나므로, 스왑은 OOM 방지용으로만 남긴다
sysctl -w vm.swappiness=10 >/dev/null
grep -q "^vm.swappiness" /etc/sysctl.conf || echo "vm.swappiness=10" >> /etc/sysctl.conf

# ------------------------------------------
# 4. 로그 전송 설정 (선택)
# ------------------------------------------
echo "[4/8] 로그 전송 설정..."
# compose가 아니라 호스트 설정(daemon.json)에 둔다. compose에 넣으면 로컬
# 개발에도 AWS 자격증명이 필요해지는데, 로그를 어디로 보내는지는 애플리케이션의
# 성질이 아니라 "이 서버가 어디에 보내는가"의 문제다.
#
# 컨테이너가 기동하기 전에 끝내 둔다. 나중에 바꾸면 도커를 재시작해야 하고
# 그때 컨테이너가 전부 함께 내려간다.
if [ "$USE_CLOUDWATCH" = "y" ] || [ "$USE_CLOUDWATCH" = "Y" ]; then
  [ -f /etc/docker/daemon.json ] && cp /etc/docker/daemon.json /etc/docker/daemon.json.bak

  # 시험용 이미지를 설정 "전에" 받아 둔다. 설정 뒤에 받으면 받기 실패와
  # 드라이버 실패를 구분할 수 없어, 멀쩡한 설정을 되돌릴 수 있다
  TEST_IMAGE_OK=n
  docker pull hello-world >/dev/null 2>&1 && TEST_IMAGE_OK=y

  # tag로 컨테이너 이름이 로그 스트림이 된다 — petradar-backend / -frontend / -mysql.
  #
  # awslogs-datetime-format: 날짜로 시작하는 줄만 새 이벤트로 본다. 없으면 자바
  #   스택트레이스가 줄마다 쪼개져 ERROR로 걸러도 첫 줄만 나온다. 세 컨테이너가
  #   모두 ISO8601로 시작하므로(nginx는 log_format cloudwatch) 호스트 전체에 걸어도 된다.
  #
  # non-blocking: 전송이 막혔을 때 애플리케이션의 stdout 쓰기까지 멈추지 않게 한다.
  #               버퍼가 차면 로그를 버린다 — 로그를 잃는 쪽이 사이트가 서는 것보다 낫다
  cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "awslogs",
  "log-opts": {
    "awslogs-region": "${AWS_LOG_REGION}",
    "awslogs-group": "/petradar",
    "awslogs-create-group": "true",
    "tag": "{{.Name}}",
    "awslogs-datetime-format": "%Y-%m-%dT%H:%M:%S",
    "mode": "non-blocking",
    "max-buffer-size": "4m"
  }
}
EOF
  systemctl restart docker
  sleep 5

  # 드라이버는 컨테이너를 만들 때 로그 스트림부터 생성한다. 권한이 모자라면
  # 그 시점에 실패해 컨테이너가 아예 뜨지 않는다 — 로그 설정 때문에 사이트가
  # 내려가는 상황이므로, 작은 컨테이너로 먼저 시험하고 안 되면 되돌린다
  if [ "$TEST_IMAGE_OK" = "n" ]; then
    echo "  시험용 이미지를 받지 못해 드라이버 확인을 건너뜁니다."
    echo "  컨테이너가 뜨지 않으면 /etc/docker/daemon.json 을 지우고"
    echo "  sudo systemctl restart docker 로 되돌리세요."
  elif docker run --rm --name petradar-logtest hello-world >/dev/null 2>&1; then
    echo "  CloudWatch로 보냅니다 (로그 그룹 /petradar)."

    # 보존기간을 걸지 않으면 무기한 보관되어 계속 과금된다
    if command -v aws >/dev/null 2>&1 && \
       aws logs put-retention-policy --log-group-name /petradar \
         --retention-in-days 14 --region "$AWS_LOG_REGION" 2>/dev/null; then
      echo "  보존기간 14일 적용."
    else
      echo "  보존기간을 걸지 못했습니다 — 콘솔에서 /petradar 그룹에 직접 설정하세요."
      echo "  (기본값이 무기한 보관이라 그대로 두면 계속 쌓입니다)"
    fi
  else
    echo "  컨테이너가 로그 드라이버 때문에 기동하지 못했습니다. IAM 역할을 확인하세요."
    echo "  로그 설정을 되돌리고 계속 진행합니다 — 사이트는 정상적으로 뜹니다."
    rm -f /etc/docker/daemon.json
    [ -f /etc/docker/daemon.json.bak ] && mv /etc/docker/daemon.json.bak /etc/docker/daemon.json
    systemctl restart docker
    sleep 5
    USE_CLOUDWATCH=n
  fi
else
  echo "  건너뜁니다 — 로그는 docker compose logs 로 봅니다."
fi

# ------------------------------------------
# 5. 저장소 clone
# ------------------------------------------
echo "[5/8] 저장소 준비 (${APP_DIR})..."
# 소스를 빌드하려는 게 아니라 compose 파일과 frontend/nginx-https.conf가 필요해서다.
# https 오버라이드가 그 설정을 호스트 경로로 마운트하므로 파일이 서버에 있어야 한다.
# root로 clone하면 이후 git pull에 sudo가 필요해지니 로그인 사용자로 받는다
if [ -d "${APP_DIR}/.git" ]; then
  sudo -u "$APP_USER" git -C "$APP_DIR" pull --ff-only || \
    echo "  경고: git pull 실패. 기존 파일로 계속합니다."
else
  sudo -u "$APP_USER" git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# ------------------------------------------
# 6. .env 생성
# ------------------------------------------
echo "[6/8] .env 생성..."
if [ -f "$ENV_FILE" ]; then
  # MYSQL_ROOT_PASSWORD를 새로 만들면 이미 초기화된 mysql 볼륨의 비밀번호와
  # 어긋나 백엔드가 DB에 붙지 못한다. 그래서 기본은 '유지'다
  echo "  이미 .env가 있습니다. 그대로 씁니다 (DB 비밀번호를 새로 만들면 기존 DB에 붙지 못합니다)."
  read -p "  덮어쓸까요? 데이터가 없는 새 서버에서만 y [y/N]: " OVERWRITE
else
  OVERWRITE=y
fi

if [ "$OVERWRITE" = "y" ] || [ "$OVERWRITE" = "Y" ]; then
  # HS256이라 32바이트 미만이면 기동 시점에 예외로 막힌다. 48바이트로 넉넉히 만든다
  cat > "$ENV_FILE" <<EOF
# init.sh가 생성했다. 값을 바꾸면 docker compose up -d 로 다시 띄워야 반영된다
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=')
JWT_ACCESS_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)

# 인증서를 발급한 뒤 이 스크립트가 true로 바꾼다.
# HTTP 환경에서 true면 쿠키가 전송되지 않아 로그인이 풀린다
COOKIE_SECURE=false

DATA_GO_KR_SERVICE_KEY=${DATA_GO_KR_SERVICE_KEY}
EOF
fi

# .env에는 DB 비밀번호와 서명 키가 들어 있다. 다른 사용자가 읽지 못하게 한다
chown "${APP_USER}:${APP_USER}" "$ENV_FILE"
chmod 600 "$ENV_FILE"

# ------------------------------------------
# 7. HTTP로 기동
# ------------------------------------------
echo "[7/8] 컨테이너 기동 (HTTP)..."
# 인증서가 없으면 nginx가 443 설정을 읽다가 기동에 실패하므로, 먼저 HTTP로만 띄운다.
# 스키마와 FULLTEXT 인덱스는 백엔드가 처음 뜰 때 알아서 만든다
docker compose pull || {
  echo ""
  echo "이미지를 받지 못했습니다. GHCR 패키지가 비공개라면 먼저 로그인하세요."
  echo "  echo <GitHub PAT> | sudo docker login ghcr.io -u xorwns56 --password-stdin"
  exit 1
}
docker compose up -d

if [ "$DOMAIN" = "none" ]; then
  echo ""
  echo "======================================"
  echo " 세팅 완료 (HTTP)"
  echo "  http://$(curl -s --max-time 5 https://checkip.amazonaws.com || echo '서버IP') 으로 접속하세요."
  echo ""
  echo " 나중에 도메인을 붙일 때 이 스크립트를 다시 실행하면 인증서까지 처리합니다."
  echo "======================================"
  exit 0
fi

# ------------------------------------------
# 8. 인증서 발급 + HTTPS 전환
# ------------------------------------------
echo "[8/8] 인증서 발급 및 HTTPS 전환..."

# 발급 실패의 대부분은 A 레코드가 아직 이 서버를 가리키지 않아서다.
# 실패를 5분 기다린 뒤 알게 되는 것보다 지금 확인하는 쪽이 싸다
SERVER_IP=$(curl -s --max-time 5 https://checkip.amazonaws.com || true)
DOMAIN_IP=$(getent hosts "$DOMAIN" | awk '{print $1}' | head -1 || true)
if [ -n "$SERVER_IP" ] && [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
  echo "  경고: ${DOMAIN} 이 ${DOMAIN_IP:-'(응답 없음)'} 을 가리킵니다. 이 서버는 ${SERVER_IP} 입니다."
  read -p "  그대로 진행할까요? [y/N]: " PROCEED
  [ "$PROCEED" = "y" ] || [ "$PROCEED" = "Y" ] || {
    echo "  중단합니다. A 레코드를 고치고 다시 실행하세요 (이미 뜬 컨테이너는 그대로 둡니다)."
    exit 1
  }
fi

# 도메인이 기본값과 다르면 nginx 설정의 server_name과 인증서 경로를 바꿔 끼운다
if [ "$DOMAIN" != "petradar.site" ]; then
  sed -i "s/petradar\.site/${DOMAIN}/g" "${APP_DIR}/frontend/nginx-https.conf"
  echo "  nginx-https.conf의 도메인을 ${DOMAIN} 으로 바꿨습니다 (이 파일은 수정 상태라 git pull이 막힐 수 있습니다)."
fi

# Let's Encrypt는 같은 호스트명에 대한 실패를 시간당 5회로 제한한다.
# 발급을 시도해 보고 실패로 알게 되면 그 한도를 깎아먹으므로, 먼저 우리 쪽에서
# 똑같은 경로를 외부에서 가져와 본다 (DNS·80포트·nginx·볼륨을 한 번에 검증한다)
echo "  챌린지 경로 확인 중..."
PING_PATH="/.well-known/acme-challenge/petradar-preflight"
docker compose -f docker-compose.yml -f docker-compose.https.yml run --rm \
  --entrypoint sh certbot -c \
  "mkdir -p /var/www/certbot/.well-known/acme-challenge && echo ok > /var/www/certbot${PING_PATH}"

# frontend는 이 볼륨을 읽기 전용으로 마운트한 상태여야 한다.
# 기본 compose에 마운트가 없던 시절에 띄운 컨테이너라면 여기서 걸러진다
docker compose up -d frontend
for i in $(seq 1 15); do
  if [ "$(curl -s --max-time 5 "http://${DOMAIN}${PING_PATH}" || true)" = "ok" ]; then
    PREFLIGHT=ok
    break
  fi
  sleep 2
done

docker compose -f docker-compose.yml -f docker-compose.https.yml run --rm \
  --entrypoint sh certbot -c "rm -f /var/www/certbot${PING_PATH}"

if [ "${PREFLIGHT:-}" != "ok" ]; then
  echo ""
  echo "  http://${DOMAIN}${PING_PATH} 를 외부에서 가져오지 못했습니다."
  echo "  인증서 발급도 같은 방식으로 실패하니 아래를 확인하고 다시 실행하세요."
  echo "    - 보안 그룹에 80 인바운드가 열려 있는지"
  echo "    - A 레코드가 이 서버(${SERVER_IP:-?})를 가리키는지"
  echo "  사이트는 HTTP로 떠 있습니다: http://${SERVER_IP}"
  exit 1
fi

# webroot 방식이라 nginx를 멈추지 않아도 된다
docker compose -f docker-compose.yml -f docker-compose.https.yml \
  run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --non-interactive --agree-tos --no-eff-email \
  --email "$EMAIL" \
  --cert-name "$DOMAIN" \
  --keep-until-expiring \
  -d "$DOMAIN" -d "www.${DOMAIN}"

# 여기부터는 모든 compose 명령이 https 오버라이드를 함께 읽어야 한다.
# 하나라도 빠뜨리면 frontend가 443·인증서 없이 다시 만들어져 HTTPS가 끊긴다.
# COMPOSE_FILE을 .env에 적어 두면 그냥 `docker compose up -d` 해도 둘 다 읽는다
set_env COMPOSE_FILE "docker-compose.yml:docker-compose.https.yml"
set_env COOKIE_SECURE "true"

docker compose up -d

# 갱신 cron (매일 새벽 3시). certbot renew는 만료가 임박하지 않으면 아무 것도
# 하지 않으므로 매일 돌려도 된다. nginx는 기동 때 읽은 인증서를 계속 쓰므로
# 갱신에 성공했을 때만(&&) frontend를 재시작해 새 인증서를 읽게 한다
# 로그를 남기지 않으면 갱신이 실패해도 아무도 모르고 90일 뒤 조용히 만료된다
CRON_LOG="${APP_DIR}/certbot-renew.log"
CRON_CMD="cd ${APP_DIR} && docker compose run --rm certbot renew --webroot -w /var/www/certbot --quiet && docker compose restart frontend"
( crontab -u "$APP_USER" -l 2>/dev/null | grep -v "certbot renew"; \
  echo "0 3 * * * $CRON_CMD >> ${CRON_LOG} 2>&1" ) | crontab -u "$APP_USER" -
touch "$CRON_LOG" && chown "${APP_USER}:${APP_USER}" "$CRON_LOG"

# 백엔드는 DB 준비를 기다린 뒤 뜨므로, 바로 찔러보면 502가 나올 수 있다
echo "  기동을 기다립니다..."
sleep 20
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "https://${DOMAIN}" || echo "실패")

echo ""
echo "======================================"
echo " 세팅 완료 (https://${DOMAIN} 응답: ${HTTP_CODE})"
echo "  https://${DOMAIN} 으로 접속하세요."
echo ""
echo " DB 비밀번호·JWT 키는 ${ENV_FILE} 에 있습니다 (권한 600)."
echo " 인증서 갱신 로그: ${CRON_LOG}"
if [ "$USE_CLOUDWATCH" = "y" ] || [ "$USE_CLOUDWATCH" = "Y" ]; then
  echo " 컨테이너 로그: aws logs tail /petradar --follow"
fi
echo ""
echo " 이후 배포는 이 한 줄입니다:"
echo "   cd ${APP_DIR} && ./deploy.sh"
echo ""
echo " docker를 sudo 없이 쓰려면 한 번 다시 로그인하세요 (exit 후 재접속)."

# 카카오 AppKey는 도메인 제한으로 보호한다. 새 도메인을 콘솔에 등록하지 않으면
# 사이트는 떠도 지도만 안 나오는데, 원인을 찾기 어려운 증상이라 짚어 준다
if [ "$DOMAIN" != "petradar.site" ]; then
  echo ""
  echo " [남은 수동 작업] 카카오 개발자 콘솔 > 앱 설정 > 플랫폼 > Web 사이트 도메인에"
  echo "   https://${DOMAIN} 을 등록하세요. 등록하지 않으면 지도만 뜨지 않습니다."
fi
echo "======================================"
