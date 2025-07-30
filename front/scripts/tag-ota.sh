#!/bin/bash

ENV=$1         # prod or staging
VERSION=$2     # 예: 3.3.3
RUNTIME=$3     # 예: 1.0.0

if [ -z "$ENV" ] || [ -z "$VERSION" ] || [ -z "$RUNTIME" ]; then
  echo "❌ 사용법: ./tag-ota.sh <env> <version> <runtimeVersion>"
  echo "예: ./tag-ota.sh staging 3.3.3 1.0.0"
  exit 1
fi

# 타임스탬프 생성
TIMESTAMP=$(date +%Y%m%d-%H%M)

# 태그 생성
TAG="ota-$ENV-v$VERSION-r$RUNTIME-$TIMESTAMP"

# Git 태그 생성 및 푸시
git tag $TAG
git push origin $TAG

echo "✅ OTA tag pushed: $TAG"
