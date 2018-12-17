#!/usr/bin/env bash
set -e

ssh mslipper@filecoin-infra.dev.kyokan.io 'echo "testdata" > /tmp/test.txt'
CID=`./remote-filecoin.sh 1 'client import /tmp/test.txt' | tail -n +3 | head -n 1`
ASK_JSON=`./remote-filecoin.sh 0 'client list-asks --enc=json' | tail -n +3 | head -n 1`
MINER=`echo $ASK_JSON | jq .Miner -r`
ASK_ID=`echo $ASK_JSON | jq .ID -r`

echo "CID: $CID"
echo "Miner: $MINER"
echo "Ask ID: $ASK_ID"

./remote-filecoin.sh 1 "client propose-storage-deal $MINER $CID $ASK_ID 10000"