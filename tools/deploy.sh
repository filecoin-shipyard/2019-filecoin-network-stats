#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )/../"
echo "Deploying directory $DIR"
rsync --delete -rvzP --exclude=node_modules --exclude=.idea --exclude=.iml --exclude=.git --exclude=dist -e ssh $DIR mslipper@filecoin-infra.dev.kyokan.io:/home/mslipper/filecoin-network-stats
ssh mslipper@filecoin-infra.dev.kyokan.io <<CMD
cd /home/mslipper/filecoin-network-stats/common
npm i
npm run build
cd ../backend
npm i
npm run build
DATABASE_URL='postgresql://stats:password@localhost:5432/filecoin-network-stats' ./node_modules/.bin/db-migrate up
CMD

ssh -t mslipper@filecoin-infra.dev.kyokan.io "sudo supervisorctl restart backend"