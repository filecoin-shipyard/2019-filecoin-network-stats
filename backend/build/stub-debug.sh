#!/usr/bin/env bash

find ./node_modules -type d -name "debug" -execdir mv {} {}_old \;
find ./node_modules -type d -name "debug_old" -exec bash -c 'cp -rf ./vendor/debug `dirname $1`' - {} \;
find ./node_modules -type d -name "debug_old" -exec rm -rf {} \;
exit 0