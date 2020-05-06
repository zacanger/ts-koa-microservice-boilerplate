#!/usr/bin/env bash

docker run -v "$PWD:/mnt" koalaman/shellcheck scripts/*.sh
docker run -i hadolint/hadolint < Dockerfile
