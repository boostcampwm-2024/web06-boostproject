#!/bash/bash

git fetch
git pull

pnpm install
pnpm build

pm2 restart harmony-api || pm2 start apps/server/dist/main.js --name harmony-api

echo "deploy success"