#!/usr/bin/env bash
set -e

if [ -z "$BUILD_VERSION" ]; then
  echo 'BUILD_VERSION is required'
  exit 1
fi

docker push "example/microservice:$BUILD_VERSION"
docker rmi --force "example/microservice:$BUILD_VERSION"
