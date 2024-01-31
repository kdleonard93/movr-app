#!/usr/bin/env bash

mkdir -p deployments
zip -r deployments/deploy-golang-`date +"%Y%m%d-%H%M%S"`.zip \
    ssl/*.crt \
    web/static \
    .env \
    *.go \
    scripts/build.sh \
    movr/* \
    txn/* \
    models/* \
    Buildfile \
    go.mod \
    go.sum \
    Procfile
