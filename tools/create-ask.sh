#!/usr/bin/env bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
MINER_ADDR=`$DIR/remote-filecoin.sh 0 'config mining.minerAddress' | grep -oi '"fc.*"' | tr -d '"'`
MINER_OWNER_ADDR=`$DIR/remote-filecoin.sh 0 "miner owner $MINER_ADDR" | grep -oi 'fc[a-z0-9]*'`
CID=`$DIR/remote-filecoin.sh 0 "miner add-ask --from=$MINER_OWNER_ADDR $MINER_ADDR $1 5 --price=1 --limit=10" | tail -n +3 | head -n 1`
echo "Waiting on $CID to be mined..."
$DIR/remote-filecoin.sh 0 "message wait $CID"