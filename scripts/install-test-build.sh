#!/usr/bin/env bash

set -e

if [ -z "$BUILD_VERSION" ]; then
  echo 'BUILD_VERSION is required'
  exit 1
fi

npm ci --no-optional

npm run build

rm -rf node_modules
npm ci --production --no-optional

docker build \
  -f "scripts/Dockerfile" \
  -t "example/microservice:$BUILD_VERSION" \
  .
