#!/bin/bash

# =============================================================
# PetRadar 배포 스크립트 (서버에서 실행)
#
#   ./deploy.sh      이미지 갱신 → 기동 → 확인
#
# main에 push하면 GitHub Actions가 GHCR에 이미지를 올린다. 이 스크립트는
# 그 이미지를 받아 다시 띄우는 일만 한다 — 서버에서 소스를 빌드하지 않는다.
# 빌드가 끝났는지는 저장소 Actions 탭에서 초록불을 확인하고 실행하세요.
#
# 최초 세팅은 init.sh 가 한다. 이 스크립트는 그 뒤로 매번 쓰는 쪽이다.
# =============================================================

set -e

# 어디서 불러도 저장소 루트에서 돌게 한다 (cron에서 호출될 수도 있다)
cd "$(dirname "$0")"

# init.sh가 usermod로 docker 그룹에 넣어도 적용은 다시 로그인한 뒤부터다.
# 그냥 두면 "permission denied ... docker.sock" 라는 원인이 안 보이는 에러가 난다
if ! docker info >/dev/null 2>&1; then
  echo "오류: docker 에 접근할 수 없습니다."
  echo "      init.sh 직후라면 한 번 로그아웃했다가 다시 접속하세요 (docker 그룹 적용)."
  echo "      급하면 sudo ./deploy.sh 로도 됩니다."
  exit 1
fi

if [ ! -f .env ]; then
  echo "오류: .env 가 없습니다. 최초 세팅이라면 sudo bash init.sh 를 먼저 실행하세요."
  exit 1
fi

# 인증서 볼륨은 있는데 COMPOSE_FILE이 비어 있으면, 이대로 up -d 하는 순간
# frontend가 443·인증서 설정 없이 다시 만들어져 HTTPS가 끊긴다.
# init.sh 이전에 손으로 세팅한 서버에서 생길 수 있는 상태라 먼저 막는다
if docker volume ls -q | grep -q "certbot-conf" && ! grep -q "^COMPOSE_FILE=" .env; then
  echo "경고: 인증서 볼륨이 있는데 .env 에 COMPOSE_FILE 이 없습니다."
  echo "      아래 한 줄을 .env 에 추가하면 이후 모든 compose 명령이 HTTPS 설정을 함께 읽습니다."
  echo ""
  echo "      COMPOSE_FILE=docker-compose.yml:docker-compose.https.yml"
  echo ""
  read -p "지금 추가할까요? [Y/n]: " ADD
  if [ "$ADD" != "n" ] && [ "$ADD" != "N" ]; then
    echo "COMPOSE_FILE=docker-compose.yml:docker-compose.https.yml" >> .env
  else
    echo "중단합니다. HTTPS를 유지하려면 -f 두 개를 직접 지정해 실행하세요."
    exit 1
  fi
fi

# ------------------------------------------
# 1~3. 갱신
# ------------------------------------------
echo "[1/4] 설정 파일 갱신 (git pull)..."
# compose 파일이나 nginx 설정이 바뀌었을 수 있다. 이미지에는 들어 있지 않은 파일들이다.
# 도메인 때문에 nginx-https.conf를 고쳤다면 pull이 막히는데, 그래도 이미지 갱신은
# 계속 진행하는 편이 낫다
git pull --ff-only || echo "  건너뜀: git pull 실패 (로컬 수정이 있을 수 있습니다). 이미지만 갱신합니다."

echo "[2/4] 이미지 받기..."
# latest 태그는 이름이 그대로라서, pull 없이 up -d만 하면 기존 이미지를 다시 쓴다
docker compose pull

echo "[3/4] 컨테이너 교체..."
docker compose up -d

# ------------------------------------------
# 4. 떴는지 확인
# ------------------------------------------
# up -d 는 "컨테이너를 만들었다"까지만 보장한다. 백엔드가 기동에 실패해 재시작을
# 반복하는 중에도 성공으로 보이므로, 실제 응답을 받아 봐야 배포가 끝난 것이다
echo "[4/4] 기동 확인..."
# /api/missing/points 는 인증이 필요 없고 nginx→백엔드→DB를 모두 거친다
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 \
    "http://localhost/api/missing/points" || true)
  [ "$CODE" = "200" ] && break
  sleep 3
done

# 이름 없이 남은 예전 이미지를 정리한다. 프리티어 디스크(8GB)는 금방 찬다
docker image prune -f >/dev/null

echo ""
docker compose ps
echo ""
if [ "$CODE" = "200" ]; then
  echo "======================================"
  echo " 배포 완료 — API 응답 200"
  echo "======================================"
else
  echo "======================================"
  echo " 경고: 90초 안에 API가 200을 주지 않았습니다 (마지막 응답: ${CODE:-없음})"
  echo ""
  echo " 로그를 확인하세요:"
  echo "   docker compose logs --tail=50 backend"
  echo "======================================"
  exit 1
fi
