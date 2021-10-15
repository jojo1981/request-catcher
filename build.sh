#!/usr/bin/env bash

set -e

command -v git >/dev/null 2>&1 || { echo >&2 "I require \`git\` but it's not installed. Aborting."; exit 1; }
command -v curl >/dev/null 2>&1 || { echo >&2 "I require \`curl\` but it's not installed. Aborting."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo >&2 "I require \`docker\` but it's not installed. Aborting."; exit 1; }

function docker_tag_exists() {
    curl --silent -f -lSL https://index.docker.io/v1/repositories/"$1"/tags/"$2" > /dev/null 2>&1
}

git fetch --tags >/dev/null 2>&1 || { echo >&2 "Could NOT fetch git tags."; exit 1; }

TAG="$(git describe --exact-match --abbrev=0 2>/dev/null || echo "")"
if [[ -z "${TAG}" ]]; then
  echo "Could NOT determine last created GIT tag"
  exit 2;
fi

VENDOR="jojo1981/request-catcher"
DOCKER_IMAGE_NAME="${VENDOR}:${TAG}"

if docker_tag_exists "${VENDOR}" "${TAG}"; then
  echo "For the latest git tag: \`$TAG\` already an image has been build: \`$DOCKER_IMAGE_NAME\`"
  exit 3;
fi

echo "Build from git tag: \`${TAG}\`"
echo "Build image: \`${DOCKER_IMAGE_NAME}\`"

docker build --force-rm -t "${VENDOR}:latest" -t "${DOCKER_IMAGE_NAME}" .
docker push "${VENDOR}"
