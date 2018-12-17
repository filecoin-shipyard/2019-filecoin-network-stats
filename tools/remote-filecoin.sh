#!/usr/bin/env bash

ID=$1
CMD=$2
ssh mslipper@filecoin-infra.dev.kyokan.io "bash -l -c \"/home/mslipper/go/bin/iptb run $ID -- go-filecoin $CMD\""