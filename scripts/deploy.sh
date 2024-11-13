#!/bin/bash

PNPM="/root/.local/share/pnpm/pnpm"
PM2="/root/.nvm/versions/node/v22.11.0/bin/pm2"

$PNPM install
$PNPM build

$PM2 restart apps/server/ecosystem.config.js --env production || $PM2 start apps/server/ecosystem.config.js --env production

echo "deploy success"