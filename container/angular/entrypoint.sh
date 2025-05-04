#!/bin/bash

set -euo pipefail

pushd /app/

# Install Angular CLI
npm i @angular/cli@v14-lts

# Build dist
./node_modules/.bin/ng build -c production --output-path /dist/

