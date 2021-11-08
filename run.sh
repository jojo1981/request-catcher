#!/usr/bin/env bash

set -e

mkdir -p logs

IMAGE_NAME=request-catcher-image
CONTAINER_NAME=request-catcher-container
LOCAL=false

NODE_ENV=production
USE_REDIS=${USE_REDIS:-false}
REDIS_HOST=127.0.0.1
REDIS_PORT=${REDIS_PORT:-6379}
SERVER_HOSTNAME=${SERVER_HOSTNAME:-localhost}
SSL_ENABLED=false
WEB_SERVER_BIND_PORT=${WEB_SERVER_BIND_PORT:-80}
WEB_SERVER_BIND_ADDRESS=${WEB_SERVER_BIND_ADDRESS:-0.0.0.0}
SOCKET_SERVER_BIND_PORT=${SOCKET_SERVER_BIND_PORT:-3000}
SOCKET_SERVER_BIND_ADDRESS=${SOCKET_SERVER_BIND_ADDRESS:-0.0.0.0}

function helpMenu {
    echo ""
    echo " Usage: run.sh [flags]"
    echo ""
    echo " -h, --help                          Output usage information"
    echo " --local, -l                         Run local and not in a docker container"
    echo " --dev, -d                           Run in development mode"
    echo " --use-redis                         Use a redis server for storage instead of memory"
    echo " --redis-host <host>                 The hostname of the redis server to connect with when redis is enabled"
    echo " --redis-port <port>                 The port of the redis server to connect with when redis is enabled"
    echo " --hostname <hostname>               The hostname to use for generating endpoint urls"
    echo " --web-server-port <port>            The web server port to listen on"
    echo " --web-server-bind <address>         The web server address to bind on"
    echo " --socket-server-port <port>         The socket server port to listen on"
    echo " --socket-server-bind <address>      The socket server address to bind on"
    exit
}

while [[ ! $# -eq 0 ]]; do
    case "$1" in
        --help | -h)
            helpMenu
            ;;
        --local | -l)
            LOCAL=true
            ;;
        --dev | -d)
            NODE_ENV=development
            ;;
        --ssl)
          SSL_ENABLED=true
            ;;
        --use-redis)
            USE_REDIS=true
            ;;
        --redis-host)
            REDIS_HOST="$2"
            shift
            ;;
        --redis-port)
            REDIS_PORT="$2"
            shift
            ;;
        --hostname)
            SERVER_HOSTNAME="$2"
            shift
            ;;
        --web-server-port)
            WEB_SERVER_BIND_PORT="$2"
            shift
            ;;
        --web-server-bind)
            WEB_SERVER_BIND_ADDRESS="$2"
            shift
            ;;
        --socket-server-port)
            SOCKET_SERVER_BIND_PORT="$2"
            shift
            ;;
        --socket-server-bind)
            SOCKET_SERVER_BIND_ADDRESS="$2"
            shift
            ;;
    esac
    shift
done

if ${LOCAL}; then
  NODE_ENV=${NODE_ENV} \
  USE_REDIS=${USE_REDIS} \
  REDIS_HOST=${REDIS_HOST} \
  REDIS_PORT=${REDIS_PORT} \
  SERVER_HOSTNAME=${SERVER_HOSTNAME} \
  WEB_SERVER_BIND_ADDRESS=${WEB_SERVER_BIND_ADDRESS} \
  WEB_SERVER_BIND_PORT=${WEB_SERVER_BIND_PORT} \
  SOCKET_SERVER_BIND_ADDRESS=${SOCKET_SERVER_BIND_ADDRESS} \
  SOCKET_SERVER_BIND_PORT=${SOCKET_SERVER_BIND_PORT} \
  SSL_ENABLED=${SSL_ENABLED} \
  yarn dev
else
    docker build --force-rm -t ${IMAGE_NAME} .
    docker run --rm \
    -p "${WEB_SERVER_BIND_PORT}":"${WEB_SERVER_BIND_PORT}" \
    -p "${SOCKET_SERVER_BIND_PORT}":"${SOCKET_SERVER_BIND_PORT}" \
    -e NODE_ENV=${NODE_ENV} \
    -e USE_REDIS=${USE_REDIS} \
    -e REDIS_HOST="${REDIS_HOST}" \
    -e REDIS_PORT="${REDIS_PORT}" \
    -e SERVER_HOSTNAME="${SERVER_HOSTNAME}" \
    -e WEB_SERVER_BIND_ADDRESS="${WEB_SERVER_BIND_ADDRESS}" \
    -e WEB_SERVER_BIND_PORT="${WEB_SERVER_BIND_PORT}" \
    -e SOCKET_SERVER_BIND_ADDRESS="${SOCKET_SERVER_BIND_ADDRESS}" \
    -e SOCKET_SERVER_BIND_PORT="${SOCKET_SERVER_BIND_PORT}" \
    -e SSL_ENABLED=${SSL_ENABLED} \
    -v "${PWD}"/logs:/data/logs \
    --name ${CONTAINER_NAME} ${IMAGE_NAME}
fi
