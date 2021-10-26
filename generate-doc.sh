#!/usr/bin/env bash

./node_modules/.bin/redoc-cli bundle ./resources/openapi.yaml --title="Request catcher" -o ./docs/index.html
