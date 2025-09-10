#!/bin/bash

ENV=$1         # 예: staging, prod
PLATFORM=$2    # 예: android, ios
VERSION=$3     # 예: 3.3.3
BUILD=$4       # 예: versionCode(121) or buildNumber(8)
RUNTIME=$5     # 예: 1.0.0

if [ -z "$ENV" ] || [ -z "$PLATFORM" ] || [ -z "$VERSION" ] || [ -z "$BUILD" ] || [ -z "$RUNTIME" ]; then
  echo "❌ 사용법: ./tag-build.sh <env> <platform> <version> <buildNumber/versionCode> <runtimeVersion>"
  echo "예: ./tag-build.sh staging android 3.3.3 121 1.0.0"
  echo "예: ./tag-build.sh prod ios 3.4.1 8 3.4.1"
  exit 1
fi

TAG="app-$ENV-$PLATFORM-v$VERSION+$BUILD+r$RUNTIME"

git tag $TAG
git push origin $TAG

echo "✅ Build tag pushed: $TAG"
