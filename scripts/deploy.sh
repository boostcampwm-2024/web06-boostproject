#!/bin/bash

PNPM="/root/.local/share/pnpm/pnpm"
PM2="/root/.nvm/versions/node/v22.11.0/bin/pm2"

git fetch
git pull

$PNPM install
$PNPM build

$PM2 restart harmony-api || $PM2 start apps/server/dist/main.js --name harmony-api

echo "deploy success"