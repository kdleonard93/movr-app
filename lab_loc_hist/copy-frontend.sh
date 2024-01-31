#!/usr/bin/env bash
set -o allexport; source .env; set +o allexport

echo "Running copy-frontend.sh at location $(pwd)"

# The directory that contains the source code for the react.js front end
FRONTEND_SRC_DIR=../movr_frontend_loc_hist

if [ -d $FRONTEND_SRC_DIR/build ]; then rm -r $FRONTEND_SRC_DIR/build; fi
(cd $FRONTEND_SRC_DIR && yarn && yarn build)

if [ -d $STATIC_FRONTEND_DIR ]; then rm -r $STATIC_FRONTEND_DIR; fi
mkdir -p $STATIC_FRONTEND_DIR
cp -r $FRONTEND_SRC_DIR/build/. $STATIC_FRONTEND_DIR

